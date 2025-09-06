import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import { useChartColors } from '../../hooks/useChartColors'

const AssetAllocationChart = ({ data, title = "Asset Allocation" }) => {
  const { formatCurrency } = useCurrency()
  const { getColor } = useChartColors()
  
  const formatTooltip = (value, name) => {
    return [formatCurrency(value), name]
  }

  const renderCustomLabel = ({ value, percent }) => {
    if (percent < 0.05) return null // Don't show label for slices less than 5%
    return `${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No asset data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
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
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(index)} 
                />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default AssetAllocationChart

