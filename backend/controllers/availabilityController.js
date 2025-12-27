import Availability from "../models/availabilityModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

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
    const { teacherCourseId, date, startTime, endTime, duration, timezone, isRecurring, recurringPattern, recurringEndDate } = req.body;

    // Verify teacher owns this teacherCourse
    const teacherCourse = await TeacherCourse.findById(teacherCourseId);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Teacher course not found" });
    }
    if (teacherCourse.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You don't have permission to manage this course" });
    }
    if (teacherCourse.status !== "approved") {
      return res.status(400).json({ message: "Course must be approved before setting availability" });
    }

    const slotDate = new Date(date);
    const slot = await Availability.create({
      teacherId,
      teacherCourseId,
      date: slotDate,
      startTime,
      endTime,
      duration,
      timezone: timezone || teacherCourse.timezone || "UTC",
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
    const { teacherCourseId, slots } = req.body;

    // Verify teacher owns this teacherCourse
    const teacherCourse = await TeacherCourse.findById(teacherCourseId);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Teacher course not found" });
    }
    if (teacherCourse.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You don't have permission to manage this course" });
    }
    if (teacherCourse.status !== "approved") {
      return res.status(400).json({ message: "Course must be approved before setting availability" });
    }

    const createdSlots = [];
    for (const slotData of slots) {
      const slotDate = new Date(slotData.date);
      const slot = await Availability.create({
        teacherId,
        teacherCourseId,
        date: slotDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        duration: slotData.duration,
        timezone: slotData.timezone || teacherCourse.timezone || "UTC",
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
    const { teacherCourseId, startDate, endDate, status } = req.query;

    const query = { teacherId };
    if (teacherCourseId) {
      query.teacherCourseId = teacherCourseId;
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
      .populate("teacherCourseId", "courseId languageId price currency")
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

    const query = {
      teacherCourseId,
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
      .populate("teacherCourseId", "courseId languageId price currency timezone")
      .sort({ date: 1, startTime: 1 });

    res.json({ availabilities, count: availabilities.length });
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
    if (duration !== undefined) availability.duration = duration;
    if (status !== undefined) availability.status = status;
    if (timezone !== undefined) availability.timezone = timezone;

    await availability.save();
    await availability.populate("teacherCourseId", "courseId languageId price currency");

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

