import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import EnhancedValueDisplayCard from '../components/dashboard/EnhancedValueDisplayCard.jsx'
import EnhancedAssetAllocationChart from '../components/dashboard/EnhancedAssetAllocationChart.jsx'
import EnhancedInsurancePolicyBreakdown from '../components/dashboard/EnhancedInsurancePolicyBreakdown.jsx'
import { dashboardService } from '../services/dashboard.js'
import { queryKeys } from '../lib/queryKeys'
import { getVersionDisplay } from '../version.js'
import { Wallet, Shield, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import AnimatedGradient from '../components/magicui/AnimatedGradient.jsx'
import BlurFade from '../components/magicui/BlurFade.jsx'
import Orbit from '../components/magicui/Orbit.jsx'
import SafeSection from '../components/util/SafeSection'
import { log, warn, error } from '@/lib/debug'
import * as Sentry from '@sentry/react'

const Dashboard = () => {
  const { user } = useAuth()
  // Import verification
  if (!dashboardService?.getSummary) warn('Dashboard', 'service missing: getSummary')

  log('Dashboard', 'init')

  // TanStack Query for dashboard data
  const {
    data: dashboardData,
    isLoading: loading,
    error: queryError,
    isError
  } = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: ({ signal }) => dashboardService.getSummary({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    onSuccess: (data) => {
      log('Dashboard', 'fetch:success', { dataKeys: Object.keys(data || {}) })
    },
    onError: (err) => {
      error('Dashboard', 'fetch:error', err)
    },
  })

  // Convert TanStack Query error to string for display
  const errorMessage = isError && queryError ? (() => {
    if (queryError.response) {
      return `Failed to load dashboard data: ${queryError.response.status} - ${queryError.response.data?.detail || queryError.message}`
    } else if (queryError.request) {
      return `No response from API server. The backend may not be running or accessible.`
    } else {
      return `Error preparing request: ${queryError.message}`
    }
  })() : ''

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
    return (
      <div className="flex items-center justify-center h-screen">
        <Orbit size={60} className="mx-auto" />
      </div>
    )
  }

  if (isError) {
    log('Dashboard', 'render:error', errorMessage)
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )
  }

  console.log('Dashboard: Rendering main dashboard with data:', !!dashboardData)
  log('Dashboard', 'render:ready', { hasData: !!dashboardData })

  const themeLabels = getThemeLabels(dashboardData?.user_theme || 'sanctuary_builder')

  return (
    <div className="relative min-h-screen p-6">
      <AnimatedGradient className="fixed inset-0 -z-10 opacity-30" />
      
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
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-mono">
              {getVersionDisplay()}
            </div>
          </div>
        </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BlurFade delay={0.1}>
          <EnhancedValueDisplayCard
            title={themeLabels.netWorth}
            value={dashboardData?.net_worth || 0}
            subtitle="Total asset value"
            icon={Wallet}
            className="md:col-span-1"
            animate={true}
            sparkle={true}
            magicHover={true}
          />
        </BlurFade>
        <BlurFade delay={0.15}>
          <EnhancedValueDisplayCard
            title={themeLabels.insurance}
            value={dashboardData?.total_insurance_coverage || 0}
            subtitle="Total coverage protection"
            icon={Shield}
            className="md:col-span-1"
            animate={true}
            magicHover={true}
          />
        </BlurFade>
        <BlurFade delay={0.2}>
          <EnhancedValueDisplayCard
            title="Growth Potential"
            value={`${((dashboardData?.net_worth || 0) / 1000000 * 100).toFixed(1)}%`}
            subtitle="Progress toward financial freedom"
            icon={TrendingUp}
            className="md:col-span-1 lg:col-span-1"
            tooltip="Growth Potential is calculated as a percentage of your net worth towards a $1M financial independence target. Formula: (Net Worth / $1,000,000) × 100%. This helps track your progress towards financial freedom."
            animate={false}
            magicHover={true}
          />
        </BlurFade>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BlurFade delay={0.25}>
          <SafeSection debugId="Dashboard:AssetAllocationChart">
            <EnhancedAssetAllocationChart 
              data={dashboardData?.asset_allocation || []}
              title="Your Portfolio Composition"
            />
          </SafeSection>
        </BlurFade>
        <BlurFade delay={0.3}>
          <SafeSection debugId="Dashboard:InsurancePolicyBreakdown">
            <EnhancedInsurancePolicyBreakdown 
              title="Insurance Policy Breakdown"
            />
          </SafeSection>
        </BlurFade>
      </div>
      </div>
    </div>
  )
}

export default Dashboard

