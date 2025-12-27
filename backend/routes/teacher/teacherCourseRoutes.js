import express from "express";
import { joinCourse, getMyCourses } from "../../controllers/teacherCourseController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createTeacherCourseSchema } from "../../validations/teacherCourseValidation.js";
import Course from "../../models/courseModel.js";
import Language from "../../models/languageModel.js";

const router = express.Router();

// All routes require teacher authentication
router.use(verifyToken);

/**
 * Get available courses (for teachers to join)
 * Returns only active courses
 */
router.get("/available-courses", requirePermission("courses.view"), async (req, res, next) => {
  try {
    const courses = await Course.find({ status: "active" })
      .populate("createdBy", "name email")
      .sort({ name: 1 });
    res.json({ courses, count: courses.length });
  } catch (err) {
    next(err);
  }
});

/**
 * Get available languages (for teachers to join)
 * Returns only active languages
 */
router.get("/languages", requirePermission("languages.view"), async (req, res, next) => {
  try {
    const languages = await Language.find({ status: "active" }).sort({ name: 1 });
    res.json({ languages, count: languages.length });
  } catch (err) {
    next(err);
  }
});

// Join a course (create request)
router.post(
  "/course-join",
  requirePermission("teacher_courses.create"),
  validateRequest(createTeacherCourseSchema),
  joinCourse
);

// Get my course requests
router.get("/my-courses", requirePermission("teacher_courses.view"), getMyCourses);

export default router;


