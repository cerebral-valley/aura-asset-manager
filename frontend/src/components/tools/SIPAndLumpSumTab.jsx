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
  const periods = years * freq.periods
  const nominal = growthRate / 100
  const periodicRate = Math.pow(1 + nominal, 1 / freq.periods) - 1
  const inflation = inflationRate / 100

  let balance = 0
  let invested = 0
  const rows = []

  for (let year = 1; year <= years; year += 1) {
    for (let p = 0; p < freq.periods; p += 1) {
      balance = balance * (1 + periodicRate) + amount
      invested += amount
    }

    const returns = balance - invested
    const realValue = balance / Math.pow(1 + inflation, year)

    rows.push({
      year,
      invested: Number(invested.toFixed(2)),
      value: Number(balance.toFixed(2)),
      returns: Number(returns.toFixed(2)),
      realValue: Number(realValue.toFixed(2)),
      realReturns: Number((realValue - invested).toFixed(2)),
    })
  }

  return {
    data: rows,
    endingValue: balance,
    totalInvested: invested,
    endingReal: rows.at(-1)?.realValue ?? 0,
  }
}

const calculateLumpSum = ({ amount, growthRate, inflationRate, years }) => {
  const nominal = growthRate / 100
  const inflation = inflationRate / 100

  let value = amount
  const rows = []

  for (let year = 1; year <= years; year += 1) {
    value *= 1 + nominal
    const realValue = value / Math.pow(1 + inflation, year)
    const returns = value - amount

    rows.push({
      year,
      invested: amount,
      value: Number(value.toFixed(2)),
      returns: Number(returns.toFixed(2)),
      realValue: Number(realValue.toFixed(2)),
      realReturns: Number((realValue - amount).toFixed(2)),
    })
  }

  return {
    data: rows,
    endingValue: value,
    endingReal: rows.at(-1)?.realValue ?? 0,
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
          <p className="text-sm text-slate-600 dark:text-slate-400">Final value {formatCurrency(sipResult.endingValue)} ({formatCurrency(sipResult.totalInvested)} invested).</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={sipResult.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Invested" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="returns" name="Cumulative returns" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realReturns" name="Inflation-adjusted returns" stroke="#10b981" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MagicCard>

        <MagicCard className="bg-white dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Lump Sum Projection</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Future value {formatCurrency(lumpSumResult.endingValue)} (real value {formatCurrency(lumpSumResult.endingReal)}).</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={lumpSumResult.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Invested" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="returns" name="Cumulative returns" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realReturns" name="Inflation-adjusted returns" stroke="#10b981" strokeDasharray="4 4" dot={false} />
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
