/**
 * Migration: Move legacy pricing fields to the new USD-base pricing architecture.
 *
 * Idempotent:
 * - Skips documents that already have the new fields populated.
 *
 * What it does:
 * - TeacherCourse:
 *   - Creates `pricing` from legacy fields: price (USD), teacherCurrency, originalPrice.
 * - Availability:
 *   - Creates `pricing.baseAmountUSD` from legacy `price` (+ currency if present).
 * - Booking:
 *   - Backfills `pricingSnapshot` for legacy bookings so refunds remain safe.
 *
 * WHY:
 * - New architecture stores a single source of truth:
 *   - TeacherCourse.pricing.basePriceUSD (hourly)
 *   - Availability.pricing.baseAmountUSD (per slot)
 *   - Booking.pricingSnapshot (payment + payout + FX snapshot)
 *
 * Run:
 *   node backend/scripts/migratePricingToUSDBase.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import { getExchangeRate, convertCurrency } from "../services/exchangeRateService.js";
import { computeSlotBaseAmountUSD, buildUsdExchangeRateSnapshot, roundMoney2 } from "../utils/pricingHelper.js";

dotenv.config();

const resolveMongoUri = () => {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/edunyte"
  );
};

const roundTo = (value, decimals) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

/**
 * IMPORTANT:
 * We use raw MongoDB collections here (not Mongoose models), because we've removed
 * legacy fields from Mongoose schemas. With strict schemas, Mongoose would not
 * hydrate unknown legacy fields from MongoDB, making migration impossible.
 */

const ensureTeacherCoursePricing = async (collections) => {
  let updated = 0;
  const cursor = collections.teacherCourses.find(
    { $or: [{ pricing: { $exists: false } }, { "pricing.basePriceUSD": { $exists: false } }] },
    { projection: { price: 1, currency: 1, teacherCurrency: 1, originalPrice: 1, pricing: 1 } }
  );

  for await (const doc of cursor) {
    const legacyBaseUSD = typeof doc.price === "number" ? doc.price : 0;
    const legacyTeacherCurrency = (doc.teacherCurrency || doc.currency || "USD").toString().toUpperCase();
    const legacyTeacherPrice =
      typeof doc.originalPrice === "number" && doc.originalPrice > 0
        ? doc.originalPrice
        : legacyTeacherCurrency === "USD"
          ? legacyBaseUSD
          : 0;

    let rate = 1;
    if (legacyTeacherCurrency !== "USD") {
      // If we have enough info, reconstruct the original snapshot rate.
      if (legacyTeacherPrice > 0 && legacyBaseUSD > 0) {
        rate = legacyTeacherPrice / legacyBaseUSD;
      } else {
        // Fallback: use current Redis rate (best-effort)
        rate = await getExchangeRate(legacyTeacherCurrency);
      }
    }

    const basePriceUSD = legacyBaseUSD > 0 ? legacyBaseUSD : legacyTeacherCurrency === "USD" ? legacyTeacherPrice : (legacyTeacherPrice > 0 ? legacyTeacherPrice / rate : 0);

    const pricing = {
      basePriceUSD: roundTo(basePriceUSD, 6),
      baseCurrency: "USD",
      teacherPrice: roundTo(legacyTeacherPrice || 0, 2),
      teacherCurrency: legacyTeacherCurrency,
      exchangeRateAtCreation: roundTo(rate, 8),
    };
    await collections.teacherCourses.updateOne({ _id: doc._id }, { $set: { pricing } });
    updated += 1;
  }

  return updated;
};

