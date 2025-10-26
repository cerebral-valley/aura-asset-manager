import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import EnhancedValueDisplayCard from '../components/dashboard/EnhancedValueDisplayCard.jsx'
import EnhancedAssetAllocationChart from '../components/dashboard/EnhancedAssetAllocationChart.jsx'
import EnhancedInsurancePolicyBreakdown from '../components/dashboard/EnhancedInsurancePolicyBreakdown.jsx'
import NetWorthGoalCard from '../components/dashboard/NetWorthGoalCard.jsx'
import ProfileSnapshotCard from '../components/dashboard/ProfileSnapshotCard.jsx'
import RecentTransactionsCard from '../components/dashboard/RecentTransactionsCard.jsx'
import { dashboardService } from '../services/dashboard.js'
import { goalsService } from '../services/goals.js'
import { profileService } from '../services/profile.js'
import { transactionsService } from '../services/transactions.js'
import { insuranceService } from '../services/insurance.js'
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

// Utility function to calculate dynamic growth potential threshold
const getGrowthPotentialThreshold = (netWorth) => {
  const thresholds = [
    { max: 100000, target: 100000 },
    { max: 250000, target: 250000 },
    { max: 500000, target: 500000 },
    { max: 1000000, target: 1000000 },
    { max: 10000000, target: 10000000 },
    { max: 50000000, target: 50000000 },
    { max: 100000000, target: 100000000 },
    { max: 250000000, target: 250000000 },
    { max: 500000000, target: 500000000 },
    { max: 1000000000, target: 1000000000 },
    { max: 10000000000, target: 10000000000 },
    { max: 50000000000, target: 50000000000 },
    { max: 100000000000, target: 100000000000 },
    { max: 500000000000, target: 500000000000 },
    { max: 1000000000000, target: 1000000000000 },
  ]
  
  for (const threshold of thresholds) {
    if (netWorth < threshold.max) {
      return threshold.target
    }
  }
  
  // For net worth >= 1 trillion, use 1 trillion
  return 1000000000000
}

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

  // Fetch goals data
  const { data: goalsData } = useQuery({
    queryKey: queryKeys.goals.list(),
    queryFn: ({ signal }) => goalsService.getGoals({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch profile data
  const { data: profileData } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => profileService.getProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch transactions data
  const { data: transactionsData } = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: ({ signal }) => transactionsService.getTransactions({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch insurance data for coverage ratios
  const { data: insurancePolicies } = useQuery({
    queryKey: queryKeys.insurance.list(),
    queryFn: ({ signal }) => insuranceService.getPolicies({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Calculate annual income from profile data
  const annualIncome = profileData?.annual_income || 0

  // Calculate life and disability insurance coverage ratios
  const lifeCoverageRatio = useMemo(() => {
    if (!insurancePolicies || !annualIncome || annualIncome === 0) return 'No Coverage'
    
    let lifeCoverage = 0
    insurancePolicies.forEach(policy => {
      if (policy.status === 'active' && policy.policy_type === 'life') {
        lifeCoverage += parseFloat(policy.coverage_amount) || 0
      }
    })
    
    return lifeCoverage > 0 ? `${(lifeCoverage / annualIncome).toFixed(1)}x` : 'No Coverage'
  }, [insurancePolicies, annualIncome])

  const disabilityCoverageRatio = useMemo(() => {
    if (!insurancePolicies || !annualIncome || annualIncome === 0) return 'No Coverage'
    
    let disabilityCoverage = 0
    insurancePolicies.forEach(policy => {
      if (policy.status === 'active' && policy.policy_type === 'disability') {
        disabilityCoverage += parseFloat(policy.coverage_amount) || 0
      }
    })
    
    return disabilityCoverage > 0 ? `${(disabilityCoverage / annualIncome).toFixed(1)}x` : 'No Coverage'
  }, [insurancePolicies, annualIncome])

  // Find primary net worth goal
  const netWorthGoal = goalsData?.find(goal => 
    goal.goal_type === 'net_worth' && !goal.goal_completed
  )

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

  // Calculate growth potential with dynamic threshold
  const netWorth = dashboardData?.net_worth || 0
  const growthPotentialThreshold = getGrowthPotentialThreshold(netWorth)
  const achievedPercentage = ((netWorth / growthPotentialThreshold) * 100)
  const remainingPercentage = (100 - achievedPercentage).toFixed(1)
  const growthPotentialPercentage = remainingPercentage

  // Calculate asset to income ratio
  const assetToIncomeRatio = annualIncome > 0 ? (netWorth / annualIncome).toFixed(1) : '0.0'

  return (
    <div className="relative min-h-screen p-6">
      <AnimatedGradient className="fixed inset-0 -z-10 opacity-30" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Hi {profileData?.first_name || 'there'}, Welcome to Your {dashboardData?.user_theme === 'empire_builder' ? 'Empire' : 'Sanctuary'}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            value={`${growthPotentialPercentage}%`}
            subtitle="Progress toward next milestone"
            icon={TrendingUp}
            className="md:col-span-1"
            tooltip={`Growth Potential tracks your progress toward the next wealth milestone. Your net worth: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorth)}. Next target: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(growthPotentialThreshold)}`}
            animate={false}
            magicHover={true}
          />
        </BlurFade>
        <BlurFade delay={0.25}>
          <EnhancedValueDisplayCard
            title="Asset to Income"
            value={`${assetToIncomeRatio}x`}
            subtitle="Assets as multiple of income"
            icon={Wallet}
            className="md:col-span-1"
            tooltip={`This shows how many times your annual income your total assets represent. Higher ratio indicates stronger wealth accumulation.`}
            animate={false}
            magicHover={true}
          />
        </BlurFade>
        <BlurFade delay={0.3}>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Insurance Coverage</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Life</span>
                <span className="text-2xl font-bold text-foreground">{lifeCoverageRatio}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Disability</span>
                <span className="text-2xl font-bold text-foreground">{disabilityCoverageRatio}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Coverage to income ratios</p>
          </div>
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

      {/* Additional Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <BlurFade delay={0.35}>
          <SafeSection debugId="Dashboard:NetWorthGoal">
            <NetWorthGoalCard 
              goal={netWorthGoal}
              currentNetWorth={dashboardData?.net_worth || 0}
            />
          </SafeSection>
        </BlurFade>
        <BlurFade delay={0.4}>
          <SafeSection debugId="Dashboard:ProfileSnapshot">
            <ProfileSnapshotCard profile={profileData} />
          </SafeSection>
        </BlurFade>
        <BlurFade delay={0.45}>
          <SafeSection debugId="Dashboard:RecentTransactions">
            <RecentTransactionsCard transactions={transactionsData} />
          </SafeSection>
        </BlurFade>
      </div>
      </div>
    </div>
  )
}

export default Dashboard

