import { CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import MagicCard from '../magicui/MagicCard.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import Sparkles from '../magicui/Sparkles.jsx'
import { motion } from 'framer-motion'
import { Target, TrendingUp } from 'lucide-react'
import { Progress } from '../ui/progress.jsx'

const NetWorthGoalCard = ({ goal, currentNetWorth }) => {
  const { formatCurrency } = useCurrency()

  if (!goal) {
    return (
      <MagicCard 
        gradientColor="#10b981" 
        gradientSize={300}
        gradientOpacity={0.6}
        className="backdrop-blur-sm"
      >
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span>Net Worth Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No active net worth goal set
          </div>
        </CardContent>
      </MagicCard>
    )
  }

  const progress = ((currentNetWorth || 0) / (goal.target_amount || 1)) * 100
  const isComplete = progress >= 100
  const remaining = Math.max(0, (goal.target_amount || 0) - (currentNetWorth || 0))

  return (
    <MagicCard 
      gradientColor="#10b981" 
      gradientSize={300}
      gradientOpacity={0.6}
      className="backdrop-blur-sm"
    >
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <motion.div
            animate={isComplete ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Target className="h-5 w-5" />
          </motion.div>
          <span>{goal.title || 'Net Worth Goal'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <motion.span 
              className="font-semibold text-foreground"
              whileHover={{ scale: 1.05 }}
            >
              {isComplete ? (
                <Sparkles>
                  <span className="text-green-500">100% ✓</span>
                </Sparkles>
              ) : (
                `${progress.toFixed(1)}%`
              )}
            </motion.span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3" />
        </div>

        {/* Current vs Target */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="space-y-1"
          >
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-bold text-foreground font-mono">
              {formatCurrency(0).replace(/[\d.,]+/, '')}
              <NumberTicker value={currentNetWorth || 0} decimalPlaces={0} />
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="space-y-1"
          >
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-lg font-bold text-foreground font-mono">
              {formatCurrency(goal.target_amount || 0)}
            </p>
          </motion.div>
        </div>

        {/* Remaining Amount */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 pt-2 border-t border-white/10"
          >
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {formatCurrency(remaining)} to go
            </span>
          </motion.div>
        )}

        {/* Completion Celebration */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-2 border-t border-white/10"
          >
            <Sparkles>
              <p className="text-sm font-semibold text-green-500 text-center">
                🎉 Goal Achieved! 🎉
              </p>
            </Sparkles>
          </motion.div>
        )}
      </CardContent>
    </MagicCard>
  )
}

export default NetWorthGoalCard
