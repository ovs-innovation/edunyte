import { useCurrency } from '../contexts/CurrencyContext'
import { convertPrice } from '../utils/currencyHelper'

export const usePriceFormatter = () => {
  const { currency, formatPrice } = useCurrency()

  const formatPriceWithConversion = (priceInINR: number): string => {
    if (!priceInINR || priceInINR === 0) {
      return formatPrice(0)
    }
    const convertedPrice = convertPrice(priceInINR, currency)
    return formatPrice(convertedPrice)
  }

  const formatPriceDirect = (price: number): string => {
    return formatPrice(price || 0)
  }

  const getConvertedPrice = (priceInINR: number): number => {
    if (!priceInINR || priceInINR === 0) {
      return 0
    }
    return convertPrice(priceInINR, currency)
  }

  return {
    formatPriceWithConversion,
    formatPriceDirect,
    getConvertedPrice,
    currency,
  }
}

