import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import hi from './locales/hi.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import { LANGUAGES, BASE_LANGUAGE, getEnabledLanguages } from './languageConfig'

const STORAGE_KEY = 'app_language'

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES[stored]?.enabled) {
      return stored
    }

    const browserLang = window.navigator.language?.split('-')[0]
    if (browserLang && LANGUAGES[browserLang]?.enabled) {
      return browserLang
    }
  }
  return BASE_LANGUAGE
}

export const LANGUAGE_STORAGE_KEY = STORAGE_KEY

// NOTE:
// We intentionally do NOT type all translations as `typeof en` because not all locale files
// contain a complete keyset. i18next supports partial dictionaries and will fallback.
const resources: Record<string, { translation: Record<string, any> }> = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
  ar: { translation: ar },
}

const enabledLanguages = getEnabledLanguages()
const supportedLngs = enabledLanguages.map((lang) => lang.code)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: BASE_LANGUAGE,
    supportedLngs,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lng)
  }
})

export const addLanguageResource = async (langCode: string, translations: Record<string, any>) => {
  i18n.addResourceBundle(langCode, 'translation', translations, true, true)
}

export const loadLanguageTranslations = async (langCode: string): Promise<void> => {
  if (langCode === BASE_LANGUAGE || i18n.hasResourceBundle(langCode, 'translation')) {
    return
  }

  try {
    const response = await fetch(`/locales/${langCode}.json`)
    if (response.ok) {
      const translations = await response.json()
      addLanguageResource(langCode, translations)
    }
  } catch (error) {
    console.warn(`Failed to load translations for ${langCode}:`, error)
  }
}

export default i18n
