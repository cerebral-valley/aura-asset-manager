import React, { useMemo, useState, useCallback } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../ui/button'
import { useCurrency } from '../../hooks/useCurrency'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const MAX_MONTHS = 360

const buildSavingSchedule = ({ propertyCost, desiredLtv, monthlySavings }) => {
  if (!propertyCost || propertyCost <= 0 || !monthlySavings || monthlySavings <= 0) {
    return { schedule: [], targetAmount: 0, monthsNeeded: null }
  }

  const targetAmount = propertyCost * (1 - desiredLtv)
  let balance = 0
  const schedule = []
  let monthsNeeded = null

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    balance += monthlySavings
    if (monthsNeeded === null && balance >= targetAmount) {
      monthsNeeded = month
    }

    schedule.push({
      month,
      totalSaved: Math.min(balance, targetAmount),
      pace: (balance / targetAmount) * 100,
    })

    if (balance >= targetAmount) {
      break
    }
  }

  return { schedule, targetAmount, monthsNeeded }
}

const DownPaymentTrackerTab = () => {
  const { formatCurrency } = useCurrency()
  const [propertyCost, setPropertyCost] = useState(450000)
  const [desiredLtvPercent, setDesiredLtvPercent] = useState(70)
  const [monthlySavings, setMonthlySavings] = useState(2500)

  const desiredLtv = (Number(desiredLtvPercent) || 0) / 100
  const { schedule, targetAmount, monthsNeeded } = useMemo(
    () =>
      buildSavingSchedule({
        propertyCost: Number(propertyCost) || 0,
        desiredLtv,
        monthlySavings: Number(monthlySavings) || 0,
      }),
    [propertyCost, desiredLtv, monthlySavings]
  )

  const yearsNeeded = monthsNeeded ? monthsNeeded / 12 : null

  const handleExport = useCallback(() => {
    if (!schedule.length) {
      toast.error('Provide savings inputs to calculate before exporting')
      return
    }

    try {
      const workbook = XLSX.utils.book_new()

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Down-Payment Tracker Summary'],
        [],
        ['Property cost', Number(propertyCost)],
        ['Desired LTV %', `${Number(desiredLtvPercent)}%`],
        ['Down payment target', targetAmount],
        ['Monthly savings', Number(monthlySavings)],
        ['Months needed', monthsNeeded ?? 'Not reached'],
      ])
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      const scheduleSheet = XLSX.utils.json_to_sheet(
        schedule.map((entry) => ({
          Month: entry.month,
          TotalSaved: entry.totalSaved,
          ProgressPercent: entry.pace,
        }))
      )
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule')

      XLSX.writeFile(workbook, `down-payment-tracker-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Down-payment plan exported')
    } catch (error) {
      console.error('Down-payment export error:', error)
      toast.error('Failed to export tracker')
    }
  }, [schedule, propertyCost, desiredLtvPercent, targetAmount, monthlySavings, monthsNeeded])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Down-Payment Speed-Run Tracker</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Project how quickly you can accumulate the required down payment for a property given your savings pace.
          </p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={handleExport} title="Download savings schedule">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Property cost
            <input
              type="number"
              min={0}
              step="1000"
              value={propertyCost}
              onChange={(event) => setPropertyCost(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Desired LTV %
            <input
              type="number"
              min={1}
              max={99}
              step="1"
              value={desiredLtvPercent}
              onChange={(event) => setDesiredLtvPercent(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Monthly savings amount
            <input
              type="number"
              min={0}
              step="50"
              value={monthlySavings}
              onChange={(event) => setMonthlySavings(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Down payment target</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(targetAmount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">({((1 - desiredLtv) * 100).toFixed(1)}% of property cost)</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Months to target</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {monthsNeeded ?? 'Not reached'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assuming constant savings</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Years to target</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {yearsNeeded ? yearsNeeded.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Down-payment runway</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Saved so far</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {schedule.length ? formatCurrency(schedule[schedule.length - 1].totalSaved) : formatCurrency(0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">End of projection window</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Savings Pace vs Target</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Visualise cumulative progress toward the down-payment goal.</p>
        <div className="mt-4 h-72 w-full">
          {schedule.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={schedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="month" tickFormatter={(value) => `M${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(value) => `Month ${value}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1f2937', color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="totalSaved" name="Saved" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey={() => targetAmount}
                  name="Target"
                  stroke="#f97316"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Enter property cost, LTV, and savings rate to visualise progress.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monthly Progress</h3>
        <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800/70">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">Total Saved</th>
                <th className="px-4 py-2">Progress %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schedule.map((entry) => (
                <tr key={entry.month} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-2 font-medium">M{entry.month}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.totalSaved)}</td>
                  <td className="px-4 py-2">{entry.pace.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!schedule.length && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No monthly progress yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DownPaymentTrackerTab
