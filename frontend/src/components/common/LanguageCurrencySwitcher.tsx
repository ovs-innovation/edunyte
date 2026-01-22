import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrency, CURRENCIES, CurrencyCode } from '../../contexts/CurrencyContext'
import './LanguageCurrencySwitcher.scss'

const LanguageCurrencySwitcher: React.FC = () => {
  const { i18n, t } = useTranslation()
  const { currency, setCurrency, getCurrencyInfo } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const currencyDropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = i18n.language || 'en'
  const currencyInfo = getCurrencyInfo()

  const getLanguageName = (lang: string): string => {
    return lang === 'en' ? t('common.english') : t('common.hindi')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setLangDropdownOpen(false)
        setCurrencyDropdownOpen(false)
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false)
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false)
      }
    }

    if (isOpen || langDropdownOpen || currencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, langDropdownOpen, currencyDropdownOpen])

  const handleLanguageChange = (newLang: string) => {
    if (newLang !== currentLang) {
      i18n.changeLanguage(newLang)
    }
    setLangDropdownOpen(false)
  }

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency !== currency) {
      setCurrency(newCurrency)
    }
    setCurrencyDropdownOpen(false)
  }

  const getCurrencyList = (): Array<{ code: CurrencyCode; info: typeof CURRENCIES[CurrencyCode] }> => {
    const currencies = Object.entries(CURRENCIES) as Array<[CurrencyCode, typeof CURRENCIES[CurrencyCode]]>
    const sorted = currencies.sort((a, b) => {
      if (a[0] === currency) return -1
      if (b[0] === currency) return 1
      return a[1].name.localeCompare(b[1].name)
    })
    return sorted.map(([code, info]) => ({ code, info }))
  }

  return (
    <div className="language-currency-switcher" ref={dropdownRef}>
      <button
        type="button"
        className="switcher-trigger"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        aria-label={`${t('common.language')}, ${t('common.currency')}`}
      >
        <span className="trigger-text">
          {getLanguageName(currentLang)}, {currencyInfo.code}
        </span>
        <svg
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="switcher-dropdown" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dropdown-section">
            <label className="section-label">{t('common.language')}</label>
            <div className="nested-dropdown-wrapper" ref={langDropdownRef}>
              <button
                type="button"
                className="nested-dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  setLangDropdownOpen(!langDropdownOpen)
                  setCurrencyDropdownOpen(false)
                }}
              >
                <span>{getLanguageName(currentLang)}</span>
                <svg
                  className={`chevron-icon ${langDropdownOpen ? 'open' : ''}`}
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {langDropdownOpen && (
                <div className="nested-dropdown-menu">
                  <button
                    type="button"
                    className={`nested-option-item ${currentLang === 'en' ? 'selected' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    {t('common.english')}
                  </button>
                  <button
                    type="button"
                    className={`nested-option-item ${currentLang === 'hi' ? 'selected' : ''}`}
                    onClick={() => handleLanguageChange('hi')}
                  >
                    {t('common.hindi')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="dropdown-section">
            <label className="section-label">{t('common.currency')}</label>
            <div className="nested-dropdown-wrapper" ref={currencyDropdownRef}>
              <button
                type="button"
                className="nested-dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrencyDropdownOpen(!currencyDropdownOpen)
                  setLangDropdownOpen(false)
                }}
              >
                <span>{currencyInfo.code}</span>
                <svg
                  className={`chevron-icon ${currencyDropdownOpen ? 'open' : ''}`}
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {currencyDropdownOpen && (
                <div className="nested-dropdown-menu currency-menu">
                  {getCurrencyList().map(({ code }) => (
                    <button
                      key={code}
                      type="button"
                      className={`nested-option-item ${code === currency ? 'selected' : ''}`}
                      onClick={() => handleCurrencyChange(code)}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageCurrencySwitcher

