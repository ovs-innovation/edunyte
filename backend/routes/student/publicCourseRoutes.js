import express from "express";
import { getCourses, getCourseById } from "../../controllers/courseController.js";
import { getCourseTeachersBySlug } from "../../controllers/teacherCourseController.js";
import { getCourseAvailability } from "../../controllers/availabilityController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  req.query.status = "active";
  next();
}, getCourses);

// This route must come before /:id to avoid route conflicts
router.get("/:slug/teachers", getCourseTeachersBySlug);
router.get("/availability", getCourseAvailability);

router.get("/:id", getCourseById);

export default router;

