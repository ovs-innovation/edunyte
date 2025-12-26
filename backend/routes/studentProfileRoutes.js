import express from "express";
import {
  getStudentProfile,
  listStudentProfiles,
  updateStudentProfile,
  addCertificate,
} from "../controllers/studentProfileController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/:userId", verifyToken, requirePermission("students.view"), getStudentProfile);
router.get("/", verifyToken, requirePermission("students.view"), listStudentProfiles);
router.patch("/:userId", verifyToken, requirePermission("students.edit"), updateStudentProfile);
router.post("/:userId/certificates", verifyToken, requirePermission("students.edit"), addCertificate);

export default router;
