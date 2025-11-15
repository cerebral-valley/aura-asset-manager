import { CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import DashboardCard from './DashboardCard.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import { motion } from 'framer-motion'
import { User, DollarSign, Activity } from 'lucide-react'

const ProfileSnapshotCard = ({ profile }) => {
  const { formatCurrency } = useCurrency()

  const getRiskAppetiteColor = (appetite) => {
    switch (appetite?.toLowerCase()) {
      case 'conservative':
        return 'text-blue-500'
      case 'moderate':
        return 'text-yellow-500'
      case 'aggressive':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getRiskAppetiteIcon = (appetite) => {
    switch (appetite?.toLowerCase()) {
      case 'conservative':
        return '🛡️'
      case 'moderate':
        return '⚖️'
      case 'aggressive':
        return '🚀'
      default:
        return '📊'
    }
  }

  if (!profile) {
    return (
      <DashboardCard 
        gradientColor="#f59e0b"
      >
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Your Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No profile data available
          </div>
        </CardContent>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard 
      gradientColor="#f59e0b"
    >
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>Your Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annual Income */}
        {profile.annual_income !== null && profile.annual_income !== undefined && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Annual Income</p>
            </div>
            <p className="text-xl font-bold text-foreground font-mono financial-number">
              {formatCurrency(0).replace(/[\d.,]+/, '')}
              <NumberTicker value={profile.annual_income} decimalPlaces={0} className="financial-number" />
            </p>
          </motion.div>
        )}

        {/* Risk Appetite */}
        {profile.risk_appetite && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="space-y-1 pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Risk Appetite</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getRiskAppetiteIcon(profile.risk_appetite)}</span>
              <p className={`text-lg font-semibold capitalize ${getRiskAppetiteColor(profile.risk_appetite)}`}>
                {profile.risk_appetite}
              </p>
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        {(profile.country || profile.occupation) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-3 border-t border-white/10 space-y-2"
          >
            {profile.country && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Country</span>
                <span className="text-sm font-medium text-foreground">{profile.country}</span>
              </div>
            )}
            {profile.occupation && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Occupation</span>
                <span className="text-sm font-medium text-foreground">
                  {profile.occupation.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!profile.annual_income && !profile.risk_appetite && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Complete your profile to see insights
          </div>
        )}
      </CardContent>
    </DashboardCard>
  )
}

export default ProfileSnapshotCard
