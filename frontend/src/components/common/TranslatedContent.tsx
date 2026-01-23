import React from 'react'
import { useAutoTranslateText, useAutoTranslate } from '../../hooks/useAutoTranslate'

interface TranslatedContentProps {
  children: React.ReactNode
  enabled?: boolean
}

export const TranslatedContent: React.FC<TranslatedContentProps> = ({ 
  children, 
  enabled = true 
}) => {
  if (!enabled || typeof children !== 'string') {
    return <>{children}</>
  }

  const { translatedText } = useAutoTranslateText(children as string, enabled)
  return <>{translatedText}</>
}

interface TranslatedObjectProps<T> {
  data: T
  children: (translatedData: T) => React.ReactNode
  enabled?: boolean
}

export const TranslatedObject = <T extends Record<string, any>>({
  data,
  children,
  enabled = true,
}: TranslatedObjectProps<T>) => {
  const { translatedData } = useAutoTranslate(data, { enabled })
  return <>{children(translatedData)}</>
}

