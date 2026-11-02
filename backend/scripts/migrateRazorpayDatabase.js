/**
 * Migration: Razorpay Payment & Order Database Schema Initialization
 *
 * Idempotent:
 * - Creates/syncs indexes for Payment and Order collections.
 * - Enforces unique constraints (paymentId, orderId).
 * - Backfills Payment records for existing orders if missing.
 *
 * Run:
 *   node backend/scripts/migrateRazorpayDatabase.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Availability from "../models/availabilityModel.js";
import Booking from "../models/bookingModel.js";

// Handle SRV DNS resolution on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const resolveMongoUri = () => {
  return (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/edunyte"
  );
};

const runMigration = async () => {
  console.log("=================================================");
  console.log("🚀 Starting Razorpay Database Schema Migration...");
  console.log("=================================================");

  const uri = resolveMongoUri();
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB ✅\n");

  try {
    // 1. Sync & Build Indexes for Payment Collection
    console.log("1. Ensuring indexes on Payment collection...");
    await Payment.createIndexes();
    const paymentIndexes = await Payment.collection.indexes();
    console.log("Payment collection indexes verified:");
    paymentIndexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${Boolean(idx.unique)}, sparse: ${Boolean(idx.sparse)})`);
    });

    // 2. Sync & Build Indexes for Order Collection
    console.log("\n2. Ensuring indexes on Order collection...");
    await Order.createIndexes();
    const orderIndexes = await Order.collection.indexes();
    console.log("Order collection indexes verified:");
    orderIndexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${Boolean(idx.unique)})`);
    });

    // 3. Ensure Availability indexes
    console.log("\n3. Ensuring indexes on Availability collection...");
    await Availability.createIndexes();
    console.log("Availability indexes verified ✅");

    // 4. Ensure Booking indexes
    console.log("\n4. Ensuring indexes on Booking collection...");
    await Booking.createIndexes();
    console.log("Booking indexes verified ✅");

    // 5. Backfill Payment records for any Orders lacking a Payment record
    console.log("\n5. Backfilling Payment records for existing Orders...");
    const ordersWithoutPayment = await Order.find({ paymentRecordId: null });
    let backfillCount = 0;

    for (const order of ordersWithoutPayment) {
      let paymentRecord = await Payment.findOne({ orderId: order.orderId });
      if (!paymentRecord) {
        paymentRecord = await Payment.create({
          orderId: order.orderId,
          paymentId: order.paymentDetails?.razorpayPaymentId || null,
          userId: order.userId,
          productReference: order.itemReference || {},
          amount: order.amount,
          amountPaise: order.amountPaise,
          currency: order.currency || "INR",
          status: order.status === "paid" ? "captured" : (order.status || "pending"),
          paymentMethod: order.paymentDetails?.method || null,
          bookingId: order.bookingId || null,
          statusHistory: [
            {
              fromStatus: "pending",
              toStatus: order.status === "paid" ? "captured" : (order.status || "pending"),
              changedAt: order.createdAt || new Date(),
              reason: "Migration backfill from Order",
              source: "api_order_create",
            },
          ],
        });
        backfillCount++;
      }

      order.paymentRecordId = paymentRecord._id;
      await order.save();
    }
    console.log(`Backfilled ${backfillCount} Payment record(s) ✅`);

    // 6. Verify State Machine Rules
    console.log("\n6. Verifying Payment State Machine transition rules...");
    const capturedAllowedTransitions = ["refunded", "captured"];
    const canCapturedToFailed = Payment.canTransition("captured", "failed");
    const canCapturedToRefunded = Payment.canTransition("captured", "refunded");
    const canPendingToCaptured = Payment.canTransition("pending", "captured");

    if (!canCapturedToFailed && canCapturedToRefunded && canPendingToCaptured) {
      console.log("State machine transition rules verified: Captured payments cannot be overwritten by failed events ✅");
    } else {
      throw new Error("State machine transition rules verification failed!");
    }

    console.log("\n=================================================");
    console.log("🎉 Razorpay Database Migration Completed Successfully!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Migration error:", err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

