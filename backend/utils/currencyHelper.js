const BASE_CURRENCY = "INR";

const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.8,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
  AED: 0.044,
  SAR: 0.045,
};

export const getBaseCurrency = () => BASE_CURRENCY;

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  if (fromCurrency === BASE_CURRENCY) {
    return parseFloat((amount * toRate).toFixed(2));
  }
  
  if (toCurrency === BASE_CURRENCY) {
    return parseFloat((amount / fromRate).toFixed(2));
  }
  
  const baseAmount = amount / fromRate;
  return parseFloat((baseAmount * toRate).toFixed(2));
};

export const formatPrice = (amount, currency) => {
  return {
    amount: parseFloat(amount.toFixed(2)),
    currency: currency || BASE_CURRENCY,
    baseAmount: currency === BASE_CURRENCY ? parseFloat(amount.toFixed(2)) : convertCurrency(amount, currency, BASE_CURRENCY),
    baseCurrency: BASE_CURRENCY,
  };
};

export const transformPriceFields = (data, fields, targetCurrency) => {
  if (!data || !Array.isArray(fields)) return data;
  
  const currency = targetCurrency || BASE_CURRENCY;
  const transformed = Array.isArray(data) ? [...data] : { ...data };
  
  fields.forEach((field) => {
    if (Array.isArray(transformed)) {
      transformed.forEach((item) => {
        if (item && typeof item[field] === "number" && item.currency) {
          const converted = convertCurrency(item[field], item.currency, currency);
          item[field] = converted;
          item.currency = currency;
          item.baseAmount = item[field];
          item.baseCurrency = BASE_CURRENCY;
        }
      });
    } else {
      if (transformed[field] && typeof transformed[field] === "number" && transformed.currency) {
        const converted = convertCurrency(transformed[field], transformed.currency, currency);
        transformed[field] = converted;
        transformed.currency = currency;
        transformed.baseAmount = transformed[field];
        transformed.baseCurrency = BASE_CURRENCY;
      }
    }
  });
  
  return transformed;
};


