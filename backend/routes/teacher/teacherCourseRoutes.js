import express from "express";
import { joinCourse, getMyCourses, exitCourse, updateCourseRequest } from "../../controllers/teacherCourseController.js";
import { createCourse } from "../../controllers/courseController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCourseSchema } from "../../validations/courseValidation.js";
import { createTeacherCourseSchema, updateTeacherCourseSchema } from "../../validations/teacherCourseValidation.js";
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

/**
 * Propose a new course (Teacher)
 * Status will be 'pending' by default in controller
 */
router.post(
  "/propose-course",
  requirePermission("courses.create"),
  validateRequest(createCourseSchema),
  createCourse
);

// Join a course (create request)
router.post(
  "/course-join",
  requirePermission("teacher_courses.create"),
  validateRequest(createTeacherCourseSchema),
  joinCourse
);

// Get my course requests
router.get("/my-courses", requirePermission("teacher_courses.view"), getMyCourses);

// Update a course request
router.patch(
  "/my-courses/:id",
  requirePermission("teacher_courses.update"),
  validateRequest(updateTeacherCourseSchema),
  updateCourseRequest
);

// Exit/Leave a course
router.delete("/my-courses/:id", requirePermission("teacher_courses.delete"), exitCourse);

export default router;


