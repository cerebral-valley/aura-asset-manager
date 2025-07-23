import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import ValueDisplayCard from '../components/dashboard/ValueDisplayCard.jsx'
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart.jsx'
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx'
import { dashboardService } from '../services/dashboard.js'
import { Wallet, Shield, TrendingUp, PlusCircle } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getSummary()
        setDashboardData(data)
      } catch (err) {
        console.error('Dashboard error:', err)
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Failed to load dashboard data: ${err.response.status} - ${err.response.data?.detail || err.message}`)
          console.error('Response data:', err.response.data)
        } else if (err.request) {
          // The request was made but no response was received
          setError(`No response from API server. The backend may not be running or accessible.`)
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error preparing request: ${err.message}`)
        }
      } finally {
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
    return (
      <AppLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your sanctuary...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout currentPage="dashboard">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    )
  }

  const themeLabels = getThemeLabels(dashboardData?.user_theme)

  return (
    <AppLayout currentPage="dashboard">
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
          <Button className="flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Asset</span>
          </Button>
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

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AssetAllocationChart 
            data={dashboardData?.asset_allocation || []}
            title="Your Portfolio Composition"
          />
          <RecentTransactions 
            transactions={dashboardData?.recent_transactions || []}
            title="Recent Milestones"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Add Insurance
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Record Transaction
            </Button>
            <Button variant="outline" className="justify-start">
              <Wallet className="h-4 w-4 mr-2" />
              Update Values
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard

