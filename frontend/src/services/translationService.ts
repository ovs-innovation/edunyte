import { BASE_LANGUAGE } from '../i18n/languageConfig'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TRANSLATION_CACHE_KEY = 'translation_cache'
const CACHE_EXPIRY_DAYS = 7

interface TranslationCache {
  [key: string]: {
    translations: Record<string, string>
    timestamp: number
  }
}

const getCache = (): TranslationCache => {
  if (typeof window === 'undefined') return {}
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

const setCache = (cache: TranslationCache): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to save translation cache:', error)
  }
}

const isCacheValid = (timestamp: number): boolean => {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - timestamp < expiryTime
}

export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang: string = BASE_LANGUAGE
): Promise<string> => {
  if (!text || targetLang === sourceLang || targetLang === BASE_LANGUAGE) {
    return text
  }

  const cacheKey = `${sourceLang}_${targetLang}_${text}`
  const cache = getCache()

  if (cache[cacheKey] && isCacheValid(cache[cacheKey].timestamp)) {
    return cache[cacheKey].translations[text] || text
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    const translatedText = data.translatedText || text

    cache[cacheKey] = {
      translations: { [text]: translatedText },
      timestamp: Date.now(),
    }
    setCache(cache)

    return translatedText
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

export const translateObject = async (
  obj: Record<string, any>,
  targetLang: string,
  sourceLang: string = BASE_LANGUAGE
): Promise<Record<string, any>> => {
  if (targetLang === sourceLang || targetLang === BASE_LANGUAGE) {
    return obj
  }

  const translated: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.trim()) {
      translated[key] = await translateText(value, targetLang, sourceLang)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      translated[key] = await translateObject(value, targetLang, sourceLang)
    } else {
      translated[key] = value
    }
  }

  return translated
}

export const translateBatch = async (
  texts: string[],
  targetLang: string,
  sourceLang: string = BASE_LANGUAGE
): Promise<string[]> => {
  if (targetLang === sourceLang || targetLang === BASE_LANGUAGE) {
    return texts
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        sourceLang,
        targetLang,
      }),
    })

    if (!response.ok) {
      throw new Error('Batch translation failed')
    }

    const data = await response.json()
    return data.translatedTexts || texts
  } catch (error) {
    console.error('Batch translation error:', error)
    return texts
  }
}

export const clearTranslationCache = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TRANSLATION_CACHE_KEY)
  }
}

