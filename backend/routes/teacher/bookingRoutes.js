import express from "express";
import {
  getTeacherBookings,
  getBooking,
  updateBookingStatus,
  updateMeetingDetails,
} from "../../controllers/bookingController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  updateBookingStatusSchema,
  updateBookingMeetingSchema,
} from "../../validations/bookingValidation.js";

const router = express.Router();

// All routes require teacher authentication
router.use(verifyToken);

// Get teacher's bookings
router.get("/", requirePermission("teacher_courses.view"), getTeacherBookings);

// Get single booking
router.get("/:id", requirePermission("teacher_courses.view"), getBooking);

// Update booking status
router.patch(
  "/:id/status",
  requirePermission("teacher_courses.view"),
  validateRequest(updateBookingStatusSchema),
  updateBookingStatus
);

// Update meeting details (teacher only)
router.patch(
  "/:id/meeting",
  requirePermission("teacher_courses.view"),
  validateRequest(updateBookingMeetingSchema),
  updateMeetingDetails
);

export default router;

