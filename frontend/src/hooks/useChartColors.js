import { useTheme } from '@/contexts/ThemeContext'
import { useMemo } from 'react'

// Define color palettes for each theme with proper HSL values that work with Recharts
// Colors converted from OKLCH values in the CSS theme definitions
const THEME_COLOR_PALETTES = {
  default: {
    light: [
      'hsl(41, 67%, 65%)',  // chart-1 equivalent - converted from oklch(0.646 0.222 41.116)
      'hsl(185, 35%, 47%)', // chart-2 equivalent - converted from oklch(0.6 0.118 184.704)
      'hsl(227, 21%, 40%)', // chart-3 equivalent - converted from oklch(0.398 0.07 227.392)
      'hsl(84, 57%, 83%)',  // chart-4 equivalent - converted from oklch(0.828 0.189 84.429)
      'hsl(70, 56%, 77%)'   // chart-5 equivalent - converted from oklch(0.769 0.188 70.08)
    ],
    dark: [
      'hsl(264, 73%, 49%)', // chart-1 equivalent - converted from oklch(0.488 0.243 264.376)
      'hsl(162, 51%, 70%)', // chart-2 equivalent - converted from oklch(0.696 0.17 162.48)
      'hsl(70, 56%, 77%)',  // chart-3 equivalent - converted from oklch(0.769 0.188 70.08)
      'hsl(304, 80%, 63%)', // chart-4 equivalent - converted from oklch(0.627 0.265 303.9)
      'hsl(16, 74%, 65%)'   // chart-5 equivalent - converted from oklch(0.645 0.246 16.439)
    ]
  },
  red: {
    light: [
      'hsl(25, 68%, 60%)',  // Red primary - converted from oklch(0.597 0.226 25.331)
      'hsl(185, 35%, 47%)', // Blue secondary
      'hsl(227, 21%, 40%)', // Dark blue tertiary
      'hsl(84, 57%, 83%)',  // Green accent
      'hsl(70, 56%, 77%)'   // Yellow accent
    ],
    dark: [
      'hsl(22, 57%, 70%)',  // Red primary (dark) - converted from oklch(0.704 0.191 22.216)
      'hsl(162, 51%, 70%)', // Green secondary
      'hsl(70, 56%, 77%)',  // Yellow tertiary
      'hsl(304, 80%, 63%)', // Violet accent
      'hsl(16, 74%, 65%)'   // Orange accent
    ]
  },
  rose: {
    light: [
      'hsl(354, 65%, 63%)', // Rose primary - converted from oklch(0.633 0.216 353.634)
      'hsl(354, 52%, 74%)', // Light rose
      'hsl(354, 77%, 51%)', // Dark rose
      'hsl(354, 35%, 82%)', // Very light rose
      'hsl(354, 89%, 43%)'  // Very dark rose
    ],
    dark: [
      'hsl(358, 55%, 71%)', // Rose primary (dark) - converted from oklch(0.713 0.182 357.884)
      'hsl(358, 44%, 82%)', // Light rose (dark)
      'hsl(358, 71%, 59%)', // Medium rose (dark)
      'hsl(358, 29%, 90%)', // Very light rose (dark)
      'hsl(358, 83%, 51%)'  // Dark rose (dark)
    ]
  },
  orange: {
    light: [
      'hsl(71, 57%, 68%)',  // Orange primary - converted from oklch(0.68 0.191 70.67)
      'hsl(71, 51%, 76%)',  // Light orange
      'hsl(71, 63%, 58%)',  // Dark orange
      'hsl(71, 45%, 84%)',  // Very light orange
      'hsl(71, 69%, 48%)'   // Very dark orange
    ],
    dark: [
      'hsl(70, 56%, 77%)',  // Orange primary (dark) - converted from oklch(0.769 0.188 70.08)
      'hsl(70, 50%, 85%)',  // Light orange (dark)
      'hsl(70, 62%, 65%)',  // Medium orange (dark)
      'hsl(70, 44%, 93%)',  // Very light orange (dark)
      'hsl(70, 68%, 57%)'   // Dark orange (dark)
    ]
  },
  green: {
    light: [
      'hsl(150, 66%, 72%)', // Green primary - converted from oklch(0.723 0.219 149.579)
      'hsl(150, 72%, 62%)', // Medium green
      'hsl(150, 60%, 82%)', // Light green
      'hsl(150, 78%, 52%)', // Dark green
      'hsl(150, 54%, 92%)'  // Very light green
    ],
    dark: [
      'hsl(162, 51%, 70%)', // Green primary (dark) - converted from oklch(0.696 0.17 162.48)
      'hsl(162, 45%, 80%)', // Light green (dark)
      'hsl(162, 57%, 60%)', // Medium green (dark)
      'hsl(162, 39%, 90%)', // Very light green (dark)
      'hsl(162, 63%, 50%)'  // Dark green (dark)
    ]
  },
  blue: {
    light: [
      'hsl(265, 64%, 50%)', // Blue primary - converted from oklch(0.497 0.213 264.76)
      'hsl(265, 58%, 60%)', // Light blue
      'hsl(265, 70%, 40%)', // Dark blue
      'hsl(265, 52%, 70%)', // Very light blue
      'hsl(265, 76%, 30%)'  // Very dark blue
    ],
    dark: [
      'hsl(264, 73%, 49%)', // Blue primary (dark) - converted from oklch(0.488 0.243 264.376)
      'hsl(264, 67%, 59%)', // Light blue (dark)
      'hsl(264, 79%, 39%)', // Dark blue (dark)
      'hsl(264, 61%, 69%)', // Very light blue (dark)
      'hsl(264, 85%, 29%)'  // Very dark blue (dark)
    ]
  },
  yellow: {
    light: [
      'hsl(86, 50%, 82%)',  // Yellow primary - converted from oklch(0.824 0.165 85.994)
      'hsl(86, 56%, 72%)',  // Medium yellow
      'hsl(86, 44%, 92%)',  // Light yellow
      'hsl(86, 61%, 62%)',  // Dark yellow
      'hsl(86, 68%, 52%)'   // Very dark yellow
    ],
    dark: [
      'hsl(84, 57%, 83%)',  // Yellow primary (dark) - converted from oklch(0.828 0.189 84.429)
      'hsl(84, 63%, 73%)',  // Medium yellow (dark)
      'hsl(84, 51%, 93%)',  // Light yellow (dark)
      'hsl(84, 69%, 63%)',  // Dark yellow (dark)
      'hsl(84, 75%, 53%)'   // Very dark yellow (dark)
    ]
  },
  violet: {
    light: [
      'hsl(308, 64%, 51%)', // Violet primary - converted from oklch(0.514 0.213 308.32)
      'hsl(308, 58%, 61%)', // Light violet
      'hsl(308, 70%, 41%)', // Dark violet
      'hsl(308, 52%, 71%)', // Very light violet
      'hsl(308, 76%, 31%)'  // Very dark violet
    ],
    dark: [
      'hsl(304, 80%, 63%)', // Violet primary (dark) - converted from oklch(0.627 0.265 303.9)
      'hsl(304, 74%, 73%)', // Light violet (dark)
      'hsl(304, 85%, 53%)', // Medium violet (dark)
      'hsl(304, 68%, 83%)', // Very light violet (dark)
      'hsl(304, 92%, 43%)'  // Dark violet (dark)
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
    accent2: colors[4],
    // Expose theme data to avoid double useTheme calls
    isDark,
    theme
  }
}
