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
    /**
     * Pricing snapshot (security + refund safe)
     *
     * WHY:
     * - We never trust client-calculated prices.
     * - We must be able to refund using the ORIGINAL exchange rate snapshot
     *   (not live rates), to avoid financial discrepancies.
     */
    pricingSnapshot: {
      // Canonical base amount used for all accounting.
      baseAmountUSD: {
        type: Number,
        required: true,
        min: 0,
      },
      baseCurrency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
      // What the student actually paid (or will pay) to the gateway.
      studentPaid: {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true, trim: true },
      },
      // Teacher payout amount in teacher's currency (based on teacher's original pricing snapshot).
      teacherPayout: {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true, trim: true },
      },
      /**
       * Exchange rate snapshot.
       * Format: { USD_INR: 83.12, USD_AED: 3.67, ... }
       */
      exchangeRates: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      timestamp: {
        type: Date,
        required: true,
      },
    },
    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
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
bookingSchema.index({ paymentStatus: 1 });

export default mongoose.model("Booking", bookingSchema);

