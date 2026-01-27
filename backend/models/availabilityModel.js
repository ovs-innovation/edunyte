import mongoose from "mongoose";

/**
 * Availability Model
 * Stores teacher availability slots for specific dates
 * Similar to Preply's availability system
 */
const availabilitySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // Removed teacherCourseId - availability is now based on course only, not course+language
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Legacy local-time fields (kept for backward compatibility)
    startTime: {
      type: String,
      required: true,
      // Format: "HH:mm" in teacher's timezone (e.g., "09:00", "14:30")
    },
    endTime: {
      type: String,
      required: true,
      // Format: "HH:mm" in teacher's timezone
    },
    // UTC absolute instants – source of truth for all time calculations
    startTimeUTC: {
      type: Date,
      default: null,
      index: true,
    },
    endTimeUTC: {
      type: Date,
      default: null,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      // Duration in minutes (e.g., 25, 50, 60)
      enum: [15, 25, 30, 45, 50, 60, 90, 120],
    },
    // Calculated price for this session slot
    price: {
      type: Number,
      required: true,
      min: 0,
      // Price includes: (teacher price per hour * duration) + platform margin + meeting platform cost
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    // Breakdown of price calculation (for transparency)
    priceBreakdown: {
      teacherPrice: {
        type: Number,
        // Teacher's price per hour * (duration / 60)
      },
      platformMargin: {
        type: Number,
        // Platform margin amount
      },
      platformMarginPercent: {
        type: Number,
        // Platform margin percentage (e.g., 20 for 20%)
      },
      meetingPlatformCost: {
        type: Number,
        // Meeting platform cost per session (Zoom, Google Meet, WebRTC, etc.)
      },
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    status: {
      type: String,
      enum: ["available", "booked", "blocked", "cancelled"],
      default: "available",
      index: true,
    },
    // If booked, reference to booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    // Recurring availability pattern (optional)
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      // e.g., "weekly", "daily", "custom"
      type: String,
      enum: ["daily", "weekly", "monthly", null],
      default: null,
    },
    recurringEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
availabilitySchema.index({ teacherId: 1, date: 1, status: 1 });
availabilitySchema.index({ courseId: 1, date: 1 });
availabilitySchema.index({ teacherId: 1, courseId: 1, date: 1 });
availabilitySchema.index({ date: 1, status: 1 });
availabilitySchema.index({ teacherId: 1, courseId: 1, startTimeUTC: 1 });
availabilitySchema.index({ bookingId: 1 });

export default mongoose.model("Availability", availabilitySchema);

