/**
 * Currency Service
 * Handles currency conversion and formatting for the frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CURRENCY_STORAGE_KEY = 'selected_currency';
const RATES_STORAGE_KEY = 'exchange_rates_cache';
const RATES_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp?: number;
  cacheAge?: number;
  isStale?: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA' },
];

const DEFAULT_CURRENCY = 'USD';

/**
 * Get selected currency from localStorage
 */
export const getSelectedCurrency = (): string => {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (stored && SUPPORTED_CURRENCIES.find(c => c.code === stored)) {
    return stored;
  }
  return DEFAULT_CURRENCY;
};

/**
 * Set selected currency in localStorage
 */
export const setSelectedCurrency = (currency: string): void => {
  if (typeof window === 'undefined') return;
  
  if (SUPPORTED_CURRENCIES.find(c => c.code === currency)) {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    // Dispatch custom event for currency change
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
  }
};

/**
 * Get currency info
 */
export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
};

/**
 * Fetch exchange rates from API
 */
export const fetchExchangeRates = async (forceRefresh = false): Promise<ExchangeRates> => {
  try {
    const url = `${API_BASE_URL}/currency/exchange-rates${forceRefresh ? '?forceRefresh=true' : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    // Cache the rates
    if (typeof window !== 'undefined') {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify({
        ...data,
        cachedAt: Date.now(),
      }));
    }
    
    return {
      base: data.baseCurrency,
      rates: data.rates,
      timestamp: data.timestamp,
      cacheAge: data.cacheAge,
      isStale: data.isStale,
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Try to return cached rates as fallback
    const cached = getCachedExchangeRates();
    if (cached) {
      console.warn('Using cached exchange rates due to fetch failure');
      return cached;
    }
    
    throw error;
  }
};

/**
 * Get cached exchange rates from localStorage
 */
export const getCachedExchangeRates = (): ExchangeRates | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(RATES_STORAGE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const cacheAge = Date.now() - (data.cachedAt || 0);
    
    // Return cached data if still valid
    if (cacheAge < RATES_CACHE_DURATION) {
      return {
        base: data.baseCurrency,
        rates: data.rates,
        timestamp: data.timestamp,
        cacheAge,
        isStale: false,
      };
    }
    
    return {
      base: data.baseCurrency,
      rates: data.rates,
      timestamp: data.timestamp,
      cacheAge,
      isStale: true,
    };
  } catch (error) {
    console.error('Error reading cached exchange rates:', error);
    return null;
  }
};

/**
 * Get exchange rates (from cache or fetch)
 */
export const getExchangeRates = async (forceRefresh = false): Promise<ExchangeRates> => {
  // Try cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedExchangeRates();
    if (cached && !cached.isStale) {
      return cached;
    }
  }
  
  // Fetch fresh rates
  return await fetchExchangeRates(forceRefresh);
};

/**
 * Convert price from USD (base) to target currency
 */
export const convertPrice = async (usdAmount: number, targetCurrency: string): Promise<number> => {
  if (targetCurrency === 'USD') {
    return usdAmount;
  }
  
  const rates = await getExchangeRates();
  const rate = rates.rates[targetCurrency];
  
  if (!rate) {
    console.warn(`Exchange rate not found for ${targetCurrency}, returning original amount`);
    return usdAmount;
  }
  
  return parseFloat((usdAmount * rate).toFixed(2));
};

/**
 * Format price with currency symbol using Intl.NumberFormat
 */
export const formatPrice = (amount: number, currency: string = getSelectedCurrency()): string => {
  const currencyInfo = getCurrencyInfo(currency);
  
  try {
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
};

/**
 * Format price with custom options
 */
export const formatPriceCustom = (
  amount: number,
  currency: string = getSelectedCurrency(),
  options?: Intl.NumberFormatOptions
): string => {
  const currencyInfo = getCurrencyInfo(currency);
  
  try {
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
};

/**
 * Convert and format price in one call
 */
export const convertAndFormatPrice = async (
  usdAmount: number,
  targetCurrency: string = getSelectedCurrency()
): Promise<string> => {
  const convertedAmount = await convertPrice(usdAmount, targetCurrency);
  return formatPrice(convertedAmount, targetCurrency);
};
