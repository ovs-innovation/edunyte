import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe client (lazy-initialized)
 *
 * WHY:
 * - Keeps the server bootable even if env vars aren't configured yet (local dev).
 * - Controllers will throw a clear error if Stripe isn't configured.
 */
let stripeClient = null;
export const getStripe = () => {
  if (stripeClient) return stripeClient;
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  stripeClient = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  return stripeClient;
};

/**
 * Stripe rounding rules:
 * - Stripe expects the smallest currency unit (cents, paise, etc.)
 */
export const toStripeAmount = (amount, currency) => {
  const c = (currency || "USD").toString().toUpperCase();
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n) || n < 0) throw new Error("Invalid amount");

  // Zero-decimal currencies
  const zeroDecimal = new Set(["JPY", "KRW", "VND"]);
  if (zeroDecimal.has(c)) return Math.round(n);
  return Math.round(n * 100);
};


