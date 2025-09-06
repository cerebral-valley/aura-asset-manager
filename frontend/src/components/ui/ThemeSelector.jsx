import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Check, Palette } from 'lucide-react'

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
      className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
        isSelected ? 'border-primary shadow-md' : 'border-border'
      }`}
      onClick={() => onSelect(theme)}
    >
      {/* Color preview circles */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: colors.primary }}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: colors.accent }}
        />
        {isSelected && (
          <Check className="w-4 h-4 text-primary ml-auto" />
        )}
      </div>

      {/* Theme name */}
      <p className="text-sm font-medium capitalize">{theme}</p>
      
      {/* Mini preview component */}
      <div className="mt-2 p-2 rounded border bg-card">
        <div 
          className="h-1 rounded mb-1"
          style={{ backgroundColor: colors.primary }}
        />
        <div 
          className="h-1 rounded w-2/3"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
    </div>
  )
}

export function ThemeSelector({ className = '' }) {
  const { theme, changeTheme, availableThemes } = useTheme()

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Theme
        </CardTitle>
        <CardDescription>
          Choose your preferred color scheme. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(availableThemes).map((themeKey) => (
            <ThemePreview
              key={themeKey}
              theme={themeKey}
              isSelected={theme === themeKey}
              onSelect={changeTheme}
            />
          ))}
        </div>

        {/* Current selection badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current:</span>
          <Badge variant="secondary" className="capitalize">
            {availableThemes[theme]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
