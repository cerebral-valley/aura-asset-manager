import React, { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import MagicCard from '@/components/magicui/MagicCard'
import { Button } from '../ui/button'
import { useCurrency } from '@/hooks/useCurrency'

const FREQUENCIES = {
  weekly: { label: 'Weekly', periods: 52 },
  monthly: { label: 'Monthly', periods: 12 },
  quarterly: { label: 'Quarterly', periods: 4 },
  semiannual: { label: 'Semi-Annual', periods: 2 },
  annual: { label: 'Annual', periods: 1 },
}

const DEFAULT_SIP = 10_000
const DEFAULT_LUMPSUM = 500_000
const DEFAULT_GROWTH = 8
const DEFAULT_INFLATION = 4
const DEFAULT_HORIZON = 10

const calculateSip = ({ amount, frequency, growthRate, inflationRate, years }) => {
  const freq = FREQUENCIES[frequency] || FREQUENCIES.monthly
  const nominal = growthRate / 100
  const periodicRate = Math.pow(1 + nominal, 1 / freq.periods) - 1
  const netNominal = (growthRate - inflationRate) / 100
  const netFactor = 1 + netNominal
  const netPeriodicRate = netFactor > 0 ? Math.pow(netFactor, 1 / freq.periods) - 1 : netNominal / freq.periods

  let balance = 0
  let realBalance = 0
  let invested = 0
  const rows = []

  for (let year = 1; year <= years; year += 1) {
    for (let p = 0; p < freq.periods; p += 1) {
      balance = balance * (1 + periodicRate) + amount
      realBalance = realBalance * (1 + netPeriodicRate) + amount
      invested += amount
    }

    rows.push({
      year,
      invested: Number(invested.toFixed(2)),
      portfolioValue: Number(balance.toFixed(2)),
      realPortfolioValue: Number(realBalance.toFixed(2)),
    })
  }

  return {
    data: rows,
    endingValue: balance,
    totalInvested: invested,
    endingReal: realBalance,
  }
}

const calculateLumpSum = ({ amount, growthRate, inflationRate, years }) => {
  const nominal = growthRate / 100
  const netNominal = (growthRate - inflationRate) / 100
  const netFactor = 1 + netNominal
  const effectiveNetFactor = Math.max(0, netFactor)

  let value = amount
  let realValue = amount
  const rows = []

  for (let year = 1; year <= years; year += 1) {
    value *= 1 + nominal
    realValue *= effectiveNetFactor
    rows.push({
      year,
      invested: amount,
      portfolioValue: Number(value.toFixed(2)),
      realPortfolioValue: Number(realValue.toFixed(2)),
    })
  }

  return {
    data: rows,
    endingValue: value,
    endingReal: realValue,
  }
}

const SIPAndLumpSumTab = () => {
  const { formatCurrency } = useCurrency()
  const [sipAmount, setSipAmount] = useState(DEFAULT_SIP)
  const [frequency, setFrequency] = useState('monthly')
  const [growthRate, setGrowthRate] = useState(DEFAULT_GROWTH)
  const [inflation, setInflation] = useState(DEFAULT_INFLATION)
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON)
  const [lumpSumAmount, setLumpSumAmount] = useState(DEFAULT_LUMPSUM)

  const sipResult = useMemo(
    () =>
      calculateSip({
        amount: sipAmount,
        frequency,
        growthRate,
        inflationRate: inflation,
        years: horizon,
      }),
    [sipAmount, frequency, growthRate, inflation, horizon],
  )

  const lumpSumResult = useMemo(
    () =>
      calculateLumpSum({
        amount: lumpSumAmount,
        growthRate,
        inflationRate: inflation,
        years: horizon,
      }),
    [lumpSumAmount, growthRate, inflation, horizon],
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">SIP &amp; Lump Sum Modeller</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Compare the future value of recurring investments against a one-time lump sum. Inflation adjustments help you read the results in
          today’s money.
        </p>
      </div>

      <MagicCard className="bg-white dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            SIP amount
            <input
              type="number"
              min={0}
              step="100"
              value={sipAmount}
              onChange={(event) => setSipAmount(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Frequency
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {Object.entries(FREQUENCIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Expected growth % (p.a.)
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
            Time horizon (years)
            <input
              type="number"
              min={1}
              value={horizon}
              onChange={(event) => setHorizon(Number(event.target.value) || 1)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Inflation % (p.a.)
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
            Lump sum amount
            <input
              type="number"
              min={0}
              step="1000"
              value={lumpSumAmount}
              onChange={(event) => setLumpSumAmount(Number(event.target.value) || 0)}
              className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>
      </MagicCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <MagicCard className="bg-white dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">SIP Projection</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Future value {formatCurrency(sipResult.endingValue)} ({formatCurrency(sipResult.totalInvested)} invested, real value {formatCurrency(sipResult.endingReal)}).
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={sipResult.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Invested" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="portfolioValue" name="Portfolio value" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realPortfolioValue" name="Inflation-adjusted value" stroke="#10b981" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MagicCard>

        <MagicCard className="bg-white dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Lump Sum Projection</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Future value {formatCurrency(lumpSumResult.endingValue)} (real value {formatCurrency(lumpSumResult.endingReal)}).
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={lumpSumResult.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Invested" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="portfolioValue" name="Portfolio value" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realPortfolioValue" name="Inflation-adjusted value" stroke="#10b981" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MagicCard>
      </div>

      <p className="text-xs italic text-slate-500 dark:text-slate-400">*Growth and inflation assumptions are illustrative only.</p>
    </div>
  )
}

export default SIPAndLumpSumTab
