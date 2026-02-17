import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    aboutUs: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    photo: {
      type: String,
      default: "",
    },
    expertise: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    countryCode: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },
    socialLinks: {
      website: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    kycDocuments: {
      idProof: { type: String, default: "" },
      addressProof: { type: String, default: "" },
      bankStatement: { type: String, default: "" },
    },
    payoutInfo: {
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode: { type: String, trim: true, default: "" },
      accountHolderName: { type: String, trim: true, default: "" },
      upiId: { type: String, trim: true, default: "" },
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingPayout: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedCourses: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

teacherProfileSchema.pre("save", function (next) {
  if (typeof this.bio === "string") {
    this.bio = { en: this.bio };
  }
  if (typeof this.aboutUs === "string") {
    this.aboutUs = { en: this.aboutUs };
  }
  next();
});

teacherProfileSchema.index({ userId: 1 });
teacherProfileSchema.index({ kycStatus: 1 });

export default mongoose.model("TeacherProfile", teacherProfileSchema);
