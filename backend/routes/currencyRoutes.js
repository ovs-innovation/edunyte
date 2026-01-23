import express from "express";
import { convertCurrency, getExchangeRates } from "../controllers/currencyController.js";

const router = express.Router();

// Get exchange rates
router.get("/rates", getExchangeRates);

// Convert currency
router.post("/convert", convertCurrency);

export default router;

