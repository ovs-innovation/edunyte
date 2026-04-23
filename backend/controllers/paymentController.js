import mongoose from "mongoose";
import Availability from "../models/availabilityModel.js";
import Booking from "../models/bookingModel.js";
import { resolveCheckoutContext, calculateCheckoutAmounts } from "../services/pricingService.js";
import { getStripe, toStripeAmount, STRIPE_WEBHOOK_SECRET } from "../services/stripeService.js";
import { createZoomMeeting } from "../services/zoomService.js";

export const createCheckoutPaymentIntent = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const studentId = req.user.id;
    const { teacherId, courseId, duration, selectedCurrency, selectedSlot } = req.body;
    const availabilityId = selectedSlot?.availabilityId || selectedSlot?._id || req.body.availabilityId;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacherId" });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }
    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid availabilityId" });
    }

    const { course, availability, teacherCourse } = await resolveCheckoutContext({
      teacherId,
      courseId,
      availabilityId,
    });

    const d = Number(duration);
    if (availability.duration !== d) {
      return res.status(400).json({ message: "Duration does not match selected slot" });
    }

    let holdUntil = null;
    if (process.env.NODE_ENV === "production") {
      holdUntil = new Date(Date.now() + 10 * 60 * 1000);
      const held = await Availability.findOneAndUpdate(
        {
          _id: availabilityId,
          status: "available",
          bookingId: null,
        },
        {
          $set: {
            status: "held",
            "hold.byStudentId": studentId,
            "hold.until": holdUntil,
          },
        },
        { new: true }
      );

      if (!held) {
        return res.status(409).json({ message: "Slot is no longer available" });
      }
    } else {
      if (availability.status !== "available" || availability.bookingId) {
        return res.status(409).json({ message: "Slot is no longer available" });
      }
    }

    const amounts = await calculateCheckoutAmounts({
      teacherCourse,
      duration: d,
      selectedCurrency,
      studentCount: req.body.studentCount || 1, // Pass student count from frontend
    });

    const stripeAmount = toStripeAmount(amounts.totalAmount, amounts.selectedCurrency);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: amounts.selectedCurrency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        teacherId: String(teacherId),
        studentId: String(studentId),
        courseId: String(courseId),
        availabilityId: String(availabilityId),
        teacherCourseId: String(teacherCourse._id),
        languageId: String(teacherCourse.languageIds?.[0] || ""),
        duration: String(d),
        baseAmountUSD: String(amounts.lessonAmountUSD),
        platformFeeUSD: String(amounts.platformFeeUSD),
        studentCount: String(amounts.studentCount || 1), // Add student count to metadata
      },
    });

    if (process.env.NODE_ENV === "production") {
      await Availability.updateOne(
        { _id: availabilityId },
        { $set: { "hold.stripePaymentIntentId": paymentIntent.id } }
      );
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      pricing: amounts,
      hold: holdUntil ? { until: holdUntil.toISOString() } : null,
      teacher: {
        name: typeof teacherCourse.teacherId === "object" ? teacherCourse.teacherId.name : "",
      },
      course: {
        name: course?.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send("Stripe webhook secret not configured");
    }

    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    if (event.type !== "payment_intent.succeeded") {
      return res.json({ received: true });
    }

    const pi = event.data.object;
    const meta = pi.metadata || {};

    const teacherId = meta.teacherId;
    const studentId = meta.studentId;
    const courseId = meta.courseId;
    const availabilityId = meta.availabilityId;
    const teacherCourseId = meta.teacherCourseId;
    const languageId = meta.languageId;
    const duration = Number(meta.duration || 0);
    const baseAmountUSD = Number(meta.baseAmountUSD || 0);
    const platformFeeUSD = Number(meta.platformFeeUSD || 0);
    const studentCount = Number(meta.studentCount || 1); // Extract student count

    if (!teacherId || !studentId || !courseId || !availabilityId || !teacherCourseId || !languageId) {
      return res.json({ received: true });
    }

    const existing = await Booking.findOne({ "payment.stripePaymentIntentId": pi.id });
    if (existing) {
      return res.json({ received: true });
    }

    const availability = await Availability.findById(availabilityId);
    if (!availability) return res.json({ received: true });

    // Environment-aware validation
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      // Production: strict validation requiring "held" status
      if (
        availability.status !== "held" ||
        String(availability.hold?.byStudentId || "") !== String(studentId) ||
        String(availability.hold?.stripePaymentIntentId || "") !== String(pi.id) ||
        (availability.hold?.until && new Date(availability.hold.until) < new Date())
      ) {
        return res.json({ received: true });
      }
    } else {
      // Development: allow "available" status, prevent already booked slots
      if (availability.status === "booked" || availability.bookingId) {
        return res.json({ received: true });
      }
      // In dev, status should be "available" or "held"
      if (availability.status !== "available" && availability.status !== "held") {
        return res.json({ received: true });
      }
    }

    availability.status = "booked";
    availability.hold = { byStudentId: null, until: null, stripePaymentIntentId: "" };
    await availability.save();

    const scheduledAt = availability.startTimeUTC || availability.date;

    let meeting = { meetingId: "", joinUrlStudent: "", joinUrlTeacher: "" };
    try {
      meeting = await createZoomMeeting({
        topic: "Lesson",
        startTimeUTC: scheduledAt,
        durationMinutes: duration || availability.duration,
      });
    } catch (e) {
    }

    const teacherAmountUSD = Number(baseAmountUSD) || Number(availability.pricing?.baseAmountUSD || 0);

    const booking = await Booking.create({
      studentId,
      teacherId,
      teacherCourseId,
      availabilityId,
      courseId,
      languageId,
      sessionDate: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      duration: availability.duration,
      timezone: availability.timezone,
      studentCount, // Save student count to booking
      lesson: {
        duration: availability.duration,
        scheduledAt,
        timezone: availability.timezone,
      },
      pricingSnapshot: {
        baseAmountUSD: baseAmountUSD,
        platformFeeUSD: platformFeeUSD,
        studentPaid: {
          amount: (pi.amount_received || pi.amount || 0) / 100,
          currency: (pi.currency || "usd").toUpperCase(),
        },
        exchangeRatesUsed: {},
        chargedAt: new Date(),
      },
      payout: {
        teacherAmountUSD: teacherAmountUSD,
        teacherCurrency: "USD",
        status: "pending",
      },
      payment: {
        stripePaymentIntentId: pi.id,
        status: "paid",
      },
      meeting: {
        provider: "zoom",
        meetingId: meeting.meetingId,
        joinUrlStudent: meeting.joinUrlStudent,
        joinUrlTeacher: meeting.joinUrlTeacher,
      },
      paymentStatus: "paid",
      paymentId: pi.id,
    });

    availability.bookingId = booking._id;
    await availability.save();

    return res.json({ received: true });
  } catch (err) {
    if (err && err.type === "StripeSignatureVerificationError") {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    return next(err);
  }
};

