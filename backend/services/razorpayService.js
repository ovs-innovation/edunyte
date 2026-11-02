import crypto from "crypto";
import {
  getRazorpayClient,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
} from "../config/razorpay.js";

/**
 * Convert INR rupee amount to Razorpay paise (1 INR = 100 paise)
 * @param {number} amount
 * @returns {number}
 */
export const toPaise = (amount) => {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid amount: must be a positive number");
  }
  return Math.round(n * 100);
};

/**
 * Convert paise to INR rupee amount
 * @param {number} paise
 * @returns {number}
 */
export const fromPaise = (paise) => {
  const n = typeof paise === "number" ? paise : Number(paise);
  if (!Number.isFinite(n)) return 0;
  return Number((n / 100).toFixed(2));
};

/**
 * Create a new Razorpay Order
 * @param {{ amount: number, currency?: string, receipt?: string, notes?: object }} params
 * @returns {Promise<object>}
 */
export const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) => {
  const client = getRazorpayClient();
  const amountPaise = toPaise(amount);
  const rcpt = receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const orderOptions = {
    amount: amountPaise,
    currency: currency.toUpperCase(),
    receipt: rcpt,
    notes: {
      ...notes,
      createdAt: new Date().toISOString(),
    },
  };

  const order = await client.orders.create(orderOptions);
  return order;
};

/**
 * Verify Razorpay payment signature received on checkout completion.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 *
 * Requirements:
 * - Safe input validation (type check, length check, hex validation).
 * - Constant-time comparison using crypto.timingSafeEqual.
 *
 * @param {{ orderId: string, paymentId: string, signature: string }} params
 * @returns {boolean}
 */
export const verifyRazorpayPaymentSignature = ({
  orderId,
  paymentId,
  signature,
}) => {
  // Safe input validation
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return false;
  }

  const cleanOrderId = orderId.trim();
  const cleanPaymentId = paymentId.trim();
  const cleanSignature = signature.trim().toLowerCase();

  // Validate non-empty and standard 64-character hex signature
  if (
    !cleanOrderId ||
    !cleanPaymentId ||
    cleanSignature.length !== 64 ||
    !/^[0-9a-f]{64}$/.test(cleanSignature)
  ) {
    return false;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured on the server");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${cleanOrderId}|${cleanPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature, "utf8");
  const receivedBuffer = Buffer.from(cleanSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

/**
 * Verify Razorpay webhook signature using constant-time comparison
 * @param {string|Buffer} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
export const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  if (!rawBody || typeof signature !== "string") return false;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured on the server");
  }

  const cleanSignature = signature.trim().toLowerCase();
  if (cleanSignature.length !== 64 || !/^[0-9a-f]{64}$/.test(cleanSignature)) {
    return false;
  }

  const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyString)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const signatureBuffer = Buffer.from(cleanSignature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

/**
 * Fetch Razorpay order details by Order ID
 * @param {string} orderId
 * @returns {Promise<object>}
 */
export const fetchRazorpayOrder = async (orderId) => {
  const client = getRazorpayClient();
  return client.orders.fetch(orderId);
};

/**
 * Fetch Razorpay payment details by Payment ID
 * @param {string} paymentId
 * @returns {Promise<object>}
 */
export const fetchRazorpayPayment = async (paymentId) => {
  const client = getRazorpayClient();
  return client.payments.fetch(paymentId);
};

export { RAZORPAY_KEY_ID };
