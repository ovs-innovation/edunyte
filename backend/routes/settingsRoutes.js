import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getSettings);
router.patch("/", verifyToken, requirePermission("settings.edit"), updateSettings);

export default router;

