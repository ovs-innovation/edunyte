import mongoose from "mongoose";

/**
 * Valid state transitions for Razorpay payments.
 * Ensures captured or refunded payments are never overwritten by late or duplicate failed events.
 */
const VALID_TRANSITIONS = {
  pending: ["authorized", "captured", "failed", "pending"],
  authorized: ["captured", "failed", "authorized"],
  captured: ["refunded", "captured"], // Terminal success: CANNOT transition to failed or pending
  failed: ["authorized", "captured", "failed"], // Retries allowed on same order
  refunded: ["refunded"], // Terminal refunded state
};

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
      // NOTE: Do NOT set default: null. In MongoDB, null is indexed and collides under unique constraints!
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      contact: { type: String, default: "" },
    },
    productReference: {
      itemType: {
        type: String,
        enum: ["lesson", "course", "subscription", "test-series", "product"],
        required: true,
        default: "lesson",
        index: true,
      },
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
    status: {
      type: String,
      enum: ["pending", "authorized", "captured", "failed", "refunded"],
      default: "pending",
      index: true,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: null, // 'upi', 'card', 'netbanking', 'wallet', 'emi', etc.
      trim: true,
    },
    methodDetails: {
      vpa: { type: String, default: "" },
      cardNetwork: { type: String, default: "" },
      cardLast4: { type: String, default: "" },
      cardType: { type: String, default: "" },
      bank: { type: String, default: "" },
      wallet: { type: String, default: "" },
    },
    // Track unique processed webhook events to guarantee idempotency
    webhookEventIdentifiers: {
      type: [String],
      default: [],
      index: true,
    },
    webhookEvents: [
      {
        eventId: { type: String, required: true },
        eventName: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now },
        payload: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    refundDetails: [
      {
        refundId: { type: String, required: true },
        amount: { type: Number, required: true },
        amountPaise: { type: Number, required: true },
        status: { type: String, default: "processed" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    errorDetails: {
      code: { type: String, default: "" },
      description: { type: String, default: "" },
      source: { type: String, default: "" },
      step: { type: String, default: "" },
      reason: { type: String, default: "" },
    },
    statusHistory: [
      {
        fromStatus: { type: String, required: true },
        toStatus: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String, default: "" },
        source: {
          type: String,
          enum: ["api_order_create", "api_verify", "webhook", "admin_action", "refund"],
          default: "api_verify",
        },
      },
    ],
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Unique constraint: Only index documents where paymentId exists as a valid non-empty string!
// This completely ignores null/undefined/missing paymentId for pending orders.
paymentSchema.index(
  { paymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentId: { $type: "string" } },
  }
);
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ "webhookEvents.eventId": 1 }, { sparse: true });

/**
 * Checks if a status transition is permitted by the state machine
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
paymentSchema.statics.canTransition = function (currentStatus, targetStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

/**
 * Atomically transitions payment status while preserving history
 * and protecting against overwriting captured payments.
 * @param {string} targetStatus
 * @param {{ reason?: string, source?: string }} options
 * @returns {boolean} true if transition occurred, false if blocked
 */
paymentSchema.methods.safeTransitionTo = function (
  targetStatus,
  { reason = "", source = "api_verify" } = {}
) {
  const currentStatus = this.status || "pending";

  if (!paymentSchema.statics.canTransition(currentStatus, targetStatus)) {
    console.warn(
      `[Payment State Machine] Blocked transition from '${currentStatus}' to '${targetStatus}' for payment ${this.paymentId || this.orderId}`
    );
    return false;
  }

  if (currentStatus !== targetStatus) {
    this.statusHistory.push({
      fromStatus: currentStatus,
      toStatus: targetStatus,
      changedAt: new Date(),
      reason,
      source,
    });
    this.status = targetStatus;
  }

  return true;
};

export default mongoose.model("Payment", paymentSchema);
