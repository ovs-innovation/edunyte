import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["session_reminder", "booking", "approval", "payment", "system"],
      default: "session_reminder",
      index: true,
    },
    data: {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null,
      },
      meetingUrl: {
        type: String,
        default: "",
      },
      scheduledAt: {
        type: Date,
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
