import mongoose from "mongoose";

/**
 * Booking Model
 * Stores student-teacher session bookings
 */
const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacherCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherCourse",
      required: true,
      index: true,
    },
    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
      unique: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    // Session details
    sessionDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    // Lesson details (timezone-safe; `scheduledAt` stored as UTC Date)
    lesson: {
      duration: { type: Number, required: true },
      scheduledAt: { type: Date, required: true, index: true },
      timezone: { type: String, required: true },
    },

    /**
     * Pricing snapshot (security + refund safe)
     *
     * WHY:
     * - Never trust client prices.
     * - Refunds must use stored snapshot (NOT live FX).
     */
    pricingSnapshot: {
      baseAmountUSD: { type: Number, required: true, min: 0 },
      platformFeeUSD: { type: Number, required: true, min: 0 },
      studentPaid: {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true, trim: true },
      },
      exchangeRatesUsed: { type: mongoose.Schema.Types.Mixed, default: {} },
      chargedAt: { type: Date, required: true },
    },

    payout: {
      teacherAmountUSD: { type: Number, required: true, min: 0 },
      teacherCurrency: { type: String, required: true, uppercase: true, trim: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
    },

    payment: {
      stripePaymentIntentId: { type: String, required: true, index: true },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "paid", index: true },
    },

    meeting: {
      provider: { type: String, enum: ["zoom"], default: "zoom" },
      meetingId: { type: String, default: "" },
      joinUrlStudent: { type: String, default: "" },
      joinUrlTeacher: { type: String, default: "" },
    },
    // Legacy fields retained for older codepaths (read-only; should not be set anymore)
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "paid", index: true },
    paymentId: { type: String, default: "" },
    // Booking status
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
      index: true,
    },
    // Meeting details
    meetingType: {
      type: String,
      enum: ["zoom", "google_meet", "teams", "custom"],
      default: "zoom",
    },
    meetingUrl: {
      type: String,
      default: "",
    },
    meetingId: {
      type: String,
      default: "",
    },
    meetingPassword: {
      type: String,
      default: "",
    },
    // Cancellation
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    // Notes
    studentNotes: {
      type: String,
      default: "",
    },
    teacherNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes
bookingSchema.index({ studentId: 1, status: 1, sessionDate: 1 });
bookingSchema.index({ teacherId: 1, status: 1, sessionDate: 1 });
bookingSchema.index({ sessionDate: 1, status: 1 });
// Idempotency: one booking per Stripe PaymentIntent
bookingSchema.index({ "payment.stripePaymentIntentId": 1 }, { unique: true, sparse: true });

export default mongoose.model("Booking", bookingSchema);

