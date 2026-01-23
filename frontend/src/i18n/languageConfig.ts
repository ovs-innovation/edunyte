export interface Language {
  code: string
  name: string
  nativeName: string
  flag?: string
  enabled: boolean
}

export const BASE_LANGUAGE = 'en'

export const LANGUAGES: Record<string, Language> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    enabled: true,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    enabled: true,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    enabled: true,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    enabled: true,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    enabled: true,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    enabled: true,
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    enabled: true,
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    enabled: true,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    enabled: true,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    enabled: true,
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    enabled: true,
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    enabled: true,
  },
}

export const getEnabledLanguages = (): Language[] => {
  return Object.values(LANGUAGES).filter((lang) => lang.enabled)
}

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES[code]
}

export const isLanguageEnabled = (code: string): boolean => {
  return LANGUAGES[code]?.enabled ?? false
}

