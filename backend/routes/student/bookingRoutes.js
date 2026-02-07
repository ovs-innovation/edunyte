import express from "express";
import {
  getAvailableSlots,
} from "../../controllers/availabilityController.js";
import {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  rescheduleBooking,
} from "../../controllers/bookingController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createBookingSchema, updateBookingStatusSchema } from "../../validations/bookingValidation.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get available slots for a teacher-course
router.get("/available-slots/:teacherCourseId", getAvailableSlots);

// Create booking (student books a slot)
router.post(
  "/",
  validateRequest(createBookingSchema),
  createBooking
);

// Get student's bookings
router.get("/my-bookings", getMyBookings);

// Get single booking
router.get("/:id", getBooking);

// Update booking status (cancel, etc.)
router.patch(
  "/:id/status",
  validateRequest(updateBookingStatusSchema),
  updateBookingStatus
);


// Reschedule booking
router.post(
  "/:id/reschedule",
  // validateRequest(rescheduleBookingSchema), // Optional: Add validation if needed
  rescheduleBooking
);

export default router;

