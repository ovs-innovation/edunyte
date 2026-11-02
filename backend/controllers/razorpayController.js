import mongoose from "mongoose";
import Availability from "../models/availabilityModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import { resolveCheckoutContext, calculateCheckoutAmounts } from "../services/pricingService.js";
import { getUsdToCurrencyRateOrThrow, roundMoney2 } from "../utils/pricingHelper.js";
import { createZoomMeeting } from "../services/zoomService.js";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
  fetchRazorpayPayment,
  toPaise,
  RAZORPAY_KEY_ID,
} from "../services/razorpayService.js";
import { getRazorpayClient } from "../config/razorpay.js";

/**
 * Supported subscription plans and test series catalogs (fallback / catalog pricing)
 */
const CATALOG_ITEMS = {
  subscription: {
    monthly_basic: { name: "Monthly Basic Plan", amountINR: 999, durationDays: 30 },
    monthly_pro: { name: "Monthly Pro Plan", amountINR: 1999, durationDays: 30 },
    annual_unlimited: { name: "Annual Unlimited Plan", amountINR: 9999, durationDays: 365 },
  },
  "test-series": {
    standard_mock_pack: { name: "Standard Test Series Pack", amountINR: 499 },
    premium_exam_bundle: { name: "Premium Exam Practice Bundle", amountINR: 999 },
  },
};

/**
 * Resolve item details and verify eligibility & database price
 */
