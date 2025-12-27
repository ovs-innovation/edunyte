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
    duration: {
      type: Number,
      required: true,
      // Duration in minutes (e.g., 25, 50, 60)
      enum: [15, 25, 30, 45, 50, 60, 90, 120],
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
availabilitySchema.index({ bookingId: 1 });

export default mongoose.model("Availability", availabilitySchema);

