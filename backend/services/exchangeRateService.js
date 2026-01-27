import axios from 'axios';
import { getRedisClient } from '../config/redis.js';

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_API_URL = process.env.EXCHANGE_RATE_API_URL || 'https://v6.exchangerate-api.com/v6';
const BASE_CURRENCY = 'USD';
const REDIS_RATES_KEY = 'exchange_rates';
const REDIS_TIMESTAMP_KEY = 'exchange_rates_timestamp';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch exchange rates from ExchangeRate-API
 */
const fetchRatesFromAPI = async () => {
  try {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error('EXCHANGE_RATE_API_KEY is not configured');
    }

    const url = `${EXCHANGE_RATE_API_URL}/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.result === 'success' && response.data.conversion_rates) {
      return {
        base: BASE_CURRENCY,
        rates: response.data.conversion_rates,
        timestamp: response.data.time_last_update_unix * 1000, // Convert to milliseconds
      };
    } else {
      throw new Error('Invalid response from ExchangeRate-API');
    }
  } catch (error) {
    console.error('Error fetching exchange rates from API:', error.message);
    
    // Fallback to hardcoded rates if API fails
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, using cached rates');
    }
    
    throw error;
  }
};

/**
 * Store exchange rates in Redis
 */
export const storeExchangeRates = async (ratesData) => {
  try {
    const redis = getRedisClient();
    const timestamp = Date.now();

    await redis.setEx(
      REDIS_RATES_KEY,
      7 * 24 * 60 * 60, // 7 days expiry (longer than cache duration for fallback)
      JSON.stringify(ratesData)
    );

    await redis.setEx(
      REDIS_TIMESTAMP_KEY,
      7 * 24 * 60 * 60,
      timestamp.toString()
    );

    console.log(`Exchange rates stored in Redis at ${new Date(timestamp).toISOString()}`);
    return ratesData;
  } catch (error) {
    console.error('Error storing exchange rates in Redis:', error);
    throw error;
  }
};

/**
 * Get exchange rates from Redis cache
 */
export const getCachedExchangeRates = async () => {
  try {
    const redis = getRedisClient();
    
    const [ratesData, timestamp] = await Promise.all([
      redis.get(REDIS_RATES_KEY),
      redis.get(REDIS_TIMESTAMP_KEY),
    ]);

    if (!ratesData || !timestamp) {
      return null;
    }

    const parsedRates = JSON.parse(ratesData);
    const cacheAge = Date.now() - parseInt(timestamp, 10);

    return {
      ...parsedRates,
      cacheAge,
      isStale: cacheAge > CACHE_DURATION_MS,
    };
  } catch (error) {
    console.error('Error getting cached exchange rates:', error);
    return null;
  }
};

/**
 * Fetch and store latest exchange rates
 */
export const fetchAndStoreExchangeRates = async () => {
  try {
    console.log('Fetching latest exchange rates from API...');
    const ratesData = await fetchRatesFromAPI();
    await storeExchangeRates(ratesData);
    return ratesData;
  } catch (error) {
    console.error('Failed to fetch and store exchange rates:', error);
    
    // Try to return cached rates as fallback
    const cached = await getCachedExchangeRates();
    if (cached) {
      console.log('Using cached exchange rates as fallback');
      return cached;
    }
    
    throw error;
  }
};

/**
 * Get exchange rates (from cache or fetch new)
 */
export const getExchangeRates = async (forceRefresh = false) => {
  try {
    // If not forcing refresh, try cache first
    if (!forceRefresh) {
      const cached = await getCachedExchangeRates();
      if (cached && !cached.isStale) {
        return cached;
      }
    }

    // Fetch fresh rates
    return await fetchAndStoreExchangeRates();
  } catch (error) {
    // If fetch fails, try to return stale cache
    const cached = await getCachedExchangeRates();
    if (cached) {
      console.warn('Using stale cached rates due to fetch failure');
      return cached;
    }
    
    throw error;
  }
};

/**
 * Get rate for a specific currency
 */
export const getExchangeRate = async (targetCurrency) => {
  try {
    const ratesData = await getExchangeRates();
    
    if (targetCurrency === BASE_CURRENCY) {
      return 1;
    }

    const rate = ratesData.rates[targetCurrency];
    if (!rate) {
      throw new Error(`Exchange rate not found for currency: ${targetCurrency}`);
    }

    return rate;
  } catch (error) {
    console.error(`Error getting exchange rate for ${targetCurrency}:`, error);
    throw error;
  }
};

/**
 * Convert amount from USD (base) to target currency
 */
export const convertFromUSD = async (amount, targetCurrency) => {
  if (targetCurrency === BASE_CURRENCY) {
    return amount;
  }

  const rate = await getExchangeRate(targetCurrency);
  return parseFloat((amount * rate).toFixed(2));
};

/**
 * Convert amount from source currency to target currency
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === BASE_CURRENCY) {
    return await convertFromUSD(amount, toCurrency);
  }

  if (toCurrency === BASE_CURRENCY) {
    const fromRate = await getExchangeRate(fromCurrency);
    return parseFloat((amount / fromRate).toFixed(2));
  }

  // Convert fromCurrency -> USD -> toCurrency
  const fromRate = await getExchangeRate(fromCurrency);
  const toRate = await getExchangeRate(toCurrency);
  const usdAmount = amount / fromRate;
  return parseFloat((usdAmount * toRate).toFixed(2));
};

