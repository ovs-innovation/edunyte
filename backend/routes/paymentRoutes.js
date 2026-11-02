import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
  createCheckoutPaymentIntent, 
  getCheckoutPricingPreview,
  stripeWebhook, 
  createFreeBooking 
} from "../controllers/paymentController.js";
import { 
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
  getPaymentStatusController,
} from "../controllers/razorpayController.js";

const router = express.Router();

// ==========================================
// Razorpay & Pricing Endpoints
// ==========================================
// Pricing Preview (does not require Stripe, works with all amounts)
router.post("/checkout/preview", verifyToken, getCheckoutPricingPreview);
router.post("/pricing-preview", verifyToken, getCheckoutPricingPreview);

// A. Create Order: POST /api/payment/create-order or /api/payments/create-order
router.post("/create-order", verifyToken, createRazorpayOrderController);
router.post("/razorpay/create-order", verifyToken, createRazorpayOrderController);

// B. Verify Payment: POST /api/payment/verify or /api/payments/verify
router.post("/verify", verifyToken, verifyRazorpayPaymentController);
router.post("/razorpay/verify", verifyToken, verifyRazorpayPaymentController);

// C. Payment Status: GET /api/payment/status/:orderId or /api/payment/status?orderId=...
router.get("/status/:orderId", verifyToken, getPaymentStatusController);
router.get("/status", verifyToken, getPaymentStatusController);
router.get("/razorpay/status/:orderId", verifyToken, getPaymentStatusController);
router.get("/razorpay/status", verifyToken, getPaymentStatusController);

// ==========================================
// Stripe Endpoints
// ==========================================
// Authenticated checkout init
router.post("/checkout/payment-intent", verifyToken, createCheckoutPaymentIntent);

// Free booking init
router.post("/checkout/free-booking", verifyToken, createFreeBooking);

// Stripe webhook (raw body is handled in app.js)
router.post("/stripe/webhook", stripeWebhook);

export default router;
