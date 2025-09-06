import React, { createContext, useContext, useEffect, useState } from 'react'

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

  const changeTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      
      // Remove all theme classes from document body
      document.body.classList.remove(...Object.keys(THEMES).map(t => `theme-${t}`))
      
      // Add the new theme class (except for default which uses root colors)
      if (newTheme !== 'default') {
        document.body.classList.add(`theme-${newTheme}`)
      }
    }
  }

  useEffect(() => {
    // Apply the theme on initial load
    changeTheme(theme)
  }, [])

  return (
    <ThemeContext.Provider value={{
      theme,
      changeTheme,
      availableThemes: THEMES
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
