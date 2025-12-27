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
    const { courseId, languageIds, price, currency, timezone, introductionVideo, experience, bio } = req.body;

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

    // Verify all languages exist and are active
    if (!Array.isArray(languageIds) || languageIds.length === 0) {
      return res.status(400).json({ message: "At least one language is required" });
    }

    const languages = await Language.find({ _id: { $in: languageIds } });
    if (languages.length !== languageIds.length) {
      return res.status(404).json({ message: "One or more languages not found" });
    }

    const inactiveLanguages = languages.filter((lang) => lang.status !== "active");
    if (inactiveLanguages.length > 0) {
      return res.status(400).json({ message: "One or more languages are not active" });
    }

    // Check for existing request for this teacher-course combination
    const existing = await TeacherCourse.findOne({
      teacherId,
      courseId,
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(409).json({ message: "Request already pending for this course" });
      }
      if (existing.status === "approved") {
        return res.status(409).json({ message: "You are already approved for this course" });
      }
      // If rejected, allow re-application
      existing.status = "pending";
      existing.languageIds = languageIds;
      existing.price = price;
      existing.currency = (currency || "USD").toUpperCase();
      existing.timezone = timezone || "UTC";
      existing.introductionVideo = introductionVideo || "";
      existing.experience = experience || "";
      existing.bio = bio || "";
      existing.rejectionReason = "";
      await existing.save();
      await existing.populate([
        { path: "teacherId", select: "name email" },
        { path: "courseId", select: "name description category image status" },
        { path: "languageIds", select: "name code" },
      ]);
      return res.json({ teacherCourse: existing, message: "Request resubmitted successfully" });
    }

    // Create new request with multiple languages
    const teacherCourse = await TeacherCourse.create({
      teacherId,
      courseId,
      languageIds,
      price,
      currency: (currency || "USD").toUpperCase(),
      timezone: timezone || "UTC",
      introductionVideo: introductionVideo || "",
      experience: experience || "",
      bio: bio || "",
      status: "pending",
    });

    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
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
      .populate("languageIds", "name code nativeName")
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
      query.languageIds = { $in: [languageId] }; // Find courses that include this language
    }
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const teacherCourses = await TeacherCourse.find(query)
      .populate("teacherId", "name email status")
      .populate("courseId", "name description category image status")
      .populate("languageIds", "name code nativeName")
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
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
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
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
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
    });

    // Extract all unique language IDs from all teacher courses
    const allLanguageIds = teacherCourses.reduce((acc, tc) => {
      if (Array.isArray(tc.languageIds)) {
        tc.languageIds.forEach(langId => {
          if (!acc.includes(langId.toString())) {
            acc.push(langId.toString());
          }
        });
      }
      return acc;
    }, []);

    const languages = await Language.find({
      _id: { $in: allLanguageIds },
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

    // Get all approved teacher-course mappings that include this language
    const teacherCourses = await TeacherCourse.find({
      courseId,
      languageIds: { $in: [languageId] }, // Find courses where languageIds array includes this languageId
      status: "approved",
    })
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageIds", "name code nativeName")
      .sort({ price: 1 });

    res.json({ teacherCourses, count: teacherCourses.length });
  } catch (err) {
    next(err);
  }
};

