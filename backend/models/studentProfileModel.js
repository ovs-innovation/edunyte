import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    photo: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
    },
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    wishlist: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    progress: {
      totalCourses: { type: Number, default: 0 },
      completedCourses: { type: Number, default: 0 },
      inProgressCourses: { type: Number, default: 0 },
      totalHoursSpent: { type: Number, default: 0 },
      totalLessonsCompleted: { type: Number, default: 0 },
    },
    certificates: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        certificateId: { type: String, required: true },
        issuedAt: { type: Date, default: Date.now },
        certificateUrl: { type: String, default: "" },
        courseName: { type: String, default: "" },
      },
    ],
    notes: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        content: { type: String, required: true },
        timestamp: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ "enrolledCourses.courseId": 1 });

export default mongoose.model("StudentProfile", studentProfileSchema);
