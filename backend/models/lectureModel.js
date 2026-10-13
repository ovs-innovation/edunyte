import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: { en: "" },
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    section: {
      type: String,
      trim: true,
      default: "General",
    },
    type: {
      type: String,
      enum: ["recorded", "live"],
      default: "recorded",
      index: true,
    },
    // Recorded lecture fields
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    videoPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    videoDuration: {
      type: Number, // in minutes
      default: 0,
    },
    // Live class fields (Google Meet, etc.)
    liveMeeting: {
      provider: {
        type: String,
        enum: ["google_meet", "zoom", "teams", "custom"],
        default: "google_meet",
      },
      meetingUrl: {
        type: String,
        trim: true,
        default: "",
      },
      meetingId: {
        type: String,
        trim: true,
        default: "",
      },
      scheduledAt: {
        type: Date,
      },
      duration: {
        type: Number, // in minutes
        default: 60,
      },
      status: {
        type: String,
        enum: ["scheduled", "live", "completed", "cancelled"],
        default: "scheduled",
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

lectureSchema.index({ courseId: 1, order: 1, createdAt: 1 });

export default mongoose.model("Lecture", lectureSchema);
