import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { assetsService } from '@/services/assets'
import { transactionsService } from '@/services/transactions'
import { toast } from 'sonner'
import MatrixChart from '@/components/charts/MatrixChart'
import MagicCard from '@/components/magicui/MagicCard'
import Loading from '@/components/ui/Loading'

const AssetMatrixTab = () => {
  const { user } = useAuth()

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    onError: () => toast.error('Unable to load assets for matrix'),
  })

  const {
    data: transactions = [],
    isLoading: txLoading,
    error: txError,
  } = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: ({ signal }) => transactionsService.getTransactions({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    onError: () => toast.error('Unable to load transactions for matrix'),
  })

  if (!user || assetsLoading || txLoading) {
    return <Loading pageName="Asset Matrix" />
  }

  if (assetsError || txError) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Unable to load asset matrix at the moment. Please try again later.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Asset Distribution Matrix</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Visualise how your assets spread across liquidity and time horizons using interactive matrices.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MagicCard gradientColor="#1d4ed8" className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <h3 className="text-lg font-semibold text-slate-100">Liquid Assets Matrix</h3>
          <p className="text-sm text-slate-400 mb-4">Track short-term allocations and cash-like instruments.</p>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <MatrixChart assets={assets} transactions={transactions} title="Liquid Assets Matrix" isLiquid />
          </div>
        </MagicCard>

        <MagicCard gradientColor="#be185d" className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <h3 className="text-lg font-semibold text-slate-100">Illiquid Assets Matrix</h3>
          <p className="text-sm text-slate-400 mb-4">Understand long-term positions across strategic goals.</p>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <MatrixChart assets={assets} transactions={transactions} title="Illiquid Assets Matrix" isLiquid={false} />
          </div>
        </MagicCard>
      </div>
    </div>
  )
}

export default AssetMatrixTab
