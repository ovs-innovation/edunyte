import mongoose from "mongoose";

/**
 * TeacherCourse Model (Bridge Collection)
 * Links teachers to courses with specific languages
 * Status: pending | approved | rejected
 * 
 * Prevents duplicate teacher-course-language combinations
 * Only approved mappings are visible to students
 */
const teacherCourseSchema = new mongoose.Schema(
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
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    // Experience and bio will come from teacher profile
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    // Timezone support for session availability
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
    },
    // Availability schedule (stored as JSON or separate collection in future)
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Admin who approved/rejected (optional)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate teacher-course-language combinations
teacherCourseSchema.index(
  { teacherId: 1, courseId: 1, languageId: 1 },
  { unique: true }
);

// Indexes for querying
teacherCourseSchema.index({ status: 1, createdAt: -1 });
teacherCourseSchema.index({ courseId: 1, languageId: 1, status: 1 });
teacherCourseSchema.index({ teacherId: 1, status: 1 });

export default mongoose.model("TeacherCourse", teacherCourseSchema);

