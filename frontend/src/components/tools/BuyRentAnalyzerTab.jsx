import React, { useMemo, useState, useCallback } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCurrency } from '../../hooks/useCurrency'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const YEARS = 35

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const buildBuyVsRentModel = ({ homePrice, monthlyRent, appreciationRate, maintenanceRate, investmentReturn }) => {
  if (!homePrice || homePrice <= 0 || !monthlyRent || monthlyRent <= 0) {
    return { schedule: [], breakEvenYear: null }
  }

  let propertyValue = homePrice
  let owningCosts = 0
  let rentingPortfolio = homePrice

  const schedule = []
  let breakEvenYear = null

  for (let year = 1; year <= YEARS; year += 1) {
    propertyValue *= 1 + appreciationRate
    const maintenanceCost = propertyValue * maintenanceRate
    owningCosts += maintenanceCost
    const owningNetWorth = propertyValue - owningCosts

    rentingPortfolio *= 1 + investmentReturn
    const annualRent = monthlyRent * 12
    rentingPortfolio = Math.max(0, rentingPortfolio - annualRent)

    const rentingNetWorth = rentingPortfolio
    const diff = owningNetWorth - rentingNetWorth

    if (breakEvenYear === null && diff >= 0) {
      breakEvenYear = year
    }

    schedule.push({
      year,
      owningNetWorth: round2(owningNetWorth),
      rentingNetWorth: round2(rentingNetWorth),
      difference: round2(diff),
      annualRent: round2(annualRent),
      maintenanceCost: round2(maintenanceCost),
      propertyValue: round2(propertyValue),
      portfolioValue: round2(rentingPortfolio),
    })
  }

  return { schedule, breakEvenYear }
}

const BuyRentAnalyzerTab = () => {
  const { formatCurrency } = useCurrency()
  const [homePrice, setHomePrice] = useState(350000)
  const [monthlyRent, setMonthlyRent] = useState(1800)
  const [appreciationRate, setAppreciationRate] = useState(3)
  const [maintenanceRate, setMaintenanceRate] = useState(1.5)
  const [investmentReturn, setInvestmentReturn] = useState(5)

  const { schedule, breakEvenYear } = useMemo(
    () =>
      buildBuyVsRentModel({
        homePrice: Number(homePrice) || 0,
        monthlyRent: Number(monthlyRent) || 0,
        appreciationRate: (Number(appreciationRate) || 0) / 100,
        maintenanceRate: (Number(maintenanceRate) || 0) / 100,
        investmentReturn: (Number(investmentReturn) || 0) / 100,
      }),
    [homePrice, monthlyRent, appreciationRate, maintenanceRate, investmentReturn]
  )

  const handleExport = useCallback(() => {
    if (!schedule.length) {
      toast.error('Enter home price and rent to calculate before exporting')
      return
    }

    try {
      const workbook = XLSX.utils.book_new()

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Buy vs Rent Summary'],
        [],
        ['Home price', Number(homePrice)],
        ['Monthly rent', Number(monthlyRent)],
        ['Annual appreciation %', `${Number(appreciationRate)}%`],
        ['Maintenance % of value', `${Number(maintenanceRate)}%`],
        ['Investment return %', `${Number(investmentReturn)}%`],
        ['Break-even year', breakEvenYear ?? 'Not reached'],
      ])
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      const scheduleSheet = XLSX.utils.json_to_sheet(
        schedule.map((entry) => ({
          Year: entry.year,
          OwningNetWorth: entry.owningNetWorth,
          RentingNetWorth: entry.rentingNetWorth,
          Difference: entry.difference,
          AnnualRent: entry.annualRent,
          MaintenanceCost: entry.maintenanceCost,
          PropertyValue: entry.propertyValue,
          PortfolioValue: entry.portfolioValue,
        }))
      )
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule')

      XLSX.writeFile(workbook, `buy-vs-rent-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Buy vs Rent analysis exported')
    } catch (error) {
      console.error('Buy vs Rent export error:', error)
      toast.error('Failed to export analysis')
    }
  }, [schedule, homePrice, monthlyRent, appreciationRate, maintenanceRate, investmentReturn, breakEvenYear])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Buy vs Rent Break-Even Analyzer</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Compare the long-term net worth impact of purchasing a home versus renting and investing the difference.
          </p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={handleExport} title="Download analysis to Excel">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Home price
            <input
              type="number"
              min={0}
              step="1000"
              value={homePrice}
              onChange={(event) => setHomePrice(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Monthly rent
            <input
              type="number"
              min={0}
              step="50"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Appreciation % (annual)
            <input
              type="number"
              min={-10}
              step="0.1"
              value={appreciationRate}
              onChange={(event) => setAppreciationRate(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Maintenance % of value
            <input
              type="number"
              min={0}
              step="0.1"
              value={maintenanceRate}
              onChange={(event) => setMaintenanceRate(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Investment return %
            <input
              type="number"
              min={0}
              step="0.1"
              value={investmentReturn}
              onChange={(event) => setInvestmentReturn(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Break-even year</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {breakEvenYear ? `Year ${breakEvenYear}` : 'Not reached'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Owning surpasses renting</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Final property value</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {schedule.length ? formatCurrency(schedule[schedule.length - 1].propertyValue) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">After {YEARS} years</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Final renter portfolio</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {schedule.length ? formatCurrency(schedule[schedule.length - 1].portfolioValue) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">After rent payments</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Yearly rent outflow</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency((monthlyRent || 0) * 12)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assuming flat rent</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Net Worth Over Time</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Compare total wealth from owning the property versus renting and investing the freed capital.
        </p>
        <div className="mt-4 h-80 w-full">
          {schedule.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={schedule}>
                <defs>
                  <linearGradient id="owningGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="rentingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                <XAxis dataKey="year" tickFormatter={(value) => `Y${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(value) => `Year ${value}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1f2937', color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="owningNetWorth" name="Owning net worth" stroke="#2563eb" fill="url(#owningGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="rentingNetWorth" name="Renting net worth" stroke="#10b981" fill="url(#rentingGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Enter home price and rent to model the comparison.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Yearly Breakdown</h3>
        <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800/70">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">Owning NW</th>
                <th className="px-4 py-2">Renting NW</th>
                <th className="px-4 py-2">Difference</th>
                <th className="px-4 py-2">Maintenance</th>
                <th className="px-4 py-2">Rent Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schedule.map((entry) => (
                <tr key={entry.year} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-2 font-medium">Y{entry.year}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.owningNetWorth)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.rentingNetWorth)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.difference)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.maintenanceCost)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.annualRent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!schedule.length && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No yearly data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyRentAnalyzerTab
