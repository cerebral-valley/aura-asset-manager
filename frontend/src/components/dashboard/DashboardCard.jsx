import { useTheme } from '../../contexts/ThemeContext.jsx'
import MagicCard from '../magicui/MagicCard.jsx'
import { cn } from '../../lib/utils'

/**
 * Theme-aware card wrapper for dashboard components
 * Provides optimal styling for both light and dark modes
 * 
 * Light mode: Clean white cards with subtle gradients and borders
 * Dark mode: Vibrant backdrop-blur effect with strong gradients
 */
const DashboardCard = ({ 
  gradientColor, 
  gradientSize = 300,
  children, 
  className = '' 
}) => {
  const { isDark } = useTheme()

  return (
    <MagicCard
      gradientColor={gradientColor}
      gradientSize={gradientSize}
      gradientOpacity={isDark ? 0.6 : 0.08}
      className={cn(
        isDark 
          ? 'backdrop-blur-sm' 
          : 'bg-white/95 border border-gray-200 shadow-sm',
        className
      )}
    >
      {children}
    </MagicCard>
  )
}

export default DashboardCard
