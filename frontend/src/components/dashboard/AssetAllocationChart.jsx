import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { formatCurrency } from '../ui/global-preferences.jsx'

// Same color scheme as Assets page for consistency
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#888888']

const AssetAllocationChart = ({ data, title = "Asset Allocation" }) => {
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
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default AssetAllocationChart

