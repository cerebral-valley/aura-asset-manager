import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInYears, isValid, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { assetsService } from '@/services/assets'
import { transactionsService } from '@/services/transactions'
import { profileService } from '@/services/profile'
import buildPortfolioBuckets from '@/utils/portfolioAllocation'
import { useCurrency } from '@/hooks/useCurrency'
import { Button } from '../ui/button'
import MagicCard from '@/components/magicui/MagicCard'
import Loading from '../ui/Loading'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

const DEFAULT_YEARS_TO_RETIRE = 2
const DEFAULT_INFLATION = 5
const DEFAULT_RETURN = 6
const DEFAULT_SWR = 4
const DEFAULT_REINVESTMENT = 10
const DEFAULT_SAFETY_FACTOR = 1

const computeFire = ({
  annualExpenses,
  inflationRate,
  expectedReturn,
  yearsToRetire,
  swr,
  reinvestment,
  safetyFactor,
}) => {
  const n = Math.max(yearsToRetire, 0)
  const i = inflationRate / 100
  const g = expectedReturn / 100
  const r = Math.min(Math.max(reinvestment / 100, 0), 0.99)
  const k = Math.max(safetyFactor, 0.1)

  const expensesFuture = annualExpenses * Math.pow(1 + i, n)

  let denominator = k * (g - i) * (1 - r)
  if (Math.abs(g - i) < 1e-6) {
    denominator = k * 0.0001 * (1 - r)
  }

  if (denominator <= 0) {
    return {
      fireNumber: 0,
      futureExpenses: expensesFuture,
      effectiveWithdrawalRate: 0,
      series: [],
    }
  }

  const required = expensesFuture / denominator

  const series = []
  for (let year = 0; year <= n; year += 1) {
    const exp = annualExpenses * Math.pow(1 + i, year)
    const requirement = exp / (k * Math.max((g - i) || 0.0001, 0.0001) * (1 - r))
    series.push({
      year,
      requirement: Number(requirement.toFixed(2)),
      expenses: Number(exp.toFixed(2)),
    })
  }

  return {
    fireNumber: Number(required.toFixed(2)),
    futureExpenses: Number(expensesFuture.toFixed(2)),
    effectiveWithdrawalRate: ((swr / 100) * (1 - r)) * 100,
    series,
  }
}

