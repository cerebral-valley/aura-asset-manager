import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import { useChartColors } from '../../hooks/useChartColors'
import apiClient from '@/lib/api'

const InsurancePolicyBreakdown = ({ title = "Insurance Policy Breakdown" }) => {
  const { formatCurrency } = useCurrency()
  const { getColor } = useChartColors()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch insurance policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await apiClient.get('/insurance/')
        setPolicies(response.data || [])
      } catch (error) {
        console.error('Failed to fetch insurance policies:', error)
        setPolicies([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  // Create pie chart data from policies
  const pieData = React.useMemo(() => {
    if (!policies.length) return []

    const typeCounts = policies.reduce((acc, policy) => {
      const type = policy.policy_type || 'Other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }))
  }, [policies])

  const formatTooltip = (value, name) => {
    return [`${value} policies`, name]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading insurance data...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!policies.length || !pieData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No insurance policies found
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
        <ResponsiveContainer width="100%" height={350}>
          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill={getColor(0)}
              dataKey="value"
              label={({ name, value, percent }) => 
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {pieData.map((entry, index) => (
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
        
        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Policies:</span>
              <span className="ml-2 font-semibold">{policies.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Coverage:</span>
              <span className="ml-2 font-semibold">
                {(() => {
                  const totalCoverage = policies.reduce((sum, p) => {
                    const coverage = parseFloat(p.coverage_amount) || 0
                    return sum + coverage
                  }, 0)
                  
                  return totalCoverage > 0 ? formatCurrency(totalCoverage) : formatCurrency(0)
                })()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InsurancePolicyBreakdown
