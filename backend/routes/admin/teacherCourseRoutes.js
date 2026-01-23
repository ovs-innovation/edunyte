import express from "express";
import {
  getTeacherCourseRequests,
  approveTeacherCourse,
  rejectTeacherCourse,
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
router.patch(
  "/:id/approve",
  requirePermission("teacher_courses.approve"),
  approveTeacherCourse
);

// Reject teacher course request (Admin only)
router.patch(
  "/:id/reject",
  requirePermission("teacher_courses.approve"),
  validateRequest(updateTeacherCourseStatusSchema),
  rejectTeacherCourse
);

export default router;


