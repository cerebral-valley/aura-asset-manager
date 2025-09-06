import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import apiClient from '@/lib/api'

// Function to get theme-aware colors
const getThemeColors = () => {
  const colors = [];
  for (let i = 1; i <= 5; i++) {
    const color = getComputedStyle(document.documentElement).getPropertyValue(`--chart-${i}`).trim();
    if (color) {
      colors.push(`hsl(${color})`);
    }
  }
  return colors.length > 0 ? colors : ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#888888']; // fallback
};

const InsurancePolicyBreakdown = ({ title = "Insurance Policy Breakdown" }) => {
  const { formatCurrency } = useCurrency()
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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="hsl(var(--chart-1))"
              dataKey="value"
              label={({ name, value, percent }) => 
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {pieData.map((entry, index) => {
                const colors = getThemeColors();
                return (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                );
              })}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
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