const FIRENumberTab = () => {
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => profileService.getProfile(),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  })

  const loading = assetsLoading || txLoading || profileLoading
  const { total: portfolioTotal } = useMemo(() => buildPortfolioBuckets(assets, transactions), [assets, transactions])

  const annualIncome = Number(profile?.annual_income) || 1_200_000
  const defaultExpenses = Number(profile?.annual_expenses) || annualIncome

  const [annualExpenses, setAnnualExpenses] = useState(defaultExpenses)
  const [yearsToRetire, setYearsToRetire] = useState(DEFAULT_YEARS_TO_RETIRE)
  const [inflation, setInflation] = useState(DEFAULT_INFLATION)
  const [expectedReturn, setExpectedReturn] = useState(DEFAULT_RETURN)
  const [swr, setSWR] = useState(DEFAULT_SWR)
  const [reinvestment, setReinvestment] = useState(DEFAULT_REINVESTMENT)
  const [safetyFactor, setSafetyFactor] = useState(DEFAULT_SAFETY_FACTOR)

  useEffect(() => {
    setAnnualExpenses(defaultExpenses)
  }, [defaultExpenses])

  const age = useMemo(() => {
    const dob = profile?.date_of_birth
    if (!dob) return null
    const parsed = parseISO(dob)
    if (!isValid(parsed)) return null
    return Math.max(0, differenceInYears(new Date(), parsed))
  }, [profile?.date_of_birth])

  const calculations = useMemo(
    () =>
      computeFire({
        annualExpenses,
        inflationRate: inflation,
        expectedReturn,
        yearsToRetire,
        swr,
        reinvestment,
        safetyFactor,
      }),
    [annualExpenses, inflation, expectedReturn, yearsToRetire, swr, reinvestment, safetyFactor],
  )

  const diff = portfolioTotal - calculations.fireNumber
  const surplus = diff >= 0

  if (loading) {
    return <Loading pageName="FIRE Number" />
  }

  const handleCalculate = () => {
    if (yearsToRetire < 0) {
      toast.error('Years to retirement cannot be negative.')
      return
    }
    toast.success('FIRE number recalculated')
  }

  const fireEquation = 'FIRE = E₀ (1 + i)ⁿ / [ k × (g − i) × (1 − r) ]'

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">FIRE Number</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Estimate the portfolio size required to fund your lifestyle in {yearsToRetire} years. Inputs auto-fill from your profile when available.
        </p>
      </div>

      <MagicCard className="bg-white dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-6">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Annual expenses
            <input
              type="number"
              min={0}
              step="1000"
              value={annualExpenses}
              onChange={(event) => setAnnualExpenses(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Years to FIRE retirement
            <input
              type="number"
              min={0}
              step="1"
              value={yearsToRetire}
              onChange={(event) => setYearsToRetire(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Inflation %
            <input
              type="number"
              min={0}
              step="0.1"
              value={inflation}
              onChange={(event) => setInflation(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Expected return %
            <input
              type="number"
              min={0}
              step="0.1"
              value={expectedReturn}
              onChange={(event) => setExpectedReturn(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            SWR %
            <input
              type="number"
              min={0.5}
              step="0.1"
              value={swr}
              onChange={(event) => setSWR(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Reinvest % of withdrawal
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={reinvestment}
              onChange={(event) => setReinvestment(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Safety factor (k)
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={safetyFactor}
              onChange={(event) => setSafetyFactor(Number(event.target.value) || DEFAULT_SAFETY_FACTOR)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <Button variant="secondary" onClick={handleCalculate} className="w-full">
              Calculate
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Equation: {fireEquation}</p>
      </MagicCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MagicCard className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 text-slate-100">
          <p className="text-xs uppercase tracking-wide text-slate-400">Required FIRE Number</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(calculations.fireNumber)}</p>
          <p className="text-xs text-slate-400">Effective withdrawal rate ≈ {calculations.effectiveWithdrawalRate.toFixed(2)}%</p>
        </MagicCard>
        <MagicCard className="bg-white dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Future annual expense (Year {yearsToRetire})</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(calculations.futureExpenses)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Includes {inflation.toFixed(1)}% inflation drift.</p>
        </MagicCard>
        <MagicCard className={`text-slate-100 ${surplus ? 'bg-emerald-900/80' : 'bg-rose-900/80'}`}>
          <p className="text-xs uppercase tracking-wide text-slate-200">Net position</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(Math.abs(diff))} {surplus ? 'surplus' : 'deficit'}
          </p>
          <p className="text-xs text-slate-200">Total assets ≈ {formatCurrency(portfolioTotal)}</p>
        </MagicCard>
        <MagicCard className="bg-white dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current age</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{age ?? '—'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Years to plan: {yearsToRetire}</p>
        </MagicCard>
      </div>

      <MagicCard className="bg-white dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Cash Flow Outlook</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Projection assumes expenses grow with inflation and the target portfolio compounds at {expectedReturn}% per annum before withdrawals.</p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={calculations.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
              <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
              <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
              <Line type="monotone" dataKey="requirement" name="Required FIRE" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" name="Projected expenses" stroke="#f97316" strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </MagicCard>

      <MagicCard className="bg-white dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Things people forget to build in</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>Taxes on withdrawals and capital gains (differs by country).</li>
          <li>Health-care &amp; long-term-care costs, which often rise faster than CPI.</li>
          <li>Sequence-of-returns risk: early bear markets hurt more—hold a cash buffer or dynamic guard-rails.</li>
          <li>Currency &amp; inflation drift if you retire in a different country or keep global assets.</li>
          <li>Lifestyle creep—review your annual spend estimate every couple of years.</li>
          <li>Shock events: unknown medical, personal, or financial surprises that require emergency funds.</li>
        </ul>
        <p className="mt-4 text-xs italic text-slate-500 dark:text-slate-400">*For indicative purposes only.</p>
      </MagicCard>
    </div>
  )
}

export default FIRENumberTab
