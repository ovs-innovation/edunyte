import express from "express";
import { convertCurrency, getExchangeRatesController } from "../controllers/currencyController.js";

const router = express.Router();

// Get exchange rates (cached from Redis)
router.get("/exchange-rates", getExchangeRatesController);

// Convert currency
router.post("/convert", convertCurrency);

export default router;

