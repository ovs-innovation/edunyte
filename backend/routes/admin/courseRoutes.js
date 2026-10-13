import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../controllers/courseController.js";
import {
  createLecture,
  getCourseLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
  reorderLectures,
  uploadLectureVideo,
} from "../../controllers/lectureController.js";
import {
  getAllAdminBookings,
  updateMeetingDetails,
} from "../../controllers/bookingController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCourseSchema, updateCourseSchema } from "../../validations/courseValidation.js";
import { createLectureSchema, updateLectureSchema } from "../../validations/lectureValidation.js";
import videoUpload from "../../utils/videoUploadConfig.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);

// Live booking sessions management (Admin)
router.get(
  "/live-bookings",
  requirePermission("courses.view"),
  getAllAdminBookings
);

router.patch(
  "/live-bookings/:id/meeting",
  requirePermission("courses.edit"),
  updateMeetingDetails
);

// Lecture reordering
router.patch(
  "/lectures/reorder",
  requirePermission("courses.edit"),
  reorderLectures
);

// Lecture by ID operations
router.get(
  "/lectures/:id",
  requirePermission("courses.view"),
  getLectureById
);

router.patch(
  "/lectures/:id",
  requirePermission("courses.edit"),
  validateRequest(updateLectureSchema),
  updateLecture
);

router.delete(
  "/lectures/:id",
  requirePermission("courses.delete"),
  deleteLecture
);

// Upload lecture video file to Cloudinary
router.post(
  "/:courseId/lectures/upload-video",
  requirePermission("courses.edit"),
  videoUpload.single("video"),
  uploadLectureVideo
);

// Course lectures operations
router.get(
  "/:courseId/lectures",
  requirePermission("courses.view"),
  getCourseLectures
);

router.post(
  "/:courseId/lectures",
  requirePermission("courses.edit"),
  validateRequest(createLectureSchema),
  createLecture
);

// Create course (Admin only)
router.post(
  "/",
  requirePermission("courses.create"),
  validateRequest(createCourseSchema),
  createCourse
);

// Get all courses (Admin)
router.get("/", requirePermission("courses.view"), getCourses);

// Get single course (Admin)
router.get("/:id", requirePermission("courses.view"), getCourseById);

// Update course (Admin only)
router.patch(
  "/:id",
  requirePermission("courses.edit"),
  validateRequest(updateCourseSchema),
  updateCourse
);

// Delete course (Admin only)
router.delete("/:id", requirePermission("courses.delete"), deleteCourse);

export default router;