const ensureAvailabilityPricing = async (collections) => {
  let updated = 0;
  const cursor = collections.availabilities.find(
    { $or: [{ pricing: { $exists: false } }, { "pricing.baseAmountUSD": { $exists: false } }] },
    { projection: { price: 1, currency: 1, duration: 1, teacherId: 1, courseId: 1, pricing: 1 } }
  );

  for await (const doc of cursor) {
    const legacyPrice = typeof doc.price === "number" ? doc.price : 0;
    const legacyCurrency = (doc.currency || "USD").toString().toUpperCase();

    let baseAmountUSD = legacyPrice;
    if (legacyCurrency !== "USD" && legacyPrice > 0) {
      try {
        baseAmountUSD = await convertCurrency(legacyPrice, legacyCurrency, "USD");
      } catch {
        // best-effort fallback
        baseAmountUSD = legacyPrice;
      }
    }

    // If legacy price missing, compute from TeacherCourse (best-effort)
    if (!baseAmountUSD || baseAmountUSD === 0) {
      const tc = await collections.teacherCourses.findOne(
        { teacherId: doc.teacherId, courseId: doc.courseId, status: "approved" },
        { projection: { pricing: 1 } }
      );
      if (tc?.pricing?.basePriceUSD) {
        baseAmountUSD = computeSlotBaseAmountUSD({
          basePriceUSDPerHour: tc.pricing.basePriceUSD,
          durationMinutes: doc.duration,
        });
      }
    }

    const pricing = { baseAmountUSD: roundTo(baseAmountUSD, 6), baseCurrency: "USD" };
    await collections.availabilities.updateOne({ _id: doc._id }, { $set: { pricing } });
    updated += 1;
  }

  return updated;
};

const ensureBookingPricingSnapshot = async (collections) => {
  let updated = 0;
  const cursor = collections.bookings.find(
    { $or: [{ pricingSnapshot: { $exists: false } }, { "pricingSnapshot.baseAmountUSD": { $exists: false } }] },
    { projection: { price: 1, currency: 1, createdAt: 1, duration: 1, teacherCourseId: 1, pricingSnapshot: 1 } }
  );

  for await (const doc of cursor) {
    const legacyPrice = typeof doc.price === "number" ? doc.price : 0;
    const legacyCurrency = (doc.currency || "USD").toString().toUpperCase();
    const at = doc.createdAt ? new Date(doc.createdAt) : new Date();

    let baseAmountUSD = legacyPrice;
    if (legacyCurrency !== "USD" && legacyPrice > 0) {
      try {
        baseAmountUSD = await convertCurrency(legacyPrice, legacyCurrency, "USD");
      } catch {
        baseAmountUSD = legacyPrice;
      }
    }

    // Best-effort teacher payout based on TeacherCourse snapshot
    const tc = doc.teacherCourseId
      ? await collections.teacherCourses.findOne({ _id: doc.teacherCourseId }, { projection: { pricing: 1 } })
      : null;
    const teacherCurrency = (tc?.pricing?.teacherCurrency || "USD").toString().toUpperCase();
    const teacherPayoutAmount =
      tc?.pricing?.teacherPrice && doc.duration
        ? roundMoney2((Number(tc.pricing.teacherPrice) * Number(doc.duration)) / 60)
        : roundMoney2(baseAmountUSD);

    // Student paid is unknown for legacy bookings; safest fallback is USD base.
    const studentPaid = { amount: roundMoney2(baseAmountUSD), currency: "USD" };

    const exchangeRatesSnapshot = buildUsdExchangeRateSnapshot({
      USD: 1,
      [teacherCurrency]: tc?.pricing?.exchangeRateAtCreation || 1,
    });

    const pricingSnapshot = {
      baseAmountUSD: roundTo(baseAmountUSD, 6),
      baseCurrency: "USD",
      studentPaid,
      teacherPayout: { amount: teacherPayoutAmount, currency: teacherCurrency },
      exchangeRates: exchangeRatesSnapshot,
      timestamp: at,
    };
    await collections.bookings.updateOne({ _id: doc._id }, { $set: { pricingSnapshot } });
    updated += 1;
  }

  return updated;
};

const main = async () => {
  const uri = resolveMongoUri();
  console.log(`[pricing-migration] Connecting to ${uri}`);
  await mongoose.connect(uri);

  const collections = {
    teacherCourses: mongoose.connection.collection("teachercourses"),
    availabilities: mongoose.connection.collection("availabilities"),
    bookings: mongoose.connection.collection("bookings"),
  };

  const tcUpdated = await ensureTeacherCoursePricing(collections);
  console.log(`[pricing-migration] TeacherCourse updated: ${tcUpdated}`);

  const avUpdated = await ensureAvailabilityPricing(collections);
  console.log(`[pricing-migration] Availability updated: ${avUpdated}`);

  const bkUpdated = await ensureBookingPricingSnapshot(collections);
  console.log(`[pricing-migration] Booking updated: ${bkUpdated}`);

  await mongoose.disconnect();
  console.log("[pricing-migration] Done");
};

main().catch((err) => {
  console.error("[pricing-migration] Failed:", err);
  process.exit(1);
});


