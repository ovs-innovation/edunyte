import express from "express";
import { getCourses, getCourseById } from "../../controllers/courseController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  req.query.status = "active";
  next();
}, getCourses);

router.get("/:id", getCourseById);

export default router;

