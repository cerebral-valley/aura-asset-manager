import { createContext, useContext, useEffect, useState } from 'react'
import { userSettingsService } from '../services/user-settings.js'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(true)

  // Function to apply theme to document
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First check localStorage for immediate application
        const localDarkMode = localStorage.getItem('globalDarkMode')
        if (localDarkMode !== null) {
          applyTheme(localDarkMode === 'true')
        }

        // Then fetch from database to ensure consistency
        const settings = await userSettingsService.getSettings()
        if (settings && typeof settings.dark_mode === 'boolean') {
          applyTheme(settings.dark_mode)
          // Update localStorage to match database
          localStorage.setItem('globalDarkMode', settings.dark_mode.toString())
        }
      } catch (error) {
        console.warn('Could not load theme preference:', error)
        // Fall back to system preference or light theme
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(systemPrefersDark)
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Listen for theme changes from UserSettings
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail && typeof event.detail.darkMode === 'boolean') {
        applyTheme(event.detail.darkMode)
      }
    }

    window.addEventListener('globalPreferencesChanged', handleThemeChange)
    return () => window.removeEventListener('globalPreferencesChanged', handleThemeChange)
  }, [])

  // Function to toggle theme manually
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    const isDark = newTheme === 'dark'
    applyTheme(isDark)
    localStorage.setItem('globalDarkMode', isDark.toString())
  }

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: (newTheme) => applyTheme(newTheme === 'dark'),
    loading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
