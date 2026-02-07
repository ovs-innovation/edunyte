import Booking from "../models/bookingModel.js";
import Availability from "../models/availabilityModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { generateMeeting } from "../utils/meetingGateway.js";
import {
  computeSlotBaseAmountUSD,
  getUsdToCurrencyRateOrThrow,
  buildUsdExchangeRateSnapshot,
  roundMoney2,
} from "../utils/pricingHelper.js";
import { toUTCDate } from "../utils/timezoneHelper.js";

/**
 * Booking Controller
 * Manages student-teacher session bookings
 */

/**
 * Create a booking (Student books a slot)
 */
export const createBooking = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    // Client should never send any calculated prices.
    // We accept only the selected currency (display/checkout currency).
    const {
      availabilityId,
      studentNotes,
      selectedCurrency,
      currency: requestedCurrencyLegacy,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid availability ID" });
    }

    // Verify user is a student
    const user = await User.findById(studentId);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Only students can book sessions" });
    }

    // Get availability slot
    const availability = await Availability.findById(availabilityId).populate("courseId");
    if (!availability) {
      return res.status(404).json({ message: "Availability slot not found" });
    }
    if (availability.status !== "available") {
      return res.status(400).json({ message: "This slot is not available" });
    }
    if (new Date(availability.date) < new Date()) {
      return res.status(400).json({ message: "Cannot book past slots" });
    }

    // Get teacherCourse - we need courseId and languageId from request
    // For now, we'll need languageId in the request body
    const { languageId } = req.body;
    if (!languageId) {
      return res.status(400).json({ message: "Language ID is required for booking" });
    }

    const teacherCourse = await TeacherCourse.findOne({
      teacherId: availability.teacherId,
      courseId: availability.courseId,
      languageIds: { $in: [languageId] },
      status: "approved",
    });

    if (!teacherCourse) {
      return res.status(400).json({ message: "Teacher course is not approved for this language" });
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({ availabilityId });
    if (existingBooking) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    // Generate meeting link (auto-generate Zoom meeting)
    const teacher = await User.findById(teacherCourse.teacherId);
    const meetingDetails = await generateMeeting(
      {
        sessionDate: availability.date,
        startTime: availability.startTime,
        endTime: availability.endTime,
        duration: availability.duration,
      },
      teacher?.email || "",
      "zoom"
    );

    // SECURITY CRITICAL:
    // - Amount is calculated ONLY on server from USD base + Redis rates.
    const baseAmountUSD =
      availability?.pricing?.baseAmountUSD !== undefined
        ? Number(availability.pricing.baseAmountUSD)
        : computeSlotBaseAmountUSD({
            basePriceUSDPerHour: teacherCourse?.pricing?.basePriceUSD || 0,
            durationMinutes: availability.duration,
          });

    const targetCurrency = (selectedCurrency || requestedCurrencyLegacy || "USD").toString().toUpperCase();
    const { rate: studentRate } = await getUsdToCurrencyRateOrThrow(targetCurrency);
    const studentAmount = roundMoney2(baseAmountUSD * studentRate);

    const teacherCurrency = (teacherCourse?.pricing?.teacherCurrency || "USD").toString().toUpperCase();
    const teacherPayoutAmount = roundMoney2(
      (Number(teacherCourse?.pricing?.teacherPrice || 0) * availability.duration) / 60
    );

    // Snapshot exchange rates for refund safety (do NOT use live rates later)
    const exchangeRatesSnapshot = buildUsdExchangeRateSnapshot({
      [targetCurrency]: studentRate,
      [teacherCurrency]: teacherCourse?.pricing?.exchangeRateAtCreation || 1,
    });

    const pricingSnapshot = {
      baseAmountUSD: Number(baseAmountUSD),
      baseCurrency: "USD",
      studentPaid: { amount: studentAmount, currency: targetCurrency },
      teacherPayout: { amount: teacherPayoutAmount, currency: teacherCurrency },
      exchangeRates: exchangeRatesSnapshot,
      timestamp: new Date(),
    };

    // Create booking
    // Store USD price in DB, but use converted price for payment
    const booking = await Booking.create({
      studentId,
      teacherId: teacherCourse.teacherId,
      teacherCourseId: teacherCourse._id,
      availabilityId,
      courseId: teacherCourse.courseId,
      languageId: languageId,
      sessionDate: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      duration: availability.duration,
      timezone: availability.timezone,
      pricingSnapshot,
      studentNotes: studentNotes || "",
      status: "scheduled",
      paymentStatus: "pending",
      meetingUrl: meetingDetails.joinUrl || "",
      meetingId: meetingDetails.meetingId || "",
      meetingPassword: meetingDetails.password || "",
    });

    // Return booking with backend-calculated amounts for payment gateway
    const bookingResponse = booking.toObject();
    bookingResponse.paymentPrice = studentAmount;
    bookingResponse.paymentCurrency = targetCurrency;
    bookingResponse.baseAmountUSD = baseAmountUSD;
    bookingResponse.baseCurrency = "USD";

    // Update availability status
    availability.status = "booked";
    availability.bookingId = booking._id;
    await availability.save();

    await booking.populate([
      { path: "studentId", select: "name email" },
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
    ]);

    // Convert booking to object and add payment info
    const bookingObj = booking.toObject();
    bookingObj.paymentPrice = studentAmount;
    bookingObj.paymentCurrency = targetCurrency;
    bookingObj.baseAmountUSD = baseAmountUSD;
    bookingObj.baseCurrency = "USD";

    res.status(201).json({ 
      booking: bookingObj, 
      message: "Booking created successfully",
      payment: {
        amount: studentAmount,
        currency: targetCurrency,
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get student's bookings
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { status, startDate, endDate } = req.query;

    const query = { studentId };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) query.sessionDate.$gte = new Date(startDate);
      if (endDate) query.sessionDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageId", "name code")
      .populate("teacherCourseId", "pricing timezone")
      .sort({ sessionDate: 1, startTime: 1 });

    res.json({ bookings, count: bookings.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teacher's bookings
 */
export const getTeacherBookings = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { status, startDate, endDate } = req.query;

    const query = { teacherId };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) query.sessionDate.$gte = new Date(startDate);
      if (endDate) query.sessionDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("studentId", "name email")
      .populate("courseId", "name description")
      .populate("languageId", "name code")
      .populate("teacherCourseId", "pricing timezone")
      .sort({ sessionDate: 1, startTime: 1 });

    res.json({ bookings, count: bookings.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single booking
 */
export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id)
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageId", "name code")
      .populate("teacherCourseId", "pricing timezone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user has access (student or teacher)
    if (booking.studentId._id.toString() !== userId && booking.teacherId._id.toString() !== userId) {
      return res.status(403).json({ message: "You don't have permission to view this booking" });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, cancellationReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.studentId.toString() !== userId && booking.teacherId.toString() !== userId) {
      return res.status(403).json({ message: "You don't have permission to update this booking" });
    }

    if (status === "cancelled") {
      const sessionStart = toUTCDate(booking.sessionDate, booking.startTime, booking.timezone);
      const now = new Date();
      const timeDiff = sessionStart.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      if (req.user.role === "student" && hoursDiff < 24) {
        return res.status(400).json({ message: "Lessons can only be cancelled at least 24 hours in advance." });
      }

      booking.status = "cancelled";
      booking.cancelledBy = userId;
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || "";

      const availability = await Availability.findById(booking.availabilityId);
      if (availability) {
        availability.status = "available";
        availability.bookingId = null;
        await availability.save();
      }
    } else {
      booking.status = status;
    }

    await booking.save();
    await booking.populate([
      { path: "studentId", select: "name email" },
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
    ]);

    res.json({ booking, message: "Booking updated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Update meeting details (Teacher only)
 */
export const updateMeetingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { meetingType, meetingUrl, meetingId, meetingPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "Only the teacher can update meeting details" });
    }

    if (meetingType !== undefined) booking.meetingType = meetingType;
    if (meetingUrl !== undefined) booking.meetingUrl = meetingUrl;
    if (meetingId !== undefined) booking.meetingId = meetingId;
    if (meetingPassword !== undefined) booking.meetingPassword = meetingPassword;

    await booking.save();
    await booking.populate([
      { path: "studentId", select: "name email" },
      { path: "teacherId", select: "name email" },
    ]);

    res.json({ booking, message: "Meeting details updated successfully" });
  } catch (err) {
    next(err);
  }
};


/**
 * Reschedule a booking
 */
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { availabilityId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.studentId.toString() !== userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cannot reschedule a cancelled booking" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot reschedule a completed booking" });
    }

    // Check 24h rule
    const sessionStart = toUTCDate(booking.sessionDate, booking.startTime, booking.timezone);
    const now = new Date();
    const timeDiff = sessionStart.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      return res.status(400).json({ message: "Rescheduling is only allowed at least 24 hours in advance." });
    }

    // Get new availability
    const newAvailability = await Availability.findById(availabilityId);
    if (!newAvailability) {
      return res.status(404).json({ message: "New slot not found" });
    }
    if (newAvailability.status !== "available") {
      return res.status(400).json({ message: "Selected slot is not available" });
    }
    
    // Ensure same teacher
    if (newAvailability.teacherId.toString() !== booking.teacherId.toString()) {
       return res.status(400).json({ message: "New slot must be with the same teacher" }); 
    }

    // Generate NEW meeting link
    const teacher = await User.findById(booking.teacherId);
    
    const meetingDetails = await generateMeeting(
      {
        sessionDate: newAvailability.date,
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime,
        duration: newAvailability.duration,
      },
      teacher ? teacher.email : "",
      "zoom"
    );

    // Update OLD availability
    const oldAvailability = await Availability.findById(booking.availabilityId);
    if (oldAvailability) {
      oldAvailability.status = "available";
      oldAvailability.bookingId = null;
      await oldAvailability.save();
    }

    // Update NEW availability
    newAvailability.status = "booked";
    newAvailability.bookingId = booking._id;
    await newAvailability.save();

    // Update Booking
    booking.availabilityId = newAvailability._id;
    booking.sessionDate = newAvailability.date;
    booking.startTime = newAvailability.startTime;
    booking.endTime = newAvailability.endTime;
    booking.duration = newAvailability.duration;
    
    // Update meeting info
    if (meetingDetails) {
        booking.meetingUrl = meetingDetails.joinUrl || booking.meetingUrl;
        booking.meetingId = meetingDetails.meetingId || booking.meetingId;
        booking.meetingPassword = meetingDetails.password || booking.meetingPassword;
    }

    // Update timezone and lesson sub-document (CRITICAL for frontend display)
    booking.timezone = newAvailability.timezone;
    const newScheduledAt = toUTCDate(newAvailability.date, newAvailability.startTime, newAvailability.timezone);
    
    booking.lesson = {
       duration: newAvailability.duration,
       scheduledAt: newScheduledAt,
       timezone: newAvailability.timezone
    };
    
    await booking.save();
    
    await booking.populate([
      { path: "studentId", select: "name email" },
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
    ]);

    res.json({ booking, message: "Booking rescheduled successfully" });

  } catch (err) {
    next(err);
  }
};
