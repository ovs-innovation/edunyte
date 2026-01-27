import React, { useState, useEffect } from 'react';
import { 
  getSelectedCurrency, 
  setSelectedCurrency, 
  SUPPORTED_CURRENCIES,
  getCurrencyInfo,
  getExchangeRates 
} from '../../services/currencyService';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onCurrencyChange?: (currency: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  showLabel = true,
  size = 'md',
  onCurrencyChange,
}) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(getSelectedCurrency());
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load exchange rates on mount
    const loadRates = async () => {
      setIsLoading(true);
      try {
        await getExchangeRates();
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();

    // Listen for currency changes from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      setSelectedCurrencyState(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setSelectedCurrencyState(currency);
    setIsOpen(false);
    
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
  };

  const currentCurrency = getCurrencyInfo(selectedCurrency);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            w-full bg-white border border-gray-300 rounded-md shadow-sm 
            ${sizeClasses[size]}
            text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-between
          `}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{currentCurrency.symbol}</span>
            <span>{currentCurrency.code}</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {SUPPORTED_CURRENCIES.map((currency) => {
                const isSelected = currency.code === selectedCurrency;
                return (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencySelect(currency.code)}
                    className={`
                      w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                      flex items-center justify-between
                      ${isSelected ? 'bg-primary/10 font-medium' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500 text-sm">- {currency.name}</span>
                    </div>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;

