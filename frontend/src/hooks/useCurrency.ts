import { useState, useEffect, useCallback } from 'react';
import {
  getSelectedCurrency,
  setSelectedCurrency,
  getExchangeRates,
  convertPrice,
  formatPrice,
  convertAndFormatPrice,
  ExchangeRates,
} from '../services/currencyService';

interface UseCurrencyReturn {
  currency: string;
  setCurrency: (currency: string) => void;
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: Error | null;
  convertPrice: (usdAmount: number, targetCurrency?: string) => Promise<number>;
  formatPrice: (amount: number, currency?: string) => string;
  convertAndFormatPrice: (usdAmount: number, targetCurrency?: string) => Promise<string>;
  refreshRates: () => Promise<void>;
}

/**
 * Custom hook for currency management
 */
export const useCurrency = (): UseCurrencyReturn => {
  const [currency, setCurrencyState] = useState<string>(getSelectedCurrency());
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRates = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const exchangeRates = await getExchangeRates(forceRefresh);
      setRates(exchangeRates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load exchange rates');
      setError(error);
      console.error('Error loading exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();

    // Listen for currency changes
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrencyState(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, [loadRates]);

  const setCurrency = useCallback((newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    setCurrencyState(newCurrency);
  }, []);

  const convertPriceFn = useCallback(
    async (usdAmount: number, targetCurrency?: string) => {
      return await convertPrice(usdAmount, targetCurrency || currency);
    },
    [currency]
  );

  const formatPriceFn = useCallback(
    (amount: number, targetCurrency?: string) => {
      return formatPrice(amount, targetCurrency || currency);
    },
    [currency]
  );

  const convertAndFormatPriceFn = useCallback(
    async (usdAmount: number, targetCurrency?: string) => {
      return await convertAndFormatPrice(usdAmount, targetCurrency || currency);
    },
    [currency]
  );

  const refreshRates = useCallback(async () => {
    await loadRates(true);
  }, [loadRates]);

  return {
    currency,
    setCurrency,
    rates,
    isLoading,
    error,
    convertPrice: convertPriceFn,
    formatPrice: formatPriceFn,
    convertAndFormatPrice: convertAndFormatPriceFn,
    refreshRates,
  };
};

