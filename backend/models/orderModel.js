import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    receipt: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "authorized", "captured", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    itemType: {
      type: String,
      enum: ["lesson", "course", "subscription", "test-series", "product"],
      default: "lesson",
      required: true,
      index: true,
    },
    itemReference: {
      itemId: { type: String, default: "" },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      teacherCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherCourse" },
      availabilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Availability" },
      languageId: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
      duration: { type: Number },
      studentCount: { type: Number, default: 1 },
      name: { type: String, default: "" },
      description: { type: String, default: "" },
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    paymentDetails: {
      gateway: { type: String, default: "razorpay" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      method: { type: String, default: "" },
      paidAt: { type: Date },
      error: { type: mongoose.Schema.Types.Mixed },
    },
    paymentRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    pricingSnapshot: {
      baseAmountUSD: { type: Number, default: 0 },
      platformFeeUSD: { type: Number, default: 0 },
      exchangeRateUsed: { type: Number, default: 1 },
      breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
orderSchema.index({ "paymentDetails.razorpayPaymentId": 1 }, { sparse: true });

export default mongoose.model("Order", orderSchema);
