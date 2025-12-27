import express from "express";
import {
  createAvailability,
  bulkCreateAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
} from "../../controllers/availabilityController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createAvailabilitySchema,
  bulkCreateAvailabilitySchema,
  updateAvailabilitySchema,
} from "../../validations/availabilityValidation.js";

const router = express.Router();

// All routes require teacher authentication
router.use(verifyToken);

// Create single availability slot
router.post(
  "/",
  requirePermission("teacher_courses.view"),
  validateRequest(createAvailabilitySchema),
  createAvailability
);

// Create multiple availability slots (bulk)
router.post(
  "/bulk",
  requirePermission("teacher_courses.view"),
  validateRequest(bulkCreateAvailabilitySchema),
  bulkCreateAvailability
);

// Get teacher's availability
router.get("/", requirePermission("teacher_courses.view"), getMyAvailability);

// Update availability slot
router.patch(
  "/:id",
  requirePermission("teacher_courses.view"),
  validateRequest(updateAvailabilitySchema),
  updateAvailability
);

// Delete availability slot
router.delete("/:id", requirePermission("teacher_courses.view"), deleteAvailability);

export default router;

