import express from "express";
import {
  getTeacherCourseRequests,
  approveTeacherCourse,
  rejectTeacherCourse,
  updateTeacherCourse,
} from "../../controllers/teacherCourseController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateTeacherCourseStatusSchema } from "../../validations/teacherCourseValidation.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);

// Get all teacher course requests (Admin)
router.get("/", requirePermission("teacher_courses.view"), getTeacherCourseRequests);

// Approve teacher course request (Admin only)
// MUST come before /:id route
router.patch(
  "/:id/approve",
  requirePermission("teacher_courses.approve"),
  approveTeacherCourse
);

// Reject teacher course request (Admin only)
// MUST come before /:id route
router.patch(
  "/:id/reject",
  requirePermission("teacher_courses.approve"),
  validateRequest(updateTeacherCourseStatusSchema),
  rejectTeacherCourse
);

// Update teacher course (Admin only - for custom platform fee, etc.)
// MUST come after specific routes like /approve and /reject
router.patch(
  "/:id",
  requirePermission("settings.edit"),
  updateTeacherCourse
);

export default router;


