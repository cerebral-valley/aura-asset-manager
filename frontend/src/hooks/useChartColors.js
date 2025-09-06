import { useTheme } from '../contexts/ThemeContext'
import { useMemo } from 'react'

// Define color palettes for each theme with proper HSL values that work with Recharts
const THEME_COLOR_PALETTES = {
  default: {
    light: [
      'hsl(41, 87%, 50%)',  // chart-1 equivalent
      'hsl(185, 55%, 36%)', // chart-2 equivalent  
      'hsl(227, 15%, 25%)', // chart-3 equivalent
      'hsl(84, 69%, 74%)',  // chart-4 equivalent
      'hsl(70, 71%, 66%)'   // chart-5 equivalent
    ],
    dark: [
      'hsl(264, 89%, 48%)', // chart-1 equivalent
      'hsl(162, 63%, 60%)', // chart-2 equivalent
      'hsl(70, 71%, 66%)',  // chart-3 equivalent
      'hsl(304, 96%, 56%)', // chart-4 equivalent
      'hsl(16, 89%, 55%)'   // chart-5 equivalent
    ]
  },
  red: {
    light: [
      'hsl(25, 89%, 50%)',  // Red primary
      'hsl(185, 55%, 36%)', // Blue secondary
      'hsl(227, 15%, 25%)', // Dark blue tertiary
      'hsl(84, 69%, 74%)',  // Green accent
      'hsl(70, 71%, 66%)'   // Yellow accent
    ],
    dark: [
      'hsl(22, 73%, 58%)',  // Red primary (dark)
      'hsl(162, 63%, 60%)', // Green secondary
      'hsl(70, 71%, 66%)',  // Yellow tertiary
      'hsl(304, 96%, 56%)', // Violet accent
      'hsl(16, 89%, 55%)'   // Orange accent
    ]
  },
  rose: {
    light: [
      'hsl(354, 70%, 54%)', // Rose primary
      'hsl(354, 45%, 65%)', // Light rose
      'hsl(354, 84%, 44%)', // Dark rose
      'hsl(354, 58%, 75%)', // Very light rose
      'hsl(354, 100%, 35%)' // Very dark rose
    ],
    dark: [
      'hsl(358, 65%, 64%)', // Rose primary (dark)
      'hsl(358, 52%, 75%)', // Light rose (dark)
      'hsl(358, 84%, 49%)', // Medium rose (dark)
      'hsl(358, 42%, 85%)', // Very light rose (dark)
      'hsl(358, 94%, 42%)'  // Dark rose (dark)
    ]
  },
  orange: {
    light: [
      'hsl(71, 70%, 58%)',  // Orange primary
      'hsl(71, 62%, 67%)',  // Light orange
      'hsl(71, 78%, 49%)',  // Dark orange
      'hsl(71, 56%, 76%)',  // Very light orange
      'hsl(71, 86%, 40%)'   // Very dark orange
    ],
    dark: [
      'hsl(70, 71%, 66%)',  // Orange primary (dark)
      'hsl(70, 63%, 75%)',  // Light orange (dark)
      'hsl(70, 79%, 57%)',  // Medium orange (dark)
      'hsl(70, 55%, 84%)',  // Very light orange (dark)
      'hsl(70, 87%, 48%)'   // Dark orange (dark)
    ]
  },
  green: {
    light: [
      'hsl(150, 80%, 65%)', // Green primary
      'hsl(150, 70%, 55%)', // Medium green
      'hsl(150, 90%, 75%)', // Light green
      'hsl(150, 60%, 45%)', // Dark green
      'hsl(150, 95%, 85%)'  // Very light green
    ],
    dark: [
      'hsl(162, 63%, 60%)', // Green primary (dark)
      'hsl(162, 70%, 50%)', // Medium green (dark)
      'hsl(162, 55%, 70%)', // Light green (dark)
      'hsl(162, 80%, 40%)', // Dark green (dark)
      'hsl(162, 50%, 80%)'  // Very light green (dark)
    ]
  },
  blue: {
    light: [
      'hsl(265, 89%, 49%)', // Blue primary
      'hsl(265, 79%, 59%)', // Light blue
      'hsl(265, 99%, 39%)', // Dark blue
      'hsl(265, 69%, 69%)', // Very light blue
      'hsl(265, 94%, 29%)'  // Very dark blue
    ],
    dark: [
      'hsl(264, 89%, 48%)', // Blue primary (dark)
      'hsl(264, 79%, 58%)', // Light blue (dark)
      'hsl(264, 99%, 38%)', // Dark blue (dark)
      'hsl(264, 69%, 68%)', // Very light blue (dark)
      'hsl(264, 94%, 28%)'  // Very dark blue (dark)
    ]
  },
  yellow: {
    light: [
      'hsl(86, 78%, 74%)',  // Yellow primary
      'hsl(86, 68%, 64%)',  // Medium yellow
      'hsl(86, 88%, 84%)',  // Light yellow
      'hsl(86, 58%, 54%)',  // Dark yellow
      'hsl(86, 98%, 44%)'   // Very dark yellow
    ],
    dark: [
      'hsl(84, 69%, 74%)',  // Yellow primary (dark)
      'hsl(84, 79%, 64%)',  // Medium yellow (dark)
      'hsl(84, 59%, 84%)',  // Light yellow (dark)
      'hsl(84, 89%, 54%)',  // Dark yellow (dark)
      'hsl(84, 49%, 44%)'   // Very dark yellow (dark)
    ]
  },
  violet: {
    light: [
      'hsl(308, 89%, 51%)', // Violet primary
      'hsl(308, 79%, 61%)', // Light violet
      'hsl(308, 99%, 41%)', // Dark violet
      'hsl(308, 69%, 71%)', // Very light violet
      'hsl(308, 94%, 31%)'  // Very dark violet
    ],
    dark: [
      'hsl(304, 96%, 56%)', // Violet primary (dark)
      'hsl(304, 86%, 66%)', // Light violet (dark)
      'hsl(304, 99%, 46%)', // Medium violet (dark)
      'hsl(304, 76%, 76%)', // Very light violet (dark)
      'hsl(304, 99%, 36%)'  // Dark violet (dark)
    ]
  }
}

export function useChartColors() {
  const { theme, isDark } = useTheme()

  const colors = useMemo(() => {
    const palette = THEME_COLOR_PALETTES[theme] || THEME_COLOR_PALETTES.default
    return isDark ? palette.dark : palette.light
  }, [theme, isDark])

  return {
    colors,
    getColor: (index) => colors[index % colors.length],
    primary: colors[0],
    secondary: colors[1], 
    tertiary: colors[2],
    accent1: colors[3],
    accent2: colors[4]
  }
}
