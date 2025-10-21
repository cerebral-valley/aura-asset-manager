import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import { useChartColors } from '../../hooks/useChartColors'
import DashboardCard from './DashboardCard.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import { motion } from 'framer-motion'

const EnhancedAssetAllocationChart = ({ data, title = "Asset Allocation" }) => {
  const { formatCurrency } = useCurrency()
  const { getColor } = useChartColors()
  
  const formatTooltip = (value, name) => {
    return [formatCurrency(value), name]
  }

  const renderCustomLabel = ({ value, percent }) => {
    if (percent < 0.05) return null // Don't show label for slices less than 5%
    return `${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
  }

  // Calculate total value
  const totalValue = data?.reduce((sum, item) => {
    const value = parseFloat(item.value) || 0
    return sum + value
  }, 0) || 0

  if (!data || data.length === 0) {
    return (
      <DashboardCard 
        gradientColor="#8b5cf6"
      >
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No asset data available
          </div>
        </CardContent>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard 
      gradientColor="#8b5cf6"
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
      <CardContent className="pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={getColor(0)}
                label={renderCustomLabel}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
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
              <span className="text-muted-foreground">Total Assets:</span>
              <span className="ml-2 font-semibold text-foreground">
                <NumberTicker value={data.length} decimalPlaces={0} />
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-muted-foreground">Total Value:</span>
              <span className="ml-2 font-semibold text-foreground font-mono">
                {formatCurrency(0).replace(/[\d.,]+/, '')}
                <NumberTicker value={totalValue} decimalPlaces={2} />
              </span>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </DashboardCard>
  )
}

export default EnhancedAssetAllocationChart
