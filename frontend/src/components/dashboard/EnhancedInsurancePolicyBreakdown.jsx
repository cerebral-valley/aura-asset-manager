import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import { useChartColors } from '../../hooks/useChartColors'
import DashboardCard from './DashboardCard.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import Orbit from '../magicui/Orbit.jsx'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { insuranceService } from '../../services/insurance.js'
import { queryKeys } from '../../lib/queryKeys.js'
import { useAuth } from '../../hooks/useAuth'

const EnhancedInsurancePolicyBreakdown = ({ title = "Insurance Policy Breakdown" }) => {
  const { formatCurrency } = useCurrency()
  const { getColor } = useChartColors()
  const { user } = useAuth()

  // Fetch insurance policies using TanStack Query
  const { data: policies = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.insurance.list(),
    queryFn: ({ signal }) => insuranceService.getPolicies({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Create pie chart data from policies with coverage amounts
  const pieData = React.useMemo(() => {
    if (!policies.length) return []

    const typeCoverage = policies.reduce((acc, policy) => {
      const type = policy.policy_type || 'Other'
      const coverage = parseFloat(policy.coverage_amount) || 0
      acc[type] = (acc[type] || 0) + coverage
      return acc
    }, {})

    return Object.entries(typeCoverage).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }))
  }, [policies])

  // Calculate total coverage
  const totalCoverage = policies.reduce((sum, p) => {
    const coverage = parseFloat(p.coverage_amount) || 0
    return sum + coverage
  }, 0)

  const formatTooltip = (value, name) => {
    return [formatCurrency(value), name]
  }

  if (loading) {
    return (
      <DashboardCard 
        gradientColor="#ec4899"
      >
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Orbit size={60} />
          </div>
        </CardContent>
      </DashboardCard>
    )
  }

  if (!policies.length || !pieData.length) {
    return (
      <DashboardCard 
        gradientColor="#ec4899"
      >
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No insurance policies found
          </div>
        </CardContent>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard 
      gradientColor="#ec4899"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-6 chart-slashed-zero">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={getColor(0)}
                dataKey="value"
                label={({ name, value, percent }) => {
                  if (percent <= 0.05) return ''
                  return `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(0)}%)`
                }}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(index)}
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#000000',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{
                  color: '#000000',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Enhanced Summary stats with animations */}
        <motion.div 
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-muted-foreground">Total Policies:</span>
              <span className="ml-2 font-semibold text-foreground financial-number">
                <NumberTicker value={policies.length} decimalPlaces={0} className="financial-number" />
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-muted-foreground">Total Coverage:</span>
              <span className="ml-2 font-semibold text-foreground font-mono financial-number">
                {formatCurrency(0).replace(/[\d.,]+/, '')}
                <NumberTicker value={totalCoverage} decimalPlaces={2} className="financial-number" />
              </span>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </DashboardCard>
  )
}

export default EnhancedInsurancePolicyBreakdown
