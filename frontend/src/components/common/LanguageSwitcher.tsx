import React from 'react'
import { useTranslation } from 'react-i18next'

// Simple language switcher for toggling between English and Hindi.
// This only affects UI text configured via i18next and does not touch backend content.
const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation()

  const currentLang = i18n.language || 'en'

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value
    if (newLang !== currentLang) {
      i18n.changeLanguage(newLang)
    }
  }

  return (
    <div className="language-switcher">
      <select
        aria-label={t('common.language')}
        value={currentLang}
        onChange={handleChange}
      >
        <option value="en">{t('common.english')}</option>
        <option value="hi">{t('common.hindi')}</option>
      </select>
    </div>
  )
}

export default LanguageSwitcher


