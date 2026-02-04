import { getBaseCurrency } from "./currencyHelper.js";
import { getExchangeRate } from "../services/exchangeRateService.js";

const BASE = getBaseCurrency(); // should be "USD"

const roundTo = (value, decimals) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

/**
 * Get an exchange rate from Redis-backed cache.
 *
 * Rate definition in this codebase:
 * - `USD -> TARGET` rate, i.e. units of TARGET per 1 USD.
 *
 * Example:
 * - USD_INR = 83 means 1 USD = 83 INR.
 */
export const getUsdToCurrencyRateOrThrow = async (currency) => {
  const code = (currency || BASE).toString().trim().toUpperCase();
  const rate = await getExchangeRate(code);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid exchange rate for currency: ${code}`);
  }
  return { currency: code, rate };
};

/**
 * Build TeacherCourse pricing (single source of truth).
 *
 * Teacher inputs:
 * - teacherPrice: number (in teacherCurrency) per hour
 * - teacherCurrency: ISO code
 *
 * We store:
 * - basePriceUSD: teacherPrice / (USD->teacherCurrency rate)
 * - exchangeRateAtCreation: the USD->teacherCurrency rate at that time
 *
 * WHY:
 * - Checkout uses USD base amount and re-fetches rates server-side (security).
 * - Payout uses teacher's original pricing snapshot (auditability).
 */
export const buildTeacherCoursePricing = async ({ teacherPrice, teacherCurrency }) => {
  const teacherAmount = typeof teacherPrice === "number" ? teacherPrice : Number(teacherPrice);
  if (!Number.isFinite(teacherAmount) || teacherAmount < 0) {
    throw new Error("Invalid teacherPrice");
  }

  const { currency, rate } = await getUsdToCurrencyRateOrThrow(teacherCurrency || BASE);
  const basePriceUSD = rate === 0 ? 0 : teacherAmount / rate;

  return {
    basePriceUSD: roundTo(basePriceUSD, 6), // keep higher precision for accounting conversions
    baseCurrency: BASE,
    teacherPrice: roundTo(teacherAmount, 2),
    teacherCurrency: currency,
    exchangeRateAtCreation: roundTo(rate, 8),
  };
};

/**
 * Compute slot base amount in USD from an hourly USD base price.
 */
export const computeSlotBaseAmountUSD = ({ basePriceUSDPerHour, durationMinutes }) => {
  const usdPerHour = typeof basePriceUSDPerHour === "number" ? basePriceUSDPerHour : Number(basePriceUSDPerHour);
  const minutes = typeof durationMinutes === "number" ? durationMinutes : Number(durationMinutes);
  if (!Number.isFinite(usdPerHour) || usdPerHour < 0) return 0;
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return roundTo(usdPerHour * (minutes / 60), 6);
};

/**
 * Build an exchange rate snapshot payload for bookings/refunds.
 * Format required by product: { USD_INR: 83.12, USD_AED: 3.67, ... }
 */
export const buildUsdExchangeRateSnapshot = (ratesByCurrency) => {
  const snapshot = {};
  Object.entries(ratesByCurrency || {}).forEach(([code, rate]) => {
    const c = (code || "").toString().trim().toUpperCase();
    const r = typeof rate === "number" ? rate : Number(rate);
    if (!c || !Number.isFinite(r) || r <= 0) return;
    snapshot[`USD_${c}`] = roundTo(r, 8);
  });
  return snapshot;
};

export const roundMoney2 = (value) => roundTo(value, 2);


