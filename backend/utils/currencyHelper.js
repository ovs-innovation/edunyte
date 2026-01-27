const BASE_CURRENCY = "USD"; // Changed to USD as per requirements

/**
 * Get base currency (USD)
 * Note: All prices in database are stored in USD
 */
export const getBaseCurrency = () => BASE_CURRENCY;

/**
 * Convert currency using Redis exchange rates
 * This is the new async version that uses live rates
 * For backward compatibility, see convertCurrencySync below
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const { convertCurrency: convertCurrencyService } = await import('../services/exchangeRateService.js');
    return await convertCurrencyService(amount, fromCurrency.toUpperCase(), toCurrency.toUpperCase());
  } catch (error) {
    console.error('Error converting currency with service, using fallback:', error);
    // Fallback to sync version if service unavailable
    return convertCurrencySync(amount, fromCurrency, toCurrency);
  }
};

/**
 * Synchronous version for backward compatibility
 * Uses hardcoded fallback rates if Redis service is unavailable
 */
const FALLBACK_RATES = {
  USD: 1,
  INR: 83.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.0,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.34,
  AED: 3.67,
  SAR: 3.75,
};

export const convertCurrencySync = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = FALLBACK_RATES[fromCurrency?.toUpperCase()] || 1;
  const toRate = FALLBACK_RATES[toCurrency?.toUpperCase()] || 1;
  
  if (fromCurrency?.toUpperCase() === BASE_CURRENCY) {
    return parseFloat((amount * toRate).toFixed(2));
  }
  
  if (toCurrency?.toUpperCase() === BASE_CURRENCY) {
    return parseFloat((amount / fromRate).toFixed(2));
  }
  
  const baseAmount = amount / fromRate;
  return parseFloat((baseAmount * toRate).toFixed(2));
};

/**
 * Format price object
 * Note: This now assumes all amounts are in USD (base currency)
 */
export const formatPrice = (amount, currency) => {
  return {
    amount: parseFloat(amount.toFixed(2)),
    currency: currency || BASE_CURRENCY,
    baseAmount: parseFloat(amount.toFixed(2)), // Always USD in DB
    baseCurrency: BASE_CURRENCY,
  };
};

/**
 * Transform price fields in data objects/arrays
 * Note: This is async now and uses live exchange rates
 */
export const transformPriceFields = async (data, fields, targetCurrency) => {
  if (!data || !Array.isArray(fields)) return data;
  
  const currency = targetCurrency || BASE_CURRENCY;
  const transformed = Array.isArray(data) ? [...data] : { ...data };
  
  for (const field of fields) {
    if (Array.isArray(transformed)) {
      for (const item of transformed) {
        if (item && typeof item[field] === "number") {
          // Assume all prices in DB are in USD (base currency)
          const sourceCurrency = item.currency || BASE_CURRENCY;
          const converted = await convertCurrency(item[field], sourceCurrency, currency);
          item[field] = converted;
          item.currency = currency;
          item.baseAmount = item[field];
          item.baseCurrency = BASE_CURRENCY;
        }
      }
    } else {
      if (transformed[field] && typeof transformed[field] === "number") {
        const sourceCurrency = transformed.currency || BASE_CURRENCY;
        const converted = await convertCurrency(transformed[field], sourceCurrency, currency);
        transformed[field] = converted;
        transformed.currency = currency;
        transformed.baseAmount = transformed[field];
        transformed.baseCurrency = BASE_CURRENCY;
      }
    }
  }
  
  return transformed;
};


