import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../controllers/courseController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCourseSchema, updateCourseSchema } from "../../validations/courseValidation.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);

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


