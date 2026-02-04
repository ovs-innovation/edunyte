import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createCheckoutPaymentIntent, stripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Authenticated checkout init
router.post("/checkout/payment-intent", verifyToken, createCheckoutPaymentIntent);

// Stripe webhook (raw body is handled in app.js)
router.post("/stripe/webhook", stripeWebhook);

export default router;


