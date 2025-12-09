import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getSettings);
router.patch("/", verifyToken, updateSettings);

export default router;

