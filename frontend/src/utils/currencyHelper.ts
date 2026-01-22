const BASE_CURRENCY = 'INR'

const EXCHANGE_RATES: Record<string, number> = {
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
}

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (!amount || amount === 0) return 0
  if (fromCurrency === toCurrency) return amount

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1
  const toRate = EXCHANGE_RATES[toCurrency] || 1

  if (fromCurrency === BASE_CURRENCY) {
    return parseFloat((amount * toRate).toFixed(2))
  }

  if (toCurrency === BASE_CURRENCY) {
    return parseFloat((amount / fromRate).toFixed(2))
  }

  const baseAmount = amount / fromRate
  return parseFloat((baseAmount * toRate).toFixed(2))
}

export const convertPrice = (amountInINR: number, targetCurrency: string): number => {
  return convertCurrency(amountInINR, BASE_CURRENCY, targetCurrency)
}

