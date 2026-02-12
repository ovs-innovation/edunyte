import express from "express";
import {
  getBookingRecording,
  listAllRecordings,
  getRecordingStats,
} from "../controllers/recordingController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/:id/recording", authenticateToken, getBookingRecording);
router.get("/", authenticateToken, isAdmin, listAllRecordings);
router.get("/stats", authenticateToken, isAdmin, getRecordingStats);

export default router;