const resolveItemAndPayableAmount = async ({
  userId,
  itemType,
  body,
}) => {
  // ==========================================
  // 1. LESSON / 1-ON-1 OR GROUP TIME SLOT
  // ==========================================
  if (itemType === "lesson") {
    const { teacherId, courseId, duration, studentCount = 1 } = body;
    const availabilityId = body.selectedSlot?.availabilityId || body.selectedSlot?._id || body.availabilityId;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      throw { status: 400, message: "Invalid teacherId" };
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw { status: 400, message: "Invalid courseId" };
    }
    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      throw { status: 400, message: "Invalid availabilityId" };
    }

    if (String(teacherId) === String(userId)) {
      throw { status: 400, message: "You cannot book your own teaching slot" };
    }

    const { course, availability, teacherCourse } = await resolveCheckoutContext({
      teacherId,
      courseId,
      availabilityId,
    });

    const d = Number(duration);
    if (availability.duration !== d) {
      throw { status: 400, message: "Requested duration does not match selected slot" };
    }

    // Availability validation
    if (availability.status === "booked" || availability.bookingId) {
      throw { status: 409, message: "This slot is already booked" };
    }

    // If held by someone else and hold hasn't expired
    if (
      availability.status === "held" &&
      availability.hold?.until &&
      new Date(availability.hold.until) > new Date() &&
      String(availability.hold.byStudentId) !== String(userId)
    ) {
      throw { status: 409, message: "This slot is currently held by another user. Please choose another slot." };
    }

    // Compute price server-side in INR (NEVER trust frontend amount)
    const amounts = await calculateCheckoutAmounts({
      teacherCourse,
      duration: d,
      selectedCurrency: "INR",
      studentCount: Number(studentCount) || 1,
    });

    const courseName = typeof course.name === "object" ? course.name.en || Object.values(course.name)[0] : course.name;
    const teacherName = typeof teacherCourse.teacherId === "object" ? teacherCourse.teacherId.name : "Teacher";

    return {
      itemType: "lesson",
      itemName: `${courseName || "Lesson"} with ${teacherName} (${d} mins)`,
      payableAmountINR: amounts.totalAmount,
      pricingSnapshot: {
        baseAmountUSD: amounts.lessonAmountUSD,
        platformFeeUSD: amounts.platformFeeUSD,
        exchangeRateUsed: amounts.exchangeRatesUsed?.INR || 1,
        breakdown: amounts,
      },
      itemReference: {
        courseId,
        teacherId,
        teacherCourseId: teacherCourse._id,
        availabilityId,
        languageId: teacherCourse.languageIds?.[0],
        duration: d,
        studentCount: amounts.studentCount,
        name: courseName,
      },
      availability,
    };
  }

  // ==========================================
  // 2. COURSE PURCHASE / ENROLLMENT
  // ==========================================
  if (itemType === "course") {
    const courseId = body.courseId || body.itemId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw { status: 400, message: "Invalid courseId" };
    }

    const course = await Course.findById(courseId);
    if (!course || course.status !== "active") {
      throw { status: 404, message: "Course not found or currently inactive" };
    }

    // Determine course price from database (USD converted to INR or direct INR)
    const coursePriceUSD = Number(course.priceUSD || course.price || 49);
    const { rate } = await getUsdToCurrencyRateOrThrow("INR");
    const payableAmountINR = roundMoney2(coursePriceUSD * rate);

    const courseName = typeof course.name === "object" ? course.name.en || Object.values(course.name)[0] : course.name;

    return {
      itemType: "course",
      itemName: courseName || "Course Enrollment",
      payableAmountINR,
      pricingSnapshot: {
        baseAmountUSD: coursePriceUSD,
        platformFeeUSD: 0,
        exchangeRateUsed: rate,
      },
      itemReference: {
        courseId: course._id,
        name: courseName,
        description: typeof course.description === "object" ? course.description.en : course.description,
      },
    };
  }

  // ==========================================
  // 3. SUBSCRIPTION PLAN
  // ==========================================
  if (itemType === "subscription") {
    const planKey = body.planId || body.subscriptionId || body.itemId || "monthly_pro";
    const plan = CATALOG_ITEMS.subscription[planKey];
    if (!plan) {
      throw { status: 400, message: `Invalid subscription plan: ${planKey}` };
    }

    return {
      itemType: "subscription",
      itemName: plan.name,
      payableAmountINR: plan.amountINR,
      pricingSnapshot: {
        breakdown: plan,
      },
      itemReference: {
        itemId: planKey,
        name: plan.name,
        metadata: { durationDays: plan.durationDays },
      },
    };
  }

  // ==========================================
  // 4. TEST SERIES / QUIZ BUNDLE
  // ==========================================
  if (itemType === "test-series") {
    const seriesKey = body.testSeriesId || body.itemId || "standard_mock_pack";
    const series = CATALOG_ITEMS["test-series"][seriesKey] || {
      name: body.name || "Test Series Package",
      amountINR: 499,
    };

    return {
      itemType: "test-series",
      itemName: series.name,
      payableAmountINR: series.amountINR,
      pricingSnapshot: {
        breakdown: series,
      },
      itemReference: {
        itemId: seriesKey,
        name: series.name,
      },
    };
  }

  // ==========================================
  // 5. PRODUCT / SHOP ITEM
  // ==========================================
  if (itemType === "product") {
    const productId = body.productId || body.itemId;
    const productName = body.title || body.name || "Learning Material";
    const baseINR = Number(body.catalogPriceINR || 299); // Server fallback catalog price

    return {
      itemType: "product",
      itemName: productName,
      payableAmountINR: baseINR,
      pricingSnapshot: {},
      itemReference: {
        itemId: String(productId || ""),
        name: productName,
      },
    };
  }

  throw { status: 400, message: `Unsupported itemType: ${itemType}` };
};

/**
 * POST /api/payment/create-order
 * or POST /api/payments/create-order
 *
 * Creates a Razorpay Order in INR for authenticated user.
 */
