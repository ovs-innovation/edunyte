import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'SAR' | 'BRL' | 'PLN' | 'UAH'

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
}

const STORAGE_KEY = 'app_currency'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  getCurrencyInfo: () => Currency
  formatPrice: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

interface CurrencyProviderProps {
  children: ReactNode
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const getInitialCurrency = (): CurrencyCode => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode
      if (stored && CURRENCIES[stored]) {
        return stored
      }
    }
    return 'INR'
  }

  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, currency)
    }
  }, [currency])

  const setCurrency = (newCurrency: CurrencyCode) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency)
    }
  }

  const getCurrencyInfo = (): Currency => {
    return CURRENCIES[currency]
  }

  const formatPrice = (amount: number): string => {
    const currencyInfo = getCurrencyInfo()
    const formattedAmount = amount.toFixed(2)
    return `${currencyInfo.symbol}${formattedAmount}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        getCurrencyInfo,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

