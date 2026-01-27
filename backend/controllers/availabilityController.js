import Availability from "../models/availabilityModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import Course from "../models/courseModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { convertCurrency, getBaseCurrency } from "../utils/currencyHelper.js";
import { convertTimeBetweenTimezones, toUTCDate, utcDateToLocalTime } from "../utils/timezoneHelper.js";

/**
 * Availability Controller
 * Manages teacher availability slots
 */

/**
 * Create a single availability slot
 */
export const createAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, date, startTime, endTime, duration, timezone, isRecurring, recurringPattern, recurringEndDate } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify teacher has at least one approved teacherCourse for this course
    const teacherCourse = await TeacherCourse.findOne({
      teacherId,
      courseId,
      status: "approved",
    });
    if (!teacherCourse) {
      return res.status(403).json({ message: "You must have at least one approved language for this course before setting availability" });
    }

    const slotDate = new Date(date);

    // Determine teacher's working timezone for this slot
    const effectiveTimezone = timezone || teacherCourse.timezone || "UTC";

    // Compute absolute UTC instants
    const startTimeUTC = toUTCDate(slotDate, startTime, effectiveTimezone);

    // Prevent duplicate slot for same teacher, course, date and startTime
    const existingSlot = await Availability.findOne({
      teacherId,
      courseId,
      startTimeUTC,
      status: { $ne: "cancelled" },
    });
    if (existingSlot) {
      return res.status(400).json({
        message: "You already have an availability slot for this date and start time for this course",
      });
    }

    // Calculate price for this session slot
    // Price = (Teacher price per hour * duration in hours) + Platform margin + Meeting platform cost (dynamic based on duration)
    const PLATFORM_MARGIN_PERCENT = parseFloat(process.env.PLATFORM_MARGIN_PERCENT || "20"); // Default 20%
    const MEETING_PLATFORM_COST_PER_MINUTE = parseFloat(process.env.MEETING_PLATFORM_COST_PER_MINUTE || "0.01"); // Default $0.01 per minute
    const MEETING_PLATFORM_BASE_COST = parseFloat(process.env.MEETING_PLATFORM_BASE_COST || "0.10"); // Base cost per session
    
    const durationInHours = duration / 60; // Convert minutes to hours
    const teacherPricePerHour = teacherCourse.price;
    const teacherPriceForSession = teacherPricePerHour * durationInHours;
    const platformMargin = (teacherPriceForSession * PLATFORM_MARGIN_PERCENT) / 100;
    // Dynamic meeting platform cost: base cost + (cost per minute * duration)
    const meetingPlatformCost = MEETING_PLATFORM_BASE_COST + (MEETING_PLATFORM_COST_PER_MINUTE * duration);
    const totalPrice = teacherPriceForSession + platformMargin + meetingPlatformCost;

    const priceBreakdown = {
      teacherPrice: parseFloat(teacherPriceForSession.toFixed(2)),
      platformMargin: parseFloat(platformMargin.toFixed(2)),
      platformMarginPercent: PLATFORM_MARGIN_PERCENT,
      meetingPlatformCost: parseFloat(meetingPlatformCost.toFixed(2)),
      meetingPlatformCostPerMinute: MEETING_PLATFORM_COST_PER_MINUTE,
      meetingPlatformBaseCost: MEETING_PLATFORM_BASE_COST,
    };

    const endTimeUTC = new Date(startTimeUTC.getTime() + duration * 60 * 1000);

    const slot = await Availability.create({
      teacherId,
      courseId,
      date: slotDate,
      startTime,
      endTime,
      duration,
      startTimeUTC,
      endTimeUTC,
      price: parseFloat(totalPrice.toFixed(2)),
      currency: teacherCourse.currency || getBaseCurrency(),
      priceBreakdown,
      timezone: effectiveTimezone,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : null,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
      status: "available",
    });

    res.status(201).json({ availability: slot });
  } catch (err) {
    next(err);
  }
};

/**
 * Create multiple availability slots (bulk)
 */
