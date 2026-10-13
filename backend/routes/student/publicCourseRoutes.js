import express from "express";
import { getCourses, getCourseById } from "../../controllers/courseController.js";
import { getCourseTeachersBySlug } from "../../controllers/teacherCourseController.js";
import { getCourseAvailability } from "../../controllers/availabilityController.js";
import { getPublicCourseLectures } from "../../controllers/lectureController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  req.query.status = "active";
  next();
}, getCourses);

// These routes must come before /:id to avoid route conflicts
router.get("/:slug/teachers", getCourseTeachersBySlug);
router.get("/availability", getCourseAvailability);
router.get("/:courseIdentifier/lectures", verifyToken, getPublicCourseLectures);

router.get("/:id", getCourseById);

export default router;

