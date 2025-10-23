import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { assetsService } from '@/services/assets'
import { transactionsService } from '@/services/transactions'
import buildPortfolioBuckets from '@/utils/portfolioAllocation'
import { useCurrency } from '@/hooks/useCurrency'
import MagicCard from '@/components/magicui/MagicCard'
import { Button } from '../ui/button'
import Loading from '../ui/Loading'

const DEFAULT_GROWTH = 6
const DEFAULT_INCOME = 1_200_000
const DEFAULT_PORTFOLIO_VALUE = 2_500_000

const calculateTimeValue = ({ portfolioValue, growthRate, annualIncome }) => {
  const growth = Number(growthRate) || 0
  const portfolio = Number(portfolioValue) || 0
  const income = Number(annualIncome) || 0

  const annualGain = portfolio * (growth / 100)
  const totalAnnual = annualGain + income

  const perMonth = totalAnnual / 12
  const perWeek = totalAnnual / 52
  const perDay = totalAnnual / 365
  const perHour = perDay / 24
  const perMinute = perHour / 60

  return {
    annualGain,
    totalAnnual,
    perMonth,
    perWeek,
    perDay,
    perHour,
    perMinute,
  }
}

const TimeValueTab = () => {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  })
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: ({ signal }) => transactionsService.getTransactions({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  })

  const loading = assetsLoading || txLoading

  const portfolioTotal = useMemo(() => {
    const { total } = buildPortfolioBuckets(assets, transactions)
    return Math.round(total)
  }, [assets, transactions])

  const [growthRate, setGrowthRate] = useState(DEFAULT_GROWTH)
  const [portfolioValue, setPortfolioValue] = useState(DEFAULT_PORTFOLIO_VALUE)
  const [annualIncome, setAnnualIncome] = useState(DEFAULT_INCOME)
  const [results, setResults] = useState(() =>
    calculateTimeValue({ portfolioValue: DEFAULT_PORTFOLIO_VALUE, growthRate: DEFAULT_GROWTH, annualIncome: DEFAULT_INCOME }),
  )

  useEffect(() => {
    if (portfolioTotal > 0) {
      setPortfolioValue(portfolioTotal)
      setResults(calculateTimeValue({ portfolioValue: portfolioTotal, growthRate, annualIncome }))
    }
  }, [portfolioTotal])

  if (loading) {
    return <Loading pageName="Time Value" />
  }

  const handleCalculate = () => {
    setResults(calculateTimeValue({ portfolioValue, growthRate, annualIncome }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Time Value of Growth</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Project how portfolio appreciation plus salary converts into daily and hourly value so you can quantify progress.
        </p>
      </div>

      <MagicCard className="bg-white dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Growth rate (% per year)
            <input
              type="number"
              min={0}
              step="0.1"
              value={growthRate}
              onChange={(event) => setGrowthRate(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Portfolio value
            <input
              type="number"
              min={0}
              step="1000"
              value={portfolioValue}
              onChange={(event) => setPortfolioValue(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Annual income
            <input
              type="number"
              min={0}
              step="1000"
              value={annualIncome}
              onChange={(event) => setAnnualIncome(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <div className="flex items-end justify-end">
            <Button variant="secondary" onClick={handleCalculate} className="w-full md:w-auto">
              Calculate
            </Button>
          </div>
        </div>
      </MagicCard>

      {results && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MagicCard className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400">Annual Growth From Portfolio</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(results.annualGain)}</p>
            <p className="text-xs text-slate-400">This assumes {growthRate.toFixed(1)}% appreciation on the current portfolio.</p>
          </MagicCard>
          <MagicCard className="bg-gradient-to-br from-emerald-900 via-emerald-900/90 to-emerald-950 text-emerald-100">
            <p className="text-xs uppercase tracking-wide text-emerald-300">Total Annual Purchasing Power</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(results.totalAnnual)}</p>
            <p className="text-xs text-emerald-200">Portfolio growth + income combined.</p>
          </MagicCard>
          <MagicCard className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Monthly equivalent</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(results.perMonth)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Roughly {formatCurrency(results.perWeek)} per week.</p>
          </MagicCard>
          <MagicCard className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Daily baseline</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(results.perDay)}</p>
            <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-center dark:border-emerald-300/40 dark:bg-emerald-400/10">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Your hour is worth</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-200">{formatCurrency(results.perHour)}!</p>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Every minute roughly equals {formatCurrency(results.perMinute)} of output.</p>
          </MagicCard>
        </div>
      )}

      <p className="text-xs italic text-slate-500 dark:text-slate-400">*For indicative purposes only. Actual returns and income will vary.</p>
    </div>
  )
}

export default TimeValueTab
