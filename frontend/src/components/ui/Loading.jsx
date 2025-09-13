import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

function Loading({ label = null, variant = 'center', size = 'md', className = '' }) {
  const { isDark, darkMode } = useTheme() || {}

  const spinnerSizeClass = variant === 'center' ? 'h-8 w-8' : (variant === 'inline' ? 'h-4 w-4' : 'h-4 w-4')

  // Use existing border-primary class; theme adjustments can be applied via CSS vars
  const spinnerClass = `animate-spin rounded-full ${spinnerSizeClass} border-b-2 border-primary`;

  if (variant === 'inline' || variant === 'button') {
    return (
      <span className={`inline-flex items-center ${className}`} role="status" aria-live="polite">
        <span className={spinnerClass} aria-hidden="true"></span>
        <span className="sr-only">{label || 'Loading'}</span>
      </span>
    )
  }

  // center variant: full-page centered spinner
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`} role={"status"} aria-live={"polite"}>
      <div className="text-center">
        <div className={spinnerClass + " mx-auto"} aria-hidden="true"></div>
        {label ? <p className="mt-2 text-muted-foreground">{label}</p> : <span className="sr-only">Loading</span>}
      </div>
    </div>
  )
}

export default Loading
