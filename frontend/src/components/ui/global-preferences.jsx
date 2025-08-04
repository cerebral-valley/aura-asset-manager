import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe, Calendar } from 'lucide-react'

// Currency configurations with symbols and formatting
export const CURRENCIES = {
  USD: { symbol: '$', label: 'US Dollar', format: 'en-US' },
  GBP: { symbol: '£', label: 'British Pound', format: 'en-GB' },
  EUR: { symbol: '€', label: 'Euro', format: 'de-DE' },
  JPY: { symbol: '¥', label: 'Japanese Yen', format: 'ja-JP' },
  CNY: { symbol: '¥', label: 'Chinese Renminbi', format: 'zh-CN' },
  RUB: { symbol: '₽', label: 'Russian Ruble', format: 'ru-RU' },
  INR: { symbol: '₹', label: 'Indian Rupee', format: 'en-IN' }
}

// Date format configurations
export const DATE_FORMATS = {
  'DD-MM-YYYY': { label: 'DD-MM-YYYY', example: '04-08-2025' },
  'MM-DD-YYYY': { label: 'MM-DD-YYYY', example: '08-04-2025' }
}

const GlobalPreferences = ({ className = "" }) => {
  const [currency, setCurrency] = useState('USD')
  const [dateFormat, setDateFormat] = useState('DD-MM-YYYY')

  // Load preferences from localStorage on mount
  useEffect(() => {
    // Load saved preferences
    const savedCurrency = localStorage.getItem('globalCurrency') || 'USD'
    const savedDateFormat = localStorage.getItem('globalDateFormat') || 'MM/DD/YYYY'
    
    setCurrency(savedCurrency)
    setDateFormat(savedDateFormat)

    // Listen for changes from UserSettings page
    const handlePreferencesChanged = (event) => {
      if (event.detail) {
        setCurrency(event.detail.currency || savedCurrency)
        setDateFormat(event.detail.dateFormat || savedDateFormat)
      }
    }

    window.addEventListener('globalPreferencesChanged', handlePreferencesChanged)
    
    return () => {
      window.removeEventListener('globalPreferencesChanged', handlePreferencesChanged)
    }
  }, [])

  // Save currency preference
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    localStorage.setItem('user_currency', newCurrency)
    // Trigger a custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }))
  }

  // Save date format preference
  const handleDateFormatChange = (newFormat) => {
    setDateFormat(newFormat)
    localStorage.setItem('user_date_format', newFormat)
    // Trigger a custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('dateFormatChanged', { detail: newFormat }))
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Currency Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENCIES).map(([code, config]) => (
              <SelectItem key={code} value={code}>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{config.symbol}</span>
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Format Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={dateFormat} onValueChange={handleDateFormatChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_FORMATS).map(([format, config]) => (
              <SelectItem key={format} value={format}>
                <div className="flex flex-col">
                  <span>{config.label}</span>
                  <span className="text-xs text-muted-foreground">e.g. {config.example}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default GlobalPreferences

// Utility functions for formatting
export const formatCurrency = (amount, currencyCode = null) => {
  const currency = currencyCode || localStorage.getItem('globalCurrency') || 'USD'
  const config = CURRENCIES[currency]
  
  if (!config) return `$${amount?.toLocaleString() || 0}`
  
  return new Intl.NumberFormat(config.format, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export const formatDate = (date, formatCode = null) => {
  const format = formatCode || localStorage.getItem('globalDateFormat') || 'MM/DD/YYYY'
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()
  
  switch (format) {
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`
    case 'DD-MM-YYYY':
    default:
      return `${day}-${month}-${year}`
  }
}
