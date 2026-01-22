const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const fetchExchangeRates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency/rates`)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return null
  }
}

export const convertPriceFromBackend = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, fromCurrency, toCurrency }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to convert currency')
    }
    
    const data = await response.json()
    return data.convertedAmount
  } catch (error) {
    console.error('Failed to convert price:', error)
    return null
  }
}

export const convertPricesForItems = async (
  items: Array<{ price: number; currency?: string }>,
  targetCurrency: string
) => {
  try {
    const convertedItems = await Promise.all(
      items.map(async (item) => {
        const fromCurrency = item.currency || 'INR'
        const convertedPrice = await convertPriceFromBackend(
          item.price,
          fromCurrency,
          targetCurrency
        )
        return {
          ...item,
          price: convertedPrice ?? item.price,
          currency: targetCurrency,
        }
      })
    )
    return convertedItems
  } catch (error) {
    console.error('Failed to convert prices:', error)
    return items
  }
}

