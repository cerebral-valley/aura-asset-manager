import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Label } from './label'
import { Check } from 'lucide-react'

const ThemePreview = ({ theme, isSelected, onSelect }) => {
  const themeColors = {
    default: { primary: '#1a1a1a', accent: '#f5f5f5' },
    red: { primary: '#dc2626', accent: '#fee2e2' },
    rose: { primary: '#e11d48', accent: '#fdf2f8' },
    orange: { primary: '#ea580c', accent: '#ffedd5' },
    green: { primary: '#16a34a', accent: '#dcfce7' },
    blue: { primary: '#2563eb', accent: '#dbeafe' },
    yellow: { primary: '#ca8a04', accent: '#fefce8' },
    violet: { primary: '#7c3aed', accent: '#ede9fe' }
  }

  const colors = themeColors[theme] || themeColors.default

  return (
    <div 
      className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all hover:shadow-md ${
        isSelected ? 'border-primary shadow-md' : 'border-border'
      }`}
      onClick={() => onSelect(theme)}
    >
      {/* Color preview circles */}
      <div className="flex items-center gap-1 mb-2">
        <div 
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: colors.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: colors.accent }}
        />
        {isSelected && (
          <Check className="w-3 h-3 text-primary ml-auto" />
        )}
      </div>

      {/* Theme name */}
      <p className="text-xs font-medium capitalize text-center">{theme}</p>
    </div>
  )
}

export function ThemeSelector() {
  const { theme, changeTheme, availableThemes } = useTheme()

  return (
    <div className="space-y-3">
      <Label className="text-base">Color Theme</Label>
      <div className="grid grid-cols-4 gap-2">
        {Object.keys(availableThemes).map((themeKey) => (
          <ThemePreview
            key={themeKey}
            theme={themeKey}
            isSelected={theme === themeKey}
            onSelect={changeTheme}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Current: <span className="font-medium capitalize">{availableThemes[theme]}</span>
      </p>
    </div>
  )
}
