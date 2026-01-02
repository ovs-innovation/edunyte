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
      default: "USD",
      uppercase: true,
    },
    // Course-specific experience and bio (not from profile)
    experience: {
      type: String,
      trim: true,
      default: "",
      // Teacher's experience/qualifications specific to this course
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      // Teacher's bio specific to this course
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
    // About course - detailed description of what teacher will teach in this course
    aboutCourse: {
      type: String,
      trim: true,
      default: "",
      // Detailed description about the course content, teaching approach, etc.
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

// Indexes for querying
teacherCourseSchema.index({ status: 1, createdAt: -1 });
teacherCourseSchema.index({ courseId: 1, status: 1 });
teacherCourseSchema.index({ teacherId: 1, status: 1 });
teacherCourseSchema.index({ languageIds: 1 }); // For querying by language

export default mongoose.model("TeacherCourse", teacherCourseSchema);

