// Example: Enhanced Dashboard with Magic UI
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import EnhancedValueDisplayCard from '../components/dashboard/EnhancedValueDisplayCard.jsx'
import AnimatedGradient from '../components/magicui/AnimatedGradient.jsx'
import ShimmerButton from '../components/magicui/ShimmerButton.jsx'
import { dashboardService } from '../services/dashboard.js'
import { queryKeys } from '../lib/queryKeys'
import { Wallet, Shield, TrendingUp, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

const DashboardExample = () => {
  const { user } = useAuth()
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: ({ signal }) => dashboardService.getSummary({ signal }),
    enabled: !!user,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="relative min-h-screen p-6">
      {/* Animated gradient background */}
      <AnimatedGradient className="fixed inset-0 -z-10 opacity-50" />
      
      {/* Header with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Financial Overview</h1>
        <p className="text-muted-foreground">Your wealth dashboard</p>
      </motion.div>

      {/* Value cards with staggered animation */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EnhancedValueDisplayCard
            title="Net Worth"
            value={dashboardData?.netWorth || 0}
            subtitle="Total assets minus liabilities"
            icon={Wallet}
            animate={true}
            sparkle={true}  // Highlight most important value
            magicHover={true}
            tooltip="Your total wealth including all assets and subtracting all debts"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedValueDisplayCard
            title="Insurance Coverage"
            value={dashboardData?.totalCoverage || 0}
            subtitle="Total protection"
            icon={Shield}
            animate={true}
            magicHover={true}
            tooltip="Sum of all your insurance policy coverage amounts"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EnhancedValueDisplayCard
            title="Monthly Growth"
            value={dashboardData?.monthlyGrowth || 0}
            subtitle="Average monthly increase"
            icon={TrendingUp}
            trend="up"
            trendValue="+12.5%"
            animate={true}
            magicHover={true}
          />
        </motion.div>
      </div>

      {/* CTA button with shimmer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4"
      >
        <ShimmerButton
          className="flex items-center gap-2"
          shimmerColor="#8b5cf6"
          background="linear-gradient(to right, #8b5cf6, #ec4899)"
          onClick={() => console.log('Add asset')}
        >
          <Plus className="h-4 w-4" />
          Add New Asset
        </ShimmerButton>
      </motion.div>
    </div>
  )
}

export default DashboardExample
