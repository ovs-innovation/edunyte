import { convertCurrency } from '../services/exchangeRateService.js';

/**
 * Middleware to convert prices in request body from USD to requested currency
 * Expects req.body.currency to contain the target currency
 * Expects price fields to be in USD (base currency)
 */
export const convertPricesMiddleware = async (req, res, next) => {
  try {
    const targetCurrency = req.body.currency || req.query.currency || 'USD';
    
    // If currency is USD, no conversion needed
    if (targetCurrency.toUpperCase() === 'USD') {
      return next();
    }

    // Convert price fields if they exist
    const priceFields = ['price', 'amount', 'total', 'subtotal'];
    
    for (const field of priceFields) {
      if (req.body[field] && typeof req.body[field] === 'number') {
        const converted = await convertCurrency(
          req.body[field],
          'USD', // All prices in DB are USD
          targetCurrency.toUpperCase()
        );
        req.body[field] = converted;
        req.body[`original${field.charAt(0).toUpperCase() + field.slice(1)}USD`] = req.body[field];
      }
    }

    // Store original currency for reference
    req.body.requestedCurrency = targetCurrency.toUpperCase();
    req.body.baseCurrency = 'USD';

    next();
  } catch (error) {
    console.error('Error in currency conversion middleware:', error);
    next();
  }
};

/**
 * Helper to convert price for checkout
 * Used in booking/payment controllers
 */
export const convertPriceForCheckout = async (usdPrice, targetCurrency) => {
  try {
    if (targetCurrency.toUpperCase() === 'USD') {
      return usdPrice;
    }
    
    return await convertCurrency(usdPrice, 'USD', targetCurrency.toUpperCase());
  } catch (error) {
    console.error('Error converting price for checkout:', error);
    throw error;
  }
};

