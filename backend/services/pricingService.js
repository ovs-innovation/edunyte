import Settings from "../models/settingsModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import Availability from "../models/availabilityModel.js";
import Course from "../models/courseModel.js";
import { getUsdToCurrencyRateOrThrow, buildUsdExchangeRateSnapshot, roundMoney2 } from "../utils/pricingHelper.js";

const BASE = "USD";

/**
 * Pricing calculation.
 *
 * INPUT (trusted):
 * - teacherCourse.pricing.basePriceUSD (per 50 min in this product)
 *
 * RULES:
 * - 25 min = basePriceUSD * 0.5
 * - 50 min = basePriceUSD * 1
 * - platformFeePercent priority:
 *   1. Custom fee set by admin for specific teacher course (teacherCourse.customPlatformFeePercent)
 *   2. Global platform fee from settings (settings.platformFeePercent, default: 4%)
 * - platform fee is calculated in USD first
 * - conversion for display/charge currency is done server-side for checkout security
 */
export async function calculateCheckoutAmounts({
  teacherCourse,
  duration,
  selectedCurrency,
  studentCount = 1, // Default to 1 student
}) {
  const basePriceUSD = Number(teacherCourse?.pricing?.basePriceUSD || 0);
  if (!Number.isFinite(basePriceUSD) || basePriceUSD < 0) {
    throw new Error("Invalid teacher base price");
  }

  const d = Number(duration);
  if (![25, 50].includes(d)) {
    throw new Error("Invalid duration");
  }

  // Validate and default studentCount
  const numStudents = Math.max(1, Math.min(10, Number(studentCount) || 1));

  const multiplier = d === 25 ? 0.5 : 1;
  const lessonAmountUSD = basePriceUSD * multiplier * numStudents; // Multiply by student count

  // Use custom platform fee if set for this teacher course, otherwise use global setting
  const settings = await Settings.getSettings();
  const globalPlatformFeePercent = Number(settings?.platformFeePercent ?? 4);
  
  // Check if teacher course has a custom platform fee percentage
  const platformFeePercent = teacherCourse?.customPlatformFeePercent !== undefined 
    ? Number(teacherCourse.customPlatformFeePercent)
    : globalPlatformFeePercent;
  
  // Debug logging to verify which fee is being used
  console.log('[Pricing] Teacher Course ID:', teacherCourse?._id);
  console.log('[Pricing] Custom Platform Fee:', teacherCourse?.customPlatformFeePercent);
  console.log('[Pricing] Global Platform Fee:', globalPlatformFeePercent);
  console.log('[Pricing] Using Platform Fee:', platformFeePercent);
  
  const platformFeeUSD = (lessonAmountUSD * platformFeePercent) / 100;
  const totalAmountUSD = lessonAmountUSD + platformFeeUSD;

  const currency = (selectedCurrency || BASE).toString().trim().toUpperCase();
  const { rate } = await getUsdToCurrencyRateOrThrow(currency);
  const totalAmount = roundMoney2(totalAmountUSD * rate);
  const lessonAmount = roundMoney2(lessonAmountUSD * rate);
  const platformFee = roundMoney2(platformFeeUSD * rate);

  return {
    baseCurrency: BASE,
    selectedCurrency: currency,
    platformFeePercent,
    studentCount: numStudents, // Include in response
    lessonAmountUSD: roundMoney2(lessonAmountUSD),
    platformFeeUSD: roundMoney2(platformFeeUSD),
    totalAmountUSD: roundMoney2(totalAmountUSD),
    // student charge currency amounts (for UI display only; backend still uses USD snapshots)
    lessonAmount,
    platformFee,
    totalAmount,
    exchangeRatesUsed: buildUsdExchangeRateSnapshot({ [currency]: rate }),
  };
}

/**
 * Resolve & validate the objects needed for checkout.
 * Ensures slot exists, belongs to teacher/course, and is available for locking.
 */
export async function resolveCheckoutContext({
  teacherId,
  courseId,
  availabilityId,
}) {
  const [course, availability] = await Promise.all([
    Course.findById(courseId),
    Availability.findById(availabilityId),
  ]);

  if (!course) throw new Error("Course not found");
  if (!availability) throw new Error("Availability slot not found");

  if (availability.teacherId.toString() !== teacherId) {
    throw new Error("Availability does not belong to teacher");
  }
  if (availability.courseId.toString() !== courseId) {
    throw new Error("Availability does not belong to course");
  }

  const teacherCourse = await TeacherCourse.findOne({
    teacherId,
    courseId,
    status: "approved",
  }).populate("teacherId", "name email");

  if (!teacherCourse) throw new Error("TeacherCourse not approved");

  return { course, availability, teacherCourse };
}


