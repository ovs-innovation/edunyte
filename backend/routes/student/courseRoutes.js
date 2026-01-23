import express from "express";
import {
  getAvailableCourses,
  getCourseLanguages,
  getCourseTeachers,
} from "../../controllers/teacherCourseController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication (students)
router.use(verifyToken);

// Get all available courses (only approved teacher-course mappings)
router.get("/", getAvailableCourses);

// Get languages available for a course
router.get("/:courseId/languages", getCourseLanguages);

// Get teachers for a course-language combination
router.get("/:courseId/teachers", getCourseTeachers);

export default router;