export const createFreeBooking = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { teacherId, courseId, duration, selectedCurrency, selectedSlot, studentCount } = req.body;
    const availabilityId = selectedSlot?.availabilityId || selectedSlot?._id || req.body.availabilityId;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacherId" });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }
    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid availabilityId" });
    }

    const { course, availability, teacherCourse } = await resolveCheckoutContext({
      teacherId,
      courseId,
      availabilityId,
    });

    const d = Number(duration);
    if (availability.duration !== d) {
      return res.status(400).json({ message: "Duration does not match selected slot" });
    }

    if (availability.status !== "available" || availability.bookingId) {
      return res.status(409).json({ message: "Slot is no longer available" });
    }

    const amounts = await calculateCheckoutAmounts({
      teacherCourse,
      duration: d,
      selectedCurrency,
      studentCount: studentCount || 1,
    });

    // In a "Free" booking, we bypass Stripe
    availability.status = "booked";
    await availability.save();

    const scheduledAt = availability.startTimeUTC || availability.date;

    let meeting = { meetingId: "", joinUrlStudent: "", joinUrlTeacher: "" };
    try {
      meeting = await createZoomMeeting({
        topic: "Free Lesson",
        startTimeUTC: scheduledAt,
        durationMinutes: d || availability.duration,
      });
    } catch (e) {
      console.error("Zoom meeting creation failed for free booking:", e);
    }

    const freePaymentId = `FREE_${new mongoose.Types.ObjectId()}`;

    const booking = await Booking.create({
      studentId,
      teacherId,
      teacherCourseId: teacherCourse._id,
      availabilityId,
      courseId,
      languageId: teacherCourse.languageIds?.[0],
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
        baseAmountUSD: 0,
        platformFeeUSD: 0,
        studentPaid: {
          amount: 0,
          currency: (selectedCurrency || "USD").toUpperCase(),
        },
        exchangeRatesUsed: {},
        chargedAt: new Date(),
      },
      payout: {
        teacherAmountUSD: 0,
        teacherCurrency: "USD",
        status: "pending",
      },
      payment: {
        stripePaymentIntentId: freePaymentId,
        status: "paid",
      },
      meeting: {
        provider: "zoom",
        meetingId: meeting.meetingId,
        joinUrlStudent: meeting.joinUrlStudent,
        joinUrlTeacher: meeting.joinUrlTeacher,
      },
      paymentStatus: "paid",
      paymentId: freePaymentId,
    });

    availability.bookingId = booking._id;
    await availability.save();

    res.json({
      success: true,
      bookingId: booking._id,
      message: "Free booking successful",
    });
  } catch (err) {
    next(err);
  }
};



