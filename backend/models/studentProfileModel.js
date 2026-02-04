import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Contact & Location Info
    photo: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
    },
    // Social Links
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    socialLinks: {
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
    },
    // Learning Progress (calculated from bookings)
    progress: {
      totalCourses: { type: Number, default: 0 }, // Unique courses booked
      totalHoursSpent: { type: Number, default: 0 },
      totalLessonsBooked: { type: Number, default: 0 },
      totalLessonsCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

studentProfileSchema.index({ userId: 1 });

export default mongoose.model("StudentProfile", studentProfileSchema);
