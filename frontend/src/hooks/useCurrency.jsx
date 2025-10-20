import { useState, useEffect, useCallback, useMemo } from 'react'
import { userSettingsService } from '../services/user-settings.js'

// Currency configurations
export const CURRENCIES = {
  USD: { symbol: '$', label: 'US Dollar', format: 'en-US' },
  GBP: { symbol: '£', label: 'British Pound', format: 'en-GB' },
  EUR: { symbol: '€', label: 'Euro', format: 'de-DE' },
  JPY: { symbol: '¥', label: 'Japanese Yen', format: 'ja-JP' },
  CNY: { symbol: '¥', label: 'Chinese Yuan', format: 'zh-CN' },
  RUB: { symbol: '₽', label: 'Russian Ruble', format: 'ru-RU' },
  INR: { symbol: '₹', label: 'Indian Rupee', format: 'en-IN' }
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCurrencySettings = async () => {
      try {
        // Try to get from user settings first
        const settings = await userSettingsService.getSettings()
        if (settings && settings.currency) {
          setCurrency(settings.currency)
          localStorage.setItem('globalCurrency', settings.currency)
        } else {
          // Fallback to localStorage
          const savedCurrency = localStorage.getItem('globalCurrency') || 'USD'
          setCurrency(savedCurrency)
        }
      } catch (error) {
        console.warn('Could not load currency settings, using default:', error)
        // Fallback to localStorage
        const savedCurrency = localStorage.getItem('globalCurrency') || 'USD'
        setCurrency(savedCurrency)
      } finally {
        setLoading(false)
      }
    }

    loadCurrencySettings()

    // Listen for changes from UserSettings page
    const handlePreferencesChanged = (event) => {
      if (event.detail && event.detail.currency) {
        setCurrency(event.detail.currency)
        localStorage.setItem('globalCurrency', event.detail.currency)
      }
    }

    window.addEventListener('globalPreferencesChanged', handlePreferencesChanged)
    
    return () => {
      window.removeEventListener('globalPreferencesChanged', handlePreferencesChanged)
    }
  }, [])

  const formatCurrency = useCallback((amount, currencyCode = null) => {
    const activeCurrency = currencyCode || currency
    const config = CURRENCIES[activeCurrency]
    
    if (!config || amount === null || amount === undefined || isNaN(amount)) {
      return `${CURRENCIES[activeCurrency]?.symbol || '$'}${amount?.toLocaleString() || 0}`
    }
    
    return new Intl.NumberFormat(config.format, {
      style: 'currency',
      currency: activeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [currency])

  const getCurrencySymbol = useCallback((currencyCode = null) => {
    const activeCurrency = currencyCode || currency
    return CURRENCIES[activeCurrency]?.symbol || '$'
  }, [currency])

  const currencyConfig = useMemo(() => CURRENCIES[currency], [currency])

  return {
    currency,
    formatCurrency,
    getCurrencySymbol,
    loading,
    currencyConfig
  }
}

export default useCurrency
