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
    languageProficiencies: {
      type: [
        {
          languageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
            required: true,
          },
          code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
          },
          proficiency: {
            type: String,
            enum: ["native", "c2", "c1", "b2", "b1", "a2", "a1"],
            default: "native",
            required: true,
          },
        },
      ],
      default: [],
    },
    /**
     * Pricing (industry-standard single source of truth)
     *
     * - Teacher enters (teacherPrice, teacherCurrency)
     * - We fetch rate from Redis once and compute USD base once:
     *   basePriceUSD = teacherPrice / exchangeRateAtCreation
     *
     * We store BOTH:
     * - USD base (for consistent checkout, refunds, reporting)
     * - Teacher input + FX snapshot (for payouts/auditability)
     *
     * IMPORTANT:
     * - We NEVER store student-converted prices in DB.
     * - We do NOT keep legacy fields: price, currency, originalPrice.
     */
    pricing: {
      basePriceUSD: {
        type: Number,
        required: true,
        min: 0,
      },
      baseCurrency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
      teacherPrice: {
      type: Number,
      required: true,
      min: 0,
    },
      teacherCurrency: {
      type: String,
        required: true,
      uppercase: true,
        trim: true,
      },
      // Snapshot: units of teacherCurrency per 1 USD at the time teacher set the price.
      exchangeRateAtCreation: {
        type: Number,
        required: true,
        min: 0,
      },
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
    // Custom platform fee percentage (overrides global setting if set)
    customPlatformFeePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: undefined, // Use undefined so we can check if it's set, otherwise use global default
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

