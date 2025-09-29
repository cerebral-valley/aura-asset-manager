import React, { createContext, useContext, useEffect, useState } from 'react'
import { userSettingsService } from '../services/user-settings.js'

// Available themes from shadcn/ui
export const THEMES = {
  default: 'Default',
  red: 'Red',
  rose: 'Rose',
  orange: 'Orange',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow',
  violet: 'Violet'
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'default'
    return localStorage.getItem('theme') || 'default'
  })
  
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode from localStorage or default to false
    const localDarkMode = localStorage.getItem('globalDarkMode')
    return localDarkMode === 'true'
  })
  
  const [loading, setLoading] = useState(true)

  // Function to apply dark mode to document
  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    setDarkMode(isDark)
  }

  // Function to apply theme colors
  const applyThemeColors = (newTheme) => {
    // Remove all theme classes from document body
    document.body.classList.remove(...Object.keys(THEMES).map(t => `theme-${t}`))
    
    // Add the new theme class (except for default which uses root colors)
    if (newTheme !== 'default') {
      document.body.classList.add(`theme-${newTheme}`)
    }
  }

  const changeTheme = async (newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      applyThemeColors(newTheme)
      
      // Save to database for persistence across sessions
      try {
        const currentSettings = await userSettingsService.getSettings()
        await userSettingsService.saveSettings({
          ...currentSettings,
          theme: newTheme
        })
      } catch (error) {
        console.warn('Could not save theme to database:', error)
        // Continue with local storage only
      }
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    applyDarkMode(newDarkMode)
    localStorage.setItem('globalDarkMode', newDarkMode.toString())
  }

  const setDarkModeValue = (isDark) => {
    applyDarkMode(isDark)
    localStorage.setItem('globalDarkMode', isDark.toString())
  }

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Apply current theme and dark mode immediately
        applyThemeColors(theme)
        applyDarkMode(darkMode)

        // Then fetch from database to ensure consistency
        const settings = await userSettingsService.getSettings()
        if (settings) {
          // Sync theme from database
          if (settings.theme && THEMES[settings.theme]) {
            setTheme(settings.theme)
            localStorage.setItem('theme', settings.theme)
            applyThemeColors(settings.theme)
          }
          
          // Sync dark mode from database
          if (typeof settings.dark_mode === 'boolean') {
            applyDarkMode(settings.dark_mode)
            localStorage.setItem('globalDarkMode', settings.dark_mode.toString())
          }
        }
      } catch (error) {
        console.warn('Could not load theme preferences:', error)
        // Fall back to current values or system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyDarkMode(darkMode || systemPrefersDark)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Listen for theme changes from UserSettings
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail && typeof event.detail.darkMode === 'boolean') {
        applyDarkMode(event.detail.darkMode)
      }
    }

    window.addEventListener('globalPreferencesChanged', handleThemeChange)
    return () => window.removeEventListener('globalPreferencesChanged', handleThemeChange)
  }, [])

  return (
    <ThemeContext.Provider value={{
      // Color theme
      theme,
      changeTheme,
      availableThemes: THEMES,
      // Dark mode
      darkMode,
      isDark: darkMode,
      toggleDarkMode,
      setDarkMode: setDarkModeValue,
      // Loading state
      loading
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