export const bulkCreateAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, slots } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify teacher has at least one approved teacherCourse for this course
    const teacherCourse = await TeacherCourse.findOne({
      teacherId,
      courseId,
      status: "approved",
    });
    if (!teacherCourse) {
      return res.status(403).json({ message: "You must have at least one approved language for this course before setting availability" });
    }

    // Calculate price configuration
    const PLATFORM_MARGIN_PERCENT = parseFloat(process.env.PLATFORM_MARGIN_PERCENT || "20"); // Default 20%
    const MEETING_PLATFORM_COST_PER_MINUTE = parseFloat(process.env.MEETING_PLATFORM_COST_PER_MINUTE || "0.01"); // Default $0.01 per minute
    const MEETING_PLATFORM_BASE_COST = parseFloat(process.env.MEETING_PLATFORM_BASE_COST || "0.10"); // Base cost per session

    const createdSlots = [];
    for (const slotData of slots) {
      // Calculate price for this session slot
      const durationInHours = slotData.duration / 60; // Convert minutes to hours
      const teacherPricePerHour = teacherCourse.price;
      const teacherPriceForSession = teacherPricePerHour * durationInHours;
      const platformMargin = (teacherPriceForSession * PLATFORM_MARGIN_PERCENT) / 100;
      // Dynamic meeting platform cost: base cost + (cost per minute * duration)
      const meetingPlatformCost = MEETING_PLATFORM_BASE_COST + (MEETING_PLATFORM_COST_PER_MINUTE * slotData.duration);
      const totalPrice = teacherPriceForSession + platformMargin + meetingPlatformCost;

      const priceBreakdown = {
        teacherPrice: parseFloat(teacherPriceForSession.toFixed(2)),
        platformMargin: parseFloat(platformMargin.toFixed(2)),
        platformMarginPercent: PLATFORM_MARGIN_PERCENT,
        meetingPlatformCost: parseFloat(meetingPlatformCost.toFixed(2)),
        meetingPlatformCostPerMinute: MEETING_PLATFORM_COST_PER_MINUTE,
        meetingPlatformBaseCost: MEETING_PLATFORM_BASE_COST,
      };

      const slotDate = new Date(slotData.date);
      const effectiveTimezone = slotData.timezone || teacherCourse.timezone || "UTC";
      const startTimeUTC = toUTCDate(slotDate, slotData.startTime, effectiveTimezone);

      // Skip creation if a slot already exists for this teacher, course and startTimeUTC
      const existingSlot = await Availability.findOne({
        teacherId,
        courseId,
        startTimeUTC,
        status: { $ne: "cancelled" },
      });
      if (existingSlot) {
        // Just skip duplicates; front-end can infer from count if needed
        // eslint-disable-next-line no-continue
        continue;
      }

      const endTimeUTC = new Date(startTimeUTC.getTime() + slotData.duration * 60 * 1000);

      const slot = await Availability.create({
        teacherId,
        courseId,
        date: slotDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        duration: slotData.duration,
        startTimeUTC,
        endTimeUTC,
        price: parseFloat(totalPrice.toFixed(2)),
        currency: teacherCourse.currency || getBaseCurrency(),
        priceBreakdown,
        timezone: effectiveTimezone,
        isRecurring: slotData.isRecurring || false,
        recurringPattern: slotData.isRecurring ? slotData.recurringPattern : null,
        recurringEndDate: slotData.recurringEndDate ? new Date(slotData.recurringEndDate) : null,
        status: "available",
      });
      createdSlots.push(slot);
    }

    res.status(201).json({ availabilities: createdSlots, count: createdSlots.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teacher's availability slots
 */
export const getMyAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, startDate, endDate, status } = req.query;

    const query = { teacherId };
    if (courseId) {
      query.courseId = courseId;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (status) {
      query.status = status;
    }

    const availabilities = await Availability.find(query)
      .populate("courseId", "name description")
      .populate("bookingId", "studentId status")
      .sort({ date: 1, startTime: 1 });

    res.json({ availabilities, count: availabilities.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get available slots for a teacher-course (for students)
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { teacherCourseId } = req.params;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(teacherCourseId)) {
      return res.status(400).json({ message: "Invalid teacher course ID" });
    }

    // Verify teacherCourse is approved
    const teacherCourse = await TeacherCourse.findById(teacherCourseId);
    if (!teacherCourse || teacherCourse.status !== "approved") {
      return res.status(404).json({ message: "Teacher course not found or not approved" });
    }

    // Get availability slots for the course (not specific to language)
    const query = {
      teacherId: teacherCourse.teacherId,
      courseId: teacherCourse.courseId,
      status: "available",
      date: { $gte: new Date() }, // Only future dates
    };

    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }

    const availabilities = await Availability.find(query)
      .populate("courseId", "name description")
      .sort({ date: 1, startTime: 1 });

    res.json({ availabilities, count: availabilities.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Get availability for a course (for students)
 * Supports timezone conversion
 */
export const getCourseAvailability = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const { teacherId, startDate, endDate, studentTimezone } = req.query;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Valid courseId is required" });
    }

    const query = {
      courseId,
      status: "available",
      date: { $gte: new Date() },
    };

    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      query.teacherId = teacherId;
    }

    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }

    const availabilities = await Availability.find(query)
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .sort({ date: 1, startTimeUTC: 1, startTime: 1 });

    const targetTimezone = studentTimezone || null;

    const processedAvailabilities = availabilities.map((av) => {
      const avObj = av.toObject();
      const sourceTimezone = av.timezone || "UTC";

      // Prefer UTC instants if available
      if (av.startTimeUTC) {
        const tz = targetTimezone || sourceTimezone;
        avObj.startTime = utcDateToLocalTime(av.startTimeUTC, tz);
        avObj.endTime = utcDateToLocalTime(av.endTimeUTC || av.startTimeUTC, tz);
        avObj.displayTimezone = tz;
        avObj.originalTimezone = sourceTimezone;
      } else if (targetTimezone) {
        // Legacy fallback: convert from local wall time using helper
        try {
          avObj.startTime = convertTimeBetweenTimezones(av.date, av.startTime, sourceTimezone, targetTimezone);
          avObj.endTime = convertTimeBetweenTimezones(av.date, av.endTime, sourceTimezone, targetTimezone);
          avObj.displayTimezone = targetTimezone;
          avObj.originalTimezone = sourceTimezone;
        } catch (err) {
          console.error("Timezone conversion error (legacy):", err);
          avObj.displayTimezone = sourceTimezone;
        }
      } else {
        avObj.displayTimezone = sourceTimezone;
      }

      return avObj;
    });

    res.json({ availabilities: processedAvailabilities, count: processedAvailabilities.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Update availability slot
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { id } = req.params;
    const { startTime, endTime, duration, status, timezone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid availability ID" });
    }

    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    if (availability.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You don't have permission to update this availability" });
    }
    if (availability.status === "booked" && status !== "booked") {
      return res.status(400).json({ message: "Cannot modify a booked slot. Cancel the booking first." });
    }

    if (startTime !== undefined) availability.startTime = startTime;
    if (endTime !== undefined) availability.endTime = endTime;
    if (timezone !== undefined) availability.timezone = timezone;
    if (status !== undefined) availability.status = status;
    
    // Recalculate price if duration changes
    if (duration !== undefined && duration !== availability.duration) {
      const teacherCourse = await TeacherCourse.findOne({
        teacherId: availability.teacherId,
        courseId: availability.courseId,
        status: "approved",
      });
      
      if (teacherCourse) {
        const PLATFORM_MARGIN_PERCENT = parseFloat(process.env.PLATFORM_MARGIN_PERCENT || "20");
        const MEETING_PLATFORM_COST_PER_MINUTE = parseFloat(process.env.MEETING_PLATFORM_COST_PER_MINUTE || "0.01");
        const MEETING_PLATFORM_BASE_COST = parseFloat(process.env.MEETING_PLATFORM_BASE_COST || "0.10");
        
        const durationInHours = duration / 60;
        const teacherPricePerHour = teacherCourse.price;
        const teacherPriceForSession = teacherPricePerHour * durationInHours;
        const platformMargin = (teacherPriceForSession * PLATFORM_MARGIN_PERCENT) / 100;
        // Dynamic meeting platform cost: base cost + (cost per minute * duration)
        const meetingPlatformCost = MEETING_PLATFORM_BASE_COST + (MEETING_PLATFORM_COST_PER_MINUTE * duration);
        const totalPrice = teacherPriceForSession + platformMargin + meetingPlatformCost;

        availability.duration = duration;
        availability.price = parseFloat(totalPrice.toFixed(2));
        availability.currency = teacherCourse.currency || getBaseCurrency();
        availability.priceBreakdown = {
          teacherPrice: parseFloat(teacherPriceForSession.toFixed(2)),
          platformMargin: parseFloat(platformMargin.toFixed(2)),
          platformMarginPercent: PLATFORM_MARGIN_PERCENT,
          meetingPlatformCost: parseFloat(meetingPlatformCost.toFixed(2)),
          meetingPlatformCostPerMinute: MEETING_PLATFORM_COST_PER_MINUTE,
          meetingPlatformBaseCost: MEETING_PLATFORM_BASE_COST,
        };
      } else {
        availability.duration = duration;
      }
    }

    await availability.save();
    await availability.populate("courseId", "name description");

    res.json({ availability });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete availability slot
 */
export const deleteAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid availability ID" });
    }

    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    if (availability.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You don't have permission to delete this availability" });
    }
    if (availability.status === "booked") {
      return res.status(400).json({ message: "Cannot delete a booked slot. Cancel the booking first." });
    }

    await availability.deleteOne();
    res.json({ success: true, message: "Availability deleted successfully" });
  } catch (err) {
    next(err);
  }
};

