import Booking from "../models/bookingModel.js";
import Availability from "../models/availabilityModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { generateMeeting } from "../utils/meetingGateway.js";
import { convertPriceForCheckout } from "../middlewares/currencyMiddleware.js";
import { getBaseCurrency } from "../utils/currencyHelper.js";

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
    const { availabilityId, studentNotes, currency: requestedCurrency } = req.body;

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

    // Price conversion: All prices in DB are stored in USD (base currency)
    // Convert to requested currency for payment gateway
    const usdPrice = availability.price || teacherCourse.price; // Price in USD from DB
    const targetCurrency = (requestedCurrency || 'USD').toUpperCase();
    
    let convertedPrice = usdPrice;
    if (targetCurrency !== 'USD') {
      try {
        convertedPrice = await convertPriceForCheckout(usdPrice, targetCurrency);
      } catch (error) {
        console.error('Error converting price for checkout:', error);
        // Fallback to USD if conversion fails
      }
    }

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
      price: usdPrice, // Store USD price in DB
      currency: 'USD', // Always USD in DB
      studentNotes: studentNotes || "",
      status: "scheduled",
      paymentStatus: "pending",
      meetingUrl: meetingDetails.joinUrl || "",
      meetingId: meetingDetails.meetingId || "",
      meetingPassword: meetingDetails.password || "",
    });

    // Return booking with converted price for payment gateway
    const bookingResponse = booking.toObject();
    bookingResponse.paymentPrice = convertedPrice; // Price for payment gateway
    bookingResponse.paymentCurrency = targetCurrency; // Currency for payment gateway
    bookingResponse.basePrice = usdPrice; // Original USD price
    bookingResponse.baseCurrency = 'USD';

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
    bookingObj.paymentPrice = convertedPrice;
    bookingObj.paymentCurrency = targetCurrency;
    bookingObj.basePrice = usdPrice;
    bookingObj.baseCurrency = 'USD';

    res.status(201).json({ 
      booking: bookingObj, 
      message: "Booking created successfully",
      payment: {
        amount: convertedPrice,
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
      .populate("teacherCourseId", "price currency")
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
      .populate("teacherCourseId", "price currency")
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
      .populate("teacherCourseId", "price currency timezone");

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

    // Verify user has permission (student or teacher)
    if (booking.studentId.toString() !== userId && booking.teacherId.toString() !== userId) {
      return res.status(403).json({ message: "You don't have permission to update this booking" });
    }

    if (status === "cancelled") {
      booking.status = "cancelled";
      booking.cancelledBy = userId;
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || "";

      // Free up the availability slot
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

