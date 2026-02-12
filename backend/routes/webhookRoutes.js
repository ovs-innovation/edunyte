import express from "express";
import {
  handleZoomWebhook,
  manualTriggerRecording,
} from "../controllers/zoomWebhookController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/zoom", handleZoomWebhook);
router.post("/zoom/manual-trigger", authenticateToken, isAdmin, manualTriggerRecording);

export default router;
