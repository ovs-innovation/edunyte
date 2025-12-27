import TeacherCourse from "../models/teacherCourseModel.js";
import Course from "../models/courseModel.js";
import Language from "../models/languageModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * TeacherCourse Controller
 * Handles teacher course join requests and admin approvals
 */

/**
 * Teacher: Join a course (create request)
 */
export const joinCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, languageId, price, currency, timezone } = req.body;

    // Verify user is a teacher
    const user = await User.findById(teacherId);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can join courses" });
    }

    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.status !== "active") {
      return res.status(400).json({ message: "Course is not active" });
    }

    // Verify language exists and is active
    const language = await Language.findById(languageId);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    if (language.status !== "active") {
      return res.status(400).json({ message: "Language is not active" });
    }

    // Check for duplicate request
    const existing = await TeacherCourse.findOne({
      teacherId,
      courseId,
      languageId,
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(409).json({ message: "Request already pending for this course-language combination" });
      }
      if (existing.status === "approved") {
        return res.status(409).json({ message: "You are already approved for this course-language combination" });
      }
      // If rejected, allow re-application
      existing.status = "pending";
      existing.price = price;
      existing.currency = (currency || "USD").toUpperCase();
      existing.timezone = timezone || "UTC";
      existing.rejectionReason = "";
      await existing.save();
      await existing.populate([
        { path: "teacherId", select: "name email" },
        { path: "courseId", select: "name description" },
        { path: "languageId", select: "name code" },
      ]);
      return res.json({ teacherCourse: existing, message: "Request resubmitted successfully" });
    }

    // Create new request
    const teacherCourse = await TeacherCourse.create({
      teacherId,
      courseId,
      languageId,
      price,
      currency: (currency || "USD").toUpperCase(),
      timezone: timezone || "UTC",
      status: "pending",
    });

    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
    ]);

    res.status(201).json({ teacherCourse });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate request for this course-language combination" });
    }
    next(err);
  }
};

/**
 * Teacher: Get my course requests
 */
export const getMyCourses = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { status } = req.query;

    const query = { teacherId };
    if (status) {
      query.status = status;
    }

    const teacherCourses = await TeacherCourse.find(query)
      .populate("courseId", "name description category image status")
      .populate("languageId", "name code nativeName")
      .sort({ createdAt: -1 });

    res.json({ teacherCourses, count: teacherCourses.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all teacher course requests
 */
export const getTeacherCourseRequests = async (req, res, next) => {
  try {
    const { status, courseId, languageId, teacherId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (courseId) {
      query.courseId = courseId;
    }
    if (languageId) {
      query.languageId = languageId;
    }
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const teacherCourses = await TeacherCourse.find(query)
      .populate("teacherId", "name email status")
      .populate("courseId", "name description category status")
      .populate("languageId", "name code nativeName")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ teacherCourses, count: teacherCourses.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Approve a teacher-course request
 */
export const approveTeacherCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (teacherCourse.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }

    teacherCourse.status = "approved";
    teacherCourse.reviewedBy = req.user.id;
    teacherCourse.reviewedAt = new Date();
    teacherCourse.rejectionReason = "";

    await teacherCourse.save();
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
      { path: "reviewedBy", select: "name email" },
    ]);

    res.json({ teacherCourse, message: "Request approved successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Reject a teacher-course request
 */
export const rejectTeacherCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (teacherCourse.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }

    teacherCourse.status = "rejected";
    teacherCourse.reviewedBy = req.user.id;
    teacherCourse.reviewedAt = new Date();
    teacherCourse.rejectionReason = rejectionReason || "";

    await teacherCourse.save();
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description" },
      { path: "languageId", select: "name code" },
      { path: "reviewedBy", select: "name email" },
    ]);

    res.json({ teacherCourse, message: "Request rejected successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get all available courses (only approved teacher-course mappings)
 */
export const getAvailableCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: "active" })
      .populate("createdBy", "name email")
      .sort({ name: 1 });

    res.json({ courses, count: courses.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get languages available for a course
 */
export const getCourseLanguages = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Get all approved teacher-course mappings for this course
    const teacherCourses = await TeacherCourse.find({
      courseId,
      status: "approved",
    }).distinct("languageId");

    const languages = await Language.find({
      _id: { $in: teacherCourses },
      status: "active",
    }).sort({ name: 1 });

    res.json({ languages, count: languages.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get teachers for a course-language combination
 */
export const getCourseTeachers = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { languageId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!languageId || !mongoose.Types.ObjectId.isValid(languageId)) {
      return res.status(400).json({ message: "Valid languageId query parameter is required" });
    }

    // Get all approved teacher-course mappings
    const teacherCourses = await TeacherCourse.find({
      courseId,
      languageId,
      status: "approved",
    })
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageId", "name code nativeName")
      .sort({ price: 1 });

    res.json({ teacherCourses, count: teacherCourses.length });
  } catch (err) {
    next(err);
  }
};

