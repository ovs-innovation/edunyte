import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'

// Key used in localStorage to persist language preference
const STORAGE_KEY = 'app_language'

// Determine initial language:
// 1. from localStorage (if set)
// 2. otherwise from browser
// 3. fallback to 'en'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return stored

    const browserLang = window.navigator.language?.split('-')[0]
    if (browserLang === 'hi') return 'hi'
  }
  return 'en'
}

export const LANGUAGE_STORAGE_KEY = STORAGE_KEY

i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // If a key is missing in the current language,
    // it will fall back to the fallbackLng (en).
    returnEmptyString: false,
  })

// Persist language change to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lng)
  }
})

export default i18n


