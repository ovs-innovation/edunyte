import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateObject } from '../services/translationService'
import { BASE_LANGUAGE } from '../i18n/languageConfig'

interface UseAutoTranslateOptions {
  enabled?: boolean
  sourceLang?: string
}

export const useAutoTranslate = <T extends Record<string, any>>(
  data: T,
  options: UseAutoTranslateOptions = {}
) => {
  const { i18n } = useTranslation()
  const { enabled = true, sourceLang = BASE_LANGUAGE } = options
  const [translatedData, setTranslatedData] = useState<T>(data)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    const currentLang = i18n.language || BASE_LANGUAGE

    if (!enabled || currentLang === BASE_LANGUAGE || currentLang === sourceLang) {
      setTranslatedData(data)
      return
    }

    const translateData = async () => {
      setIsTranslating(true)
      try {
        const translated = await translateObject(data, currentLang, sourceLang)
        setTranslatedData(translated as T)
      } catch (error) {
        console.error('Auto-translation failed:', error)
        setTranslatedData(data)
      } finally {
        setIsTranslating(false)
      }
    }

    translateData()
  }, [data, i18n.language, enabled, sourceLang])

  return { translatedData, isTranslating }
}

export const useAutoTranslateText = (text: string, enabled: boolean = true) => {
  const { i18n } = useTranslation()
  const [translatedText, setTranslatedText] = useState(text)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    const currentLang = i18n.language || BASE_LANGUAGE

    if (!enabled || !text || currentLang === BASE_LANGUAGE) {
      setTranslatedText(text)
      return
    }

    const translate = async () => {
      setIsTranslating(true)
      try {
        const { translateText } = await import('../services/translationService')
        const translated = await translateText(text, currentLang, BASE_LANGUAGE)
        setTranslatedText(translated)
      } catch (error) {
        console.error('Text translation failed:', error)
        setTranslatedText(text)
      } finally {
        setIsTranslating(false)
      }
    }

    translate()
  }, [text, i18n.language, enabled])

  return { translatedText, isTranslating }
}

