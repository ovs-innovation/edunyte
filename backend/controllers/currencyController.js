import { convertCurrency as convertCurrencyUtil, getBaseCurrency } from "../utils/currencyHelper.js";

export const getExchangeRates = async (req, res, next) => {
  try {
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
      BRL: 0.06,
      PLN: 0.048,
      UAH: 0.44,
    };

    res.json({
      success: true,
      baseCurrency: getBaseCurrency(),
      rates: EXCHANGE_RATES,
    });
  } catch (err) {
    next(err);
  }
};

export const convertCurrency = async (req, res, next) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be a number",
      });
    }

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: "fromCurrency and toCurrency are required",
      });
    }

    const convertedAmount = convertCurrencyUtil(amount, fromCurrency, toCurrency);

    res.json({
      success: true,
      originalAmount: amount,
      convertedAmount,
      fromCurrency,
      toCurrency,
    });
  } catch (err) {
    next(err);
  }
};

