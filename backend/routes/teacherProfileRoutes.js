import express from "express";
import {
  getTeacherProfile,
  getMyTeacherProfile,
  updateTeacherProfile,
  listTeacherProfiles,
  updateKycStatus,
  updateEarnings,
  processPayout,
} from "../controllers/teacherProfileController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { requireOwnOrPermission } from "../middlewares/ownResourceMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMyTeacherProfile);
router.get("/:userId", verifyToken, requireOwnOrPermission("teachers.view"), getTeacherProfile);
router.patch("/me", verifyToken, updateTeacherProfile);
router.patch("/:userId", verifyToken, requireOwnOrPermission("teachers.manage"), updateTeacherProfile);
router.get("/", verifyToken, requirePermission("teachers.view"), listTeacherProfiles);
router.patch("/:userId/kyc", verifyToken, requirePermission("teachers.manage"), updateKycStatus);
router.patch("/:userId/earnings", verifyToken, requirePermission("teachers.manage"), updateEarnings);
router.post("/:userId/payout", verifyToken, requirePermission("teachers.manage"), processPayout);

export default router;
