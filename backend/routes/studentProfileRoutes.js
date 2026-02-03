import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getStudentProfile,
  listStudentProfiles,
  updateStudentProfile,
  recalculateProgress,
  getCourseProgress,
} from "../controllers/studentProfileController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.patch("/me", verifyToken, updateMyProfile);
router.get("/:userId", verifyToken, requirePermission("students.view"), getStudentProfile);
router.get("/", verifyToken, requirePermission("students.view"), listStudentProfiles);
router.patch("/:userId", verifyToken, requirePermission("students.edit"), updateStudentProfile);
router.post("/:userId/recalculate-progress", verifyToken, requirePermission("students.edit"), recalculateProgress);
router.get("/:userId/course-progress", verifyToken, requirePermission("students.view"), getCourseProgress);

export default router;
