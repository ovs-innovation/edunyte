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
    languageIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Language",
      required: true,
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    experience: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    bio: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
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
    // Introduction video link - teacher explains what they will teach
    introductionVideo: {
      type: String,
      trim: true,
      default: "",
      // Can be YouTube, Vimeo, or any video URL
    },
    aboutCourse: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
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

// Compound unique index to prevent duplicate teacher-course combinations
teacherCourseSchema.index(
  { teacherId: 1, courseId: 1 },
  { unique: true }
);

teacherCourseSchema.pre("save", function (next) {
  if (typeof this.experience === "string") {
    this.experience = { en: this.experience };
  }
  if (typeof this.bio === "string") {
    this.bio = { en: this.bio };
  }
  if (typeof this.aboutCourse === "string") {
    this.aboutCourse = { en: this.aboutCourse };
  }
  next();
});

teacherCourseSchema.index({ status: 1, createdAt: -1 });
teacherCourseSchema.index({ courseId: 1, status: 1 });
teacherCourseSchema.index({ teacherId: 1, status: 1 });
teacherCourseSchema.index({ languageIds: 1 });

export default mongoose.model("TeacherCourse", teacherCourseSchema);