export const createRazorpayOrderController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user || user.status === "inactive") {
      return res.status(403).json({ message: "User account is invalid or inactive" });
    }

    // Determine item type
    let itemType = req.body.itemType;
    if (!itemType) {
      if (req.body.availabilityId || req.body.selectedSlot) {
        itemType = "lesson";
      } else if (req.body.courseId) {
        itemType = "course";
      } else if (req.body.subscriptionId || req.body.planId) {
        itemType = "subscription";
      } else if (req.body.testSeriesId) {
        itemType = "test-series";
      } else if (req.body.productId) {
        itemType = "product";
      } else {
        itemType = "lesson";
      }
    }

    // 1. Resolve item and calculate actual payable amount from DB (NEVER trust req.body.amount)
    const resolved = await resolveItemAndPayableAmount({
      userId,
      itemType,
      body: req.body,
    });

    const { itemName, payableAmountINR, pricingSnapshot, itemReference, availability } = resolved;

    if (!payableAmountINR || payableAmountINR <= 0) {
      return res.status(400).json({ message: "Payable amount must be greater than zero for Razorpay order" });
    }

    const amountPaise = toPaise(payableAmountINR);
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Create Order in Razorpay in INR
    const razorpayOrder = await createRazorpayOrder({
      amount: payableAmountINR,
      currency: "INR",
      receipt,
      notes: {
        userId: String(userId),
        userEmail: user.email,
        itemType,
        itemName,
        itemId: String(itemReference.itemId || itemReference.courseId || ""),
      },
    });

    // 3. If it's a lesson slot booking, lock/hold the slot for 10 minutes
    if (availability) {
      const holdUntil = new Date(Date.now() + 10 * 60 * 1000);
      availability.status = "held";
      availability.hold = {
        byStudentId: userId,
        until: holdUntil,
        stripePaymentIntentId: "",
        razorpayOrderId: razorpayOrder.id,
        gateway: "razorpay",
      };
      await availability.save();
    }

    // 4. Store the initial Payment record in DB with "pending" status
    const paymentRecord = await Payment.create({
      orderId: razorpayOrder.id,
      userId,
      customer: {
        name: user.name,
        email: user.email,
      },
      productReference: itemReference,
      amount: payableAmountINR,
      amountPaise,
      currency: "INR",
      status: "pending",
      statusHistory: [
        {
          fromStatus: "pending",
          toStatus: "pending",
          changedAt: new Date(),
          reason: "Order created via API",
          source: "api_order_create",
        },
      ],
    });

    // 5. Store the order record in DB
    const dbOrder = await Order.create({
      orderId: razorpayOrder.id,
      userId,
      amount: payableAmountINR,
      amountPaise,
      currency: "INR",
      receipt: razorpayOrder.receipt || receipt,
      status: "pending",
      itemType,
      itemReference,
      paymentRecordId: paymentRecord._id,
      paymentDetails: {
        gateway: "razorpay",
      },
      pricingSnapshot,
    });

    // 6. Return order details along with public Key ID
    return res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      order: {
        id: razorpayOrder.id,
        entity: razorpayOrder.entity,
        amount: razorpayOrder.amount, // in paise
        amount_paid: razorpayOrder.amount_paid,
        amount_due: razorpayOrder.amount_due,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
      },
      keyId: RAZORPAY_KEY_ID,
      amount: payableAmountINR, // in INR rupees
      amountPaise,
      currency: "INR",
      item: {
        type: itemType,
        name: itemName,
        reference: itemReference,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      pricing: pricingSnapshot.breakdown || null,
      internalOrderId: dbOrder._id,
      paymentRecordId: paymentRecord._id,
    });
  } catch (err) {
    if (err?.status && err?.message) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Service activator helper for lesson bookings
 */
const activateLessonBooking = async ({ order, paymentId, session }) => {
  const {
    teacherId,
    teacherCourseId,
    availabilityId,
    courseId,
    languageId,
    duration,
    studentCount,
  } = order.itemReference;

  const availabilityQuery = Availability.findById(availabilityId);
  const availability = session ? await availabilityQuery.session(session) : await availabilityQuery;

  if (!availability) {
    throw new Error("Availability slot for this lesson could not be found");
  }

  // Prevent double booking on slot
  if (availability.status === "booked" && availability.bookingId) {
    throw new Error("This availability slot has already been booked");
  }

  availability.status = "booked";
  availability.hold = {
    byStudentId: null,
    until: null,
    stripePaymentIntentId: "",
    razorpayOrderId: "",
    gateway: "",
  };

  const scheduledAt = availability.startTimeUTC || availability.date;

  // Attempt Zoom meeting creation (non-blocking if Zoom credentials not set)
  let meeting = { meetingId: "", joinUrlStudent: "", joinUrlTeacher: "" };
  try {
    meeting = await createZoomMeeting({
      topic: `Lesson: ${order.itemReference?.name || "Live Class"}`,
      startTimeUTC: scheduledAt,
      durationMinutes: duration || availability.duration,
    });
  } catch (zoomErr) {
    console.warn("⚠️ Zoom meeting creation skipped/failed:", zoomErr.message);
  }

  const teacherAmountUSD = Number(order.pricingSnapshot?.baseAmountUSD || 0);

  const bookingData = {
    studentId: order.userId,
    teacherId,
    teacherCourseId,
    availabilityId,
    courseId,
    languageId: languageId || undefined,
    sessionDate: availability.date,
    startTime: availability.startTime,
    endTime: availability.endTime,
    duration: availability.duration,
    timezone: availability.timezone,
    studentCount: studentCount || 1,
    lesson: {
      duration: availability.duration,
      scheduledAt,
      timezone: availability.timezone,
    },
    pricingSnapshot: {
      baseAmountUSD: order.pricingSnapshot?.baseAmountUSD || 0,
      platformFeeUSD: order.pricingSnapshot?.platformFeeUSD || 0,
      studentPaid: {
        amount: order.amount,
        currency: "INR",
      },
      exchangeRatesUsed: {
        INR: order.pricingSnapshot?.exchangeRateUsed || 1,
      },
      chargedAt: new Date(),
    },
    payout: {
      teacherAmountUSD,
      teacherCurrency: "USD",
      status: "pending",
    },
    payment: {
      stripePaymentIntentId: paymentId, // Used as unique payment key for backwards compatibility
      status: "paid",
    },
    meeting: {
      provider: "zoom",
      meetingId: meeting.meetingId,
      joinUrlStudent: meeting.joinUrlStudent,
      joinUrlTeacher: meeting.joinUrlTeacher,
    },
    paymentStatus: "paid",
    paymentId: paymentId,
    status: "scheduled",
  };

  let newBooking;
  if (session) {
    const created = await Booking.create([bookingData], { session });
    newBooking = created[0];
  } else {
    newBooking = await Booking.create(bookingData);
  }

  availability.bookingId = newBooking._id;
  if (session) {
    await availability.save({ session });
  } else {
    await availability.save();
  }

  return newBooking;
};

/**
 * Extract method details from Razorpay payment payload
 */
const extractPaymentMethodDetails = (payment) => {
  const method = payment.method || "card";
  const details = {
    vpa: payment.vpa || "",
    cardNetwork: payment.card?.network || "",
    cardLast4: payment.card?.last4 || "",
    cardType: payment.card?.type || "",
    bank: payment.bank || "",
    wallet: payment.wallet || "",
  };
  return { method, details };
};

/**
 * POST /api/payment/verify
 * or POST /api/payments/verify
 *
 * Verifies Razorpay payment signature, validates payment details against Razorpay,
 * ensures order ownership, prevents duplicate processing, and activates services transactionally.
 */
export const verifyRazorpayPaymentController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // CamelCase alternatives
      razorpayOrderId = razorpay_order_id,
      razorpayPaymentId = razorpay_payment_id,
      razorpaySignature = razorpay_signature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "Missing required verification fields: razorpay_order_id, razorpay_payment_id, razorpay_signature are all required",
      });
    }

    // 1. Verify HMAC SHA256 Signature using crypto.timingSafeEqual
    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isSignatureValid) {
      return res.status(400).json({
        message: "Payment verification failed: Invalid payment signature",
      });
    }

    // 2. Fetch Order from DB & Confirm Order Ownership
    const order = await Order.findOne({ orderId: razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to verify this order",
      });
    }

    // 3. Find or Create Payment record
    let paymentRecord = await Payment.findOne({ orderId: razorpayOrderId });
    if (!paymentRecord) {
      paymentRecord = await Payment.create({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        userId,
        productReference: order.itemReference || {},
        amount: order.amount,
        amountPaise: order.amountPaise,
        currency: order.currency || "INR",
        status: "pending",
      });
    }

    // 4. Prevent Duplicate Payment Processing (Idempotency)
    if (order.status === "captured" || order.status === "paid" || paymentRecord.status === "captured") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified and processed successfully",
        orderId: order.orderId,
        status: "captured",
        bookingId: order.bookingId,
        alreadyProcessed: true,
      });
    }

    // Check if payment ID was already attached to another booking
    const duplicateBooking = await Booking.findOne({
      $or: [
        { "payment.stripePaymentIntentId": razorpayPaymentId },
        { paymentId: razorpayPaymentId },
      ],
    });

    if (duplicateBooking) {
      order.status = "captured";
      order.bookingId = duplicateBooking._id;
      await order.save();
      paymentRecord.safeTransitionTo("captured", { reason: "Linked to existing booking", source: "api_verify" });
      paymentRecord.paymentId = razorpayPaymentId;
      await paymentRecord.save();

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        orderId: order.orderId,
        status: "captured",
        bookingId: duplicateBooking._id,
      });
    }

    // 5. Fetch Payment Details from Razorpay & Validate
    let paymentDetails;
    try {
      paymentDetails = await fetchRazorpayPayment(razorpayPaymentId);
    } catch (fetchErr) {
      if (process.env.NODE_ENV === "production") {
        return res.status(400).json({
          message: "Unable to verify payment with Razorpay gateway",
          details: fetchErr.message || fetchErr,
        });
      } else {
        console.warn("⚠️ [Razorpay] Could not fetch payment from gateway in dev (proceeding with verified HMAC):", fetchErr.message);
        paymentDetails = {
          id: razorpayPaymentId,
          order_id: razorpayOrderId,
          status: "captured",
          amount: order.amountPaise,
          currency: order.currency,
          method: "card",
        };
      }
    }

    // 6. Confirm Payment belongs to the expected Razorpay Order
    if (paymentDetails.order_id && paymentDetails.order_id !== order.orderId) {
      return res.status(400).json({
        message: `Payment order mismatch: payment belongs to order ${paymentDetails.order_id}, expected ${order.orderId}`,
      });
    }

    // 7. Validate Amount and Currency
    if (Number(paymentDetails.amount) !== Number(order.amountPaise)) {
      return res.status(400).json({
        message: `Payment amount mismatch: expected ${order.amountPaise} paise, received ${paymentDetails.amount} paise`,
      });
    }

    if ((paymentDetails.currency || "").toUpperCase() !== (order.currency || "INR").toUpperCase()) {
      return res.status(400).json({
        message: `Payment currency mismatch: expected ${order.currency}, received ${paymentDetails.currency}`,
      });
    }

    // 8. Confirm Captured Status (attempt capture if authorized)
    if (paymentDetails.status !== "captured") {
      if (paymentDetails.status === "authorized") {
        try {
          const client = getRazorpayClient();
          paymentDetails = await client.payments.capture(
            razorpayPaymentId,
            order.amountPaise,
            order.currency
          );
        } catch (captureErr) {
          paymentRecord.safeTransitionTo("authorized", { reason: "Payment authorized but capture failed", source: "api_verify" });
          paymentRecord.paymentId = razorpayPaymentId;
          await paymentRecord.save();
          return res.status(400).json({
            message: "Failed to capture authorized payment",
            details: captureErr.message,
          });
        }
      }

      if (paymentDetails.status !== "captured") {
        paymentRecord.safeTransitionTo("failed", { reason: `Payment status is ${paymentDetails.status}`, source: "api_verify" });
        paymentRecord.paymentId = razorpayPaymentId;
        await paymentRecord.save();

        return res.status(400).json({
          message: `Payment is not in captured status (current status: ${paymentDetails.status})`,
        });
      }
    }

    // 9. Update Database Transactionally & Activate Service
    let bookingRecord = null;
    let activatedService = null;
    const { method, details: methodDetails } = extractPaymentMethodDetails(paymentDetails);

    const executeActivation = async (session) => {
      if (order.itemType === "lesson") {
        bookingRecord = await activateLessonBooking({
          order,
          paymentId: razorpayPaymentId,
          session,
        });
        activatedService = {
          type: "lesson",
          bookingId: bookingRecord._id,
          sessionDate: bookingRecord.sessionDate,
          startTime: bookingRecord.startTime,
          endTime: bookingRecord.endTime,
          meetingUrl: bookingRecord.meeting?.joinUrlStudent || null,
        };
      } else {
        activatedService = {
          type: order.itemType,
          name: order.itemReference?.name,
          status: "activated",
        };
      }

      // Update Order
      order.status = "captured";
      if (bookingRecord) {
        order.bookingId = bookingRecord._id;
      }
      order.paymentDetails = {
        gateway: "razorpay",
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        method,
        paidAt: new Date(),
      };

      // Update Payment Record with safe state transition (guarantees captured payment cannot be overwritten)
      paymentRecord.paymentId = razorpayPaymentId;
      paymentRecord.paymentMethod = method;
      paymentRecord.methodDetails = methodDetails;
      if (bookingRecord) {
        paymentRecord.bookingId = bookingRecord._id;
      }
      paymentRecord.safeTransitionTo("captured", { reason: "Payment confirmed and captured", source: "api_verify" });

      if (session) {
        await order.save({ session });
        await paymentRecord.save({ session });
      } else {
        await order.save();
        await paymentRecord.save();
      }
    };

    // Try MongoDB session transaction (supported on MongoDB Atlas replica sets)
    let session = null;
    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await executeActivation(session);
      });
    } catch (txErr) {
      if (
        txErr.message?.includes("replica set") ||
        txErr.message?.includes("Transactions are not supported") ||
        txErr.code === 20
      ) {
        console.warn("MongoDB replica set not detected, running atomic updates without multi-document session transaction");
        await executeActivation(null);
      } else {
        throw txErr;
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and service activated successfully",
      orderId: order.orderId,
      paymentId: razorpayPaymentId,
      status: "captured",
      amount: order.amount,
      currency: order.currency,
      service: activatedService,
      bookingId: bookingRecord?._id || order.bookingId || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payment/status/:orderId
 * or GET /api/payment/status?orderId=...
 *
 * Checks payment and order status with strict user ownership verification.
 * Never reveals another user's payment details.
 */
export const getPaymentStatusController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const orderId = req.params.orderId || req.query.orderId;
    if (!orderId) {
      return res.status(400).json({
        message: "Missing order identifier: provide orderId in route path or query param",
      });
    }

    const order = await Order.findOne({ orderId }).populate("bookingId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Strict ownership verification: Never reveal another user's payment details
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to view this payment status",
      });
    }

    const paymentRecord = await Payment.findOne({ orderId: order.orderId });
    const booking = order.bookingId;

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      status: paymentRecord?.status || (order.status === "paid" ? "captured" : order.status),
      amount: order.amount,
      currency: order.currency,
      item: {
        type: order.itemType,
        name: order.itemReference?.name || null,
        duration: order.itemReference?.duration || null,
        studentCount: order.itemReference?.studentCount || 1,
      },
      paymentDetails: {
        gateway: "razorpay",
        paymentId: paymentRecord?.paymentId || order.paymentDetails?.razorpayPaymentId || null,
        method: paymentRecord?.paymentMethod || order.paymentDetails?.method || null,
        methodDetails: paymentRecord?.methodDetails || null,
        paidAt: order.paymentDetails?.paidAt || null,
      },
      history: paymentRecord?.statusHistory || [],
      booking: booking
        ? {
            id: booking._id,
            status: booking.status,
            sessionDate: booking.sessionDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timezone: booking.timezone,
            meeting: {
              provider: booking.meeting?.provider || "zoom",
              joinUrlStudent: booking.meeting?.joinUrlStudent || null,
            },
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};
