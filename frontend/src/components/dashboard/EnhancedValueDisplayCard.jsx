import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import Sparkles from '../magicui/Sparkles.jsx'
import DashboardCard from './DashboardCard.jsx'
import { motion } from 'framer-motion'

const EnhancedValueDisplayCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon: Icon,
  className = '',
  tooltip = null,
  animate = true, // Enable/disable animations
  sparkle = false, // Add sparkle effect to important values
  magicHover = true, // Enable magic card hover effect
  iconThemed = false, // Apply theme color to icon
}) => {
  const { formatCurrency } = useCurrency()
  
  // Extract numeric value for animation
  const numericValue = typeof value === 'number' ? value : 0
  const isNumeric = typeof value === 'number'
  const isStringValue = typeof value === 'string'

  const CardWrapper = magicHover ? DashboardCard : Card

  return (
    <CardWrapper className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {title}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardTitle>
        {Icon && (
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          >
            <Icon className={`h-4 w-4 ${iconThemed ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>
        )}
      </CardHeader>
      <CardContent>
        {sparkle ? (
          <Sparkles>
            <div className="text-2xl font-bold text-foreground financial-number">
              {animate && isNumeric ? (
                <span>
                  {formatCurrency(0).replace(/[\d.,]+/, '')}
                  <NumberTicker
                    value={numericValue}
                    decimalPlaces={2}
                    className="font-bold financial-number"
                  />
                </span>
              ) : isStringValue ? (
                value
              ) : (
                formatCurrency(value)
              )}
            </div>
          </Sparkles>
        ) : (
          <div className="text-2xl font-bold text-foreground financial-number">
            {animate && isNumeric ? (
              <span>
                {formatCurrency(0).replace(/[\d.,]+/, '')}
                <NumberTicker
                  value={numericValue}
                  decimalPlaces={2}
                  className="font-bold financial-number"
                />
              </span>
            ) : isStringValue ? (
              value
            ) : (
              formatCurrency(value)
            )}
          </div>
        )}
        
        {subtitle && (
          <motion.p
            className="text-xs text-muted-foreground mt-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {trend && trendValue && (
          <motion.div
            className="flex items-center mt-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {trend === 'up' ? (
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              </motion.div>
            )}
            <span className={`text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendValue}
            </span>
          </motion.div>
        )}
      </CardContent>
    </CardWrapper>
  )
}

export default EnhancedValueDisplayCard
