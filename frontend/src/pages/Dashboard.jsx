import { useState, useEffect } from 'react'
import ValueDisplayCard from '../components/dashboard/ValueDisplayCard.jsx'
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart.jsx'
import InsurancePolicyBreakdown from '../components/dashboard/InsurancePolicyBreakdown.jsx'
import { dashboardService } from '../services/dashboard.js'
import { Wallet, Shield, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import Loading from '../components/ui/Loading'
import SafeSection from '../components/util/SafeSection'
import { log, warn, error } from '@/lib/debug'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Import verification
  if (!dashboardService?.getSummary) warn('Dashboard', 'service missing: getSummary')

  log('Dashboard', 'init', { loading, error })

  useEffect(() => {
    log('Dashboard', 'fetch:start')
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getSummary()
        log('Dashboard', 'fetch:success', { dataKeys: Object.keys(data || {}) })
        setDashboardData(data)
      } catch (err) {
        error('Dashboard', 'fetch:error', err)
        if (err.response) {
          setError(`Failed to load dashboard data: ${err.response.status} - ${err.response.data?.detail || err.message}`)
        } else if (err.request) {
          setError(`No response from API server. The backend may not be running or accessible.`)
        } else {
          setError(`Error preparing request: ${err.message}`)
        }
      } finally {
        log('Dashboard', 'fetch:done')
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
    log('Dashboard', 'render:loading')
    return <Loading pageName="Dashboard" />
  }

  if (error) {
    log('Dashboard', 'render:error', error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  console.log('Dashboard: Rendering main dashboard with data:', !!dashboardData)
  log('Dashboard', 'render:ready', { hasData: !!dashboardData })

  const themeLabels = getThemeLabels(dashboardData?.user_theme || 'sanctuary_builder')

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
          tooltip="Growth Potential is calculated as a percentage of your net worth towards a $1M financial independence target. Formula: (Net Worth / $1,000,000) × 100%. This helps track your progress towards financial freedom."
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SafeSection debugId="Dashboard:AssetAllocationChart">
          <AssetAllocationChart 
            data={dashboardData?.asset_allocation || []}
            title="Your Portfolio Composition"
          />
        </SafeSection>
        <SafeSection debugId="Dashboard:InsurancePolicyBreakdown">
          <InsurancePolicyBreakdown 
            title="Insurance Policy Breakdown"
          />
        </SafeSection>
      </div>
    </div>
  )
}

export default Dashboard

