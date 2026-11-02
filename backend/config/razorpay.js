import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

/**
 * Razorpay Environment Variables
 * NOTE: All secrets (RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
 * must remain strictly on the backend and NEVER be sent to the frontend.
 */
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/**
 * Determine Razorpay operation mode (Test or Live)
 * @returns {'test' | 'live' | 'unconfigured'}
 */
export const getRazorpayMode = () => {
  if (!RAZORPAY_KEY_ID) return "unconfigured";
  if (RAZORPAY_KEY_ID.startsWith("rzp_test_")) return "test";
  if (RAZORPAY_KEY_ID.startsWith("rzp_live_")) return "live";
  return "test"; // default fallback for test/custom keys
};

/**
 * Check if Razorpay credentials are fully configured
 * @returns {boolean}
 */
export const isRazorpayConfigured = () => {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
};

/**
 * Helper to safely mask credentials for logs
 * @param {string} key 
 * @returns {string}
 */
const maskKey = (key) => {
  if (!key || key.length < 12) return "••••••••";
  return `${key.slice(0, 8)}••••${key.slice(-4)}`;
};

/**
 * Validate Razorpay configuration during application startup
 * @param {{ strict?: boolean }} [options]
 * @returns {{ valid: boolean, mode: string, message?: string }}
 */
export const validateRazorpayConfig = ({ strict } = {}) => {
  const isProduction = process.env.NODE_ENV === "production";
  const mustBeStrict = strict ?? isProduction;
  const errors = [];
  const warnings = [];

  if (!RAZORPAY_KEY_ID) {
    errors.push("RAZORPAY_KEY_ID is missing");
  } else if (!RAZORPAY_KEY_ID.startsWith("rzp_test_") && !RAZORPAY_KEY_ID.startsWith("rzp_live_")) {
    warnings.push("RAZORPAY_KEY_ID does not start with standard prefix (rzp_test_ or rzp_live_)");
  }

  if (!RAZORPAY_KEY_SECRET) {
    errors.push("RAZORPAY_KEY_SECRET is missing");
  }

  if (!RAZORPAY_WEBHOOK_SECRET) {
    warnings.push("RAZORPAY_WEBHOOK_SECRET is not set (webhook signature verification will fail)");
  }

  const mode = getRazorpayMode();

  if (errors.length > 0) {
    const errorMsg = `[Razorpay Config Error]: ${errors.join(", ")}`;
    if (mustBeStrict) {
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    } else {
      console.warn(`⚠️ [Razorpay] Configuration incomplete: ${errors.join(", ")}. Payments via Razorpay will be disabled until set.`);
      return { valid: false, mode, message: errorMsg };
    }
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`⚠️ [Razorpay] ${w}`));
  }

  const modeBadge = mode === "live" ? "LIVE mode 🚀" : "TEST mode 🧪";
  console.log(`[Razorpay] Initialized in ${modeBadge} with Key ID: ${maskKey(RAZORPAY_KEY_ID)} ✅`);

  return { valid: true, mode };
};

/**
 * Lazy singleton instance of Razorpay client
 */
let razorpayInstance = null;

export const getRazorpayClient = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay credentials missing. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in the backend environment."
    );
  }

  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  return razorpayInstance;
};

/**
 * Proxy object for default export to allow lazy initialization and backward compatibility
 */
const razorpayProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getRazorpayClient();
      const val = client[prop];
      return typeof val === "function" ? val.bind(client) : val;
    },
  }
);

export default razorpayProxy;
