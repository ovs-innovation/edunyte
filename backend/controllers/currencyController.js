import { getExchangeRates, convertCurrency as convertCurrencyService } from '../services/exchangeRateService.js';

/**
 * GET /api/exchange-rates
 * Returns cached exchange rates from Redis
 */
export const getExchangeRatesController = async (req, res, next) => {
  try {
    const { forceRefresh } = req.query;
    const ratesData = await getExchangeRates(forceRefresh === 'true');

    res.json({
      success: true,
      baseCurrency: ratesData.base,
      rates: ratesData.rates,
      timestamp: ratesData.timestamp,
      cacheAge: ratesData.cacheAge,
      isStale: ratesData.isStale,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/currency/convert
 * Convert amount from one currency to another
 */
export const convertCurrency = async (req, res, next) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be a number',
      });
    }

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'fromCurrency and toCurrency are required',
      });
    }

    const convertedAmount = await convertCurrencyService(amount, fromCurrency.toUpperCase(), toCurrency.toUpperCase());

    res.json({
      success: true,
      originalAmount: amount,
      convertedAmount,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
    });
  } catch (err) {
    next(err);
  }
};

