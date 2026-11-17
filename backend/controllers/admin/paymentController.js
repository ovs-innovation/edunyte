import Booking from "../../models/bookingModel.js";
import Payment from "../../models/paymentModel.js";
import Order from "../../models/orderModel.js";
import TeacherProfile from "../../models/teacherProfileModel.js";

/**
 * Get all payments/transactions for admin panel.
 * Combines Payment records (Razorpay, Stripe) and Bookings
 * to dynamically display all statuses: pending, authorized, captured, failed, refunded.
 */
export const getAllPayments = async (req, res, next) => {
  try {
    // 1. Fetch all Payment records with populated references
    const paymentRecords = await Payment.find()
      .populate("userId", "name email")
      .populate("productReference.teacherId", "name email")
      .populate("productReference.courseId", "name")
      .populate({
        path: "bookingId",
        populate: [
          { path: "studentId", select: "name email" },
          { path: "teacherId", select: "name email" },
          { path: "courseId", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch existing Bookings
    const bookings = await Booking.find()
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .populate("courseId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Set of booking IDs already represented by a Payment record
    const representedBookingIds = new Set(
      paymentRecords
        .filter((p) => p.bookingId)
        .map((p) => String(p.bookingId._id || p.bookingId))
    );

    // Set of payment IDs / order IDs already captured
    const representedPaymentIds = new Set(
      paymentRecords
        .filter((p) => p.paymentId)
        .map((p) => String(p.paymentId))
    );

    // Fetch teacher profiles for payout info (bank details, UPI, etc.)
    const rawTeacherIds = [
      ...paymentRecords.map((p) => p.productReference?.teacherId?._id || p.productReference?.teacherId || p.bookingId?.teacherId?._id || p.bookingId?.teacherId),
      ...bookings.map((b) => b.teacherId?._id || b.teacherId),
    ].filter(Boolean);

    const teacherUserIds = [...new Set(rawTeacherIds.map((id) => String(id)))];
    const teacherProfiles = await TeacherProfile.find({ userId: { $in: teacherUserIds } })
      .select("userId payoutInfo")
      .lean();
    const teacherProfileMap = new Map(
      teacherProfiles.map((tp) => [String(tp.userId), tp.payoutInfo || {}])
    );

    const formattedPayments = [];

    // Map each Payment record to the admin table shape
    for (const pr of paymentRecords) {
      const booking = pr.bookingId || null;
      const student = pr.userId || booking?.studentId || { name: pr.customer?.name || "Student", email: pr.customer?.email || "" };
      const teacher = pr.productReference?.teacherId || booking?.teacherId || { name: "N/A", email: "" };
      const course = pr.productReference?.courseId || booking?.courseId || { name: pr.productReference?.name || "Lesson / Course" };

      const baseAmountUSD = booking?.pricingSnapshot?.baseAmountUSD || 0;
      const platformFeeUSD = booking?.pricingSnapshot?.platformFeeUSD || 0;
      const teacherAmountUSD = booking?.payout?.teacherAmountUSD || 0;
      const teacherIdStr = String(teacher?._id || teacher || "");

      formattedPayments.push({
        _id: pr._id,
        bookingId: booking?._id || null,
        sessionDate: booking?.sessionDate || pr.createdAt,
        createdAt: pr.createdAt,
        studentId: student,
        teacherId: teacher,
        teacherPayoutInfo: teacherProfileMap.get(teacherIdStr) || null,
        courseId: course,
        duration: pr.productReference?.duration || booking?.duration || 50,
        studentCount: pr.productReference?.studentCount || booking?.studentCount || 1,
        pricingSnapshot: {
          baseAmountUSD,
          platformFeeUSD,
          studentPaid: {
            amount: pr.amount,
            currency: pr.currency || "INR",
          },
        },
        payout: booking?.payout || {
          teacherAmountUSD,
          teacherAmountINR: Math.round(teacherAmountUSD * 83.33 * 100) / 100,
          teacherCurrency: "INR",
          status: pr.productReference?.metadata?.payoutStatus || "pending",
        },
        payment: {
          stripePaymentIntentId: pr.paymentId || pr.orderId,
          status: pr.status === "captured" ? "paid" : pr.status, // supports both 'paid' and 'captured'
          rawStatus: pr.status,
        },
        gateway: pr.paymentMethod ? "razorpay" : (pr.orderId?.startsWith("order_") ? "razorpay" : "stripe"),
        paymentMethod: pr.paymentMethod || "online",
        methodDetails: pr.methodDetails,
        orderId: pr.orderId,
        paymentId: pr.paymentId,
        status: booking?.status || "scheduled",
        statusHistory: pr.statusHistory || [],
      });
    }

    // Add legacy bookings that don't have a Payment document yet
    for (const b of bookings) {
      if (!representedBookingIds.has(String(b._id))) {
        const paymentKey = b.payment?.stripePaymentIntentId || b.paymentId;
        if (!paymentKey || !representedPaymentIds.has(String(paymentKey))) {
          const teacherIdStr = String(b.teacherId?._id || b.teacherId || "");
          formattedPayments.push({
            _id: b._id,
            bookingId: b._id,
            sessionDate: b.sessionDate || b.createdAt,
            createdAt: b.createdAt,
            studentId: b.studentId,
            teacherId: b.teacherId,
            teacherPayoutInfo: teacherProfileMap.get(teacherIdStr) || null,
            courseId: b.courseId,
            duration: b.duration,
            studentCount: b.studentCount || 1,
            pricingSnapshot: b.pricingSnapshot,
            payout: b.payout,
            payment: b.payment || { status: b.paymentStatus || "paid" },
            gateway: b.payment?.stripePaymentIntentId?.startsWith("pay_") ? "razorpay" : "stripe",
            paymentMethod: "card",
            orderId: null,
            paymentId: b.payment?.stripePaymentIntentId || b.paymentId,
            status: b.status,
          });
        }
      }
    }

    // Sort by most recent
    formattedPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      payments: formattedPayments,
      count: formattedPayments.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Look in Payment collection first
    const paymentRecord = await Payment.findById(id)
      .populate("userId", "name email")
      .populate("productReference.teacherId", "name email")
      .populate("productReference.courseId", "name")
      .populate("bookingId")
      .lean();

    if (paymentRecord) {
      return res.json({ payment: paymentRecord });
    }

    // Fallback to Booking
    const booking = await Booking.findById(id)
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .populate("courseId", "name")
      .populate("languageId", "name code")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    res.json({ payment: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * Update payout status for a booking
 */
export const updatePayoutStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payout status" });
    }

    let booking = await Booking.findById(id);
    let paymentDoc = null;

    // If ID is a Payment record ID, find the linked booking
    if (!booking) {
      paymentDoc = await Payment.findById(id);
      if (paymentDoc) {
        if (paymentDoc.bookingId) {
          booking = await Booking.findById(paymentDoc.bookingId);
        } else if (paymentDoc.paymentId || paymentDoc.orderId) {
          booking = await Booking.findOne({
            $or: [
              { paymentId: paymentDoc.paymentId },
              { "payment.stripePaymentIntentId": paymentDoc.paymentId },
              { "payment.stripePaymentIntentId": paymentDoc.orderId },
            ],
          });
        }
      }
    } else {
      paymentDoc = await Payment.findOne({ bookingId: booking._id });
    }

    if (!booking && !paymentDoc) {
      return res.status(404).json({ message: "Payment or Booking record not found" });
    }

    if (booking) {
      if (!booking.payout) {
        booking.payout = {
          teacherAmountUSD: 0,
          teacherAmountINR: 0,
          teacherCurrency: "INR",
          status: "pending",
        };
      }
      booking.payout.status = status;
      await booking.save();

    }

    if (paymentDoc) {
      if (!paymentDoc.productReference) paymentDoc.productReference = {};
      if (!paymentDoc.productReference.metadata) paymentDoc.productReference.metadata = {};
      paymentDoc.productReference.metadata.payoutStatus = status;
      paymentDoc.productReference.metadata.payoutUpdatedAt = new Date();
      paymentDoc.markModified("productReference.metadata");
      await paymentDoc.save();
    }

    // Recalculate teacher profile earnings
    const teacherId = booking?.teacherId || paymentDoc?.productReference?.teacherId;
    if (teacherId) {
      const completedBookings = await Booking.find({
        teacherId,
        paymentStatus: "paid",
      });

      let totalEarnings = 0;
      let pendingPayout = 0;

      completedBookings.forEach((b) => {
        let teacherAmount = 0;
        if (b.payout && typeof b.payout.teacherAmountINR === "number" && b.payout.teacherAmountINR > 0) {
          teacherAmount = b.payout.teacherAmountINR;
        } else if (b.pricingSnapshot?.studentPaid?.currency === "INR" && b.pricingSnapshot?.studentPaid?.amount > 0) {
          const baseUSD = b.pricingSnapshot?.baseAmountUSD || 0;
          const feeUSD = b.pricingSnapshot?.platformFeeUSD || 0;
          const totalUSD = baseUSD + feeUSD;
          if (totalUSD > 0) {
            teacherAmount = Math.round((baseUSD / totalUSD) * b.pricingSnapshot.studentPaid.amount * 100) / 100;
          } else {
            teacherAmount = b.pricingSnapshot.studentPaid.amount;
          }
        } else if (b.payout && b.payout.teacherAmountUSD) {
          const rate = (b.pricingSnapshot?.exchangeRatesUsed?.INR && b.pricingSnapshot.exchangeRatesUsed.INR > 1) 
            ? b.pricingSnapshot.exchangeRatesUsed.INR 
            : 83.33;
          teacherAmount = Math.round(b.payout.teacherAmountUSD * rate * 100) / 100;
        }

        totalEarnings += teacherAmount;
        if (b.payout && b.payout.status === "pending") {
          pendingPayout += teacherAmount;
        }
      });

      const paidAmount = Math.max(0, Math.round((totalEarnings - pendingPayout) * 100) / 100);
      totalEarnings = Math.round(totalEarnings * 100) / 100;
      pendingPayout = Math.round(pendingPayout * 100) / 100;

      await TeacherProfile.findOneAndUpdate(
        { userId: teacherId },
        { totalEarnings, pendingPayout, paidAmount }
      );
    }

    res.json({
      success: true,
      message: `Payout status updated to ${status}`,
      status,
      booking,
    });
  } catch (err) {
    next(err);
  }
};
