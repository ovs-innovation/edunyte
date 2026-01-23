import express from "express";
import { translateText, translateBatch } from "../controllers/translationController.js";

const router = express.Router();

router.post("/", translateText);
router.post("/batch", translateBatch);

export default router;

