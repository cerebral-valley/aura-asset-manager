import { useState, useEffect } from 'react'
import ValueDisplayCard from '../components/dashboard/ValueDisplayCard.jsx'
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart.jsx'
import InsurancePolicyBreakdown from '../components/dashboard/InsurancePolicyBreakdown.jsx'
import { dashboardService } from '../services/dashboard.js'
import { Wallet, Shield, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  console.log('Dashboard: Component rendering, loading:', loading, 'error:', error)

  useEffect(() => {
    console.log('Dashboard: useEffect triggered - fetching data')
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Calling dashboardService.getSummary()')
        const data = await dashboardService.getSummary()
        console.log('Dashboard: Data received:', data)
        setDashboardData(data)
      } catch (err) {
        console.error('Dashboard: Error occurred:', err)
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Dashboard: Response error - status:', err.response.status, 'data:', err.response.data)
          setError(`Failed to load dashboard data: ${err.response.status} - ${err.response.data?.detail || err.message}`)
          console.error('Response data:', err.response.data)
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Dashboard: Network error - no response received:', err.request)
          setError(`No response from API server. The backend may not be running or accessible.`)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Dashboard: Request setup error:', err.message)
          setError(`Error preparing request: ${err.message}`)
        }
      } finally {
        console.log('Dashboard: Finished loading, setting loading to false')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getThemeLabels = (theme) => {
    switch (theme) {
      case 'empire_builder':
        return {
          netWorth: 'Empire Value',
          insurance: 'Shield Wall Protection',
          subtitle: 'Your empire grows stronger'
        }
      case 'growth_chaser':
        return {
          netWorth: 'Journey Value',
          insurance: 'Adventure Protection',
          subtitle: 'Your expedition progresses'
        }
      default: // sanctuary_builder
        return {
          netWorth: 'Sanctuary Value',
          insurance: 'Guardian Shield',
          subtitle: 'Your foundation strengthens'
        }
    }
  }

  if (loading) {
    console.log('Dashboard: Rendering loading state')
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your sanctuary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Dashboard: Rendering error state:', error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  console.log('Dashboard: Rendering main dashboard with data:', !!dashboardData)
  const themeLabels = getThemeLabels(dashboardData?.user_theme)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Your {dashboardData?.user_theme === 'empire_builder' ? 'Empire' : 'Sanctuary'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {themeLabels.subtitle}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ValueDisplayCard
          title={themeLabels.netWorth}
          value={dashboardData?.net_worth || 0}
          subtitle="Total asset value"
          icon={Wallet}
          className="md:col-span-1"
        />
        <ValueDisplayCard
          title={themeLabels.insurance}
          value={dashboardData?.total_insurance_coverage || 0}
          subtitle="Total coverage protection"
          icon={Shield}
          className="md:col-span-1"
        />
        <ValueDisplayCard
          title="Growth Potential"
          value={`${((dashboardData?.net_worth || 0) / 1000000 * 100).toFixed(1)}%`}
          subtitle="Progress toward financial freedom"
          icon={TrendingUp}
          className="md:col-span-1 lg:col-span-1"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AssetAllocationChart 
          data={dashboardData?.asset_allocation || []}
          title="Your Portfolio Composition"
        />
        <InsurancePolicyBreakdown 
          title="Insurance Policy Breakdown"
        />
      </div>
    </div>
  )
}

export default Dashboard

