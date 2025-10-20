import React, { useState, useMemo, useCallback } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../ui/button'
import { useCurrency } from '../../hooks/useCurrency'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const calculateLoanSchedule = ({ amount, months, annualRate, loanType }) => {
  const schedule = []
  if (!amount || amount <= 0 || !months || months <= 0) {
    return { schedule, summary: { totalInterest: 0, totalPrincipal: 0, totalPaid: 0, monthlyPayment: 0, totalMonths: 0 } }
  }

  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0
  let balance = amount
  let totalInterest = 0
  let totalPrincipal = 0
  let cumulativePrincipal = 0
  let cumulativeInterest = 0
  let monthlyPayment = 0

  if (loanType === 'interest_only') {
    const interestPayment = monthlyRate === 0 ? 0 : amount * monthlyRate
    monthlyPayment = interestPayment

    for (let month = 1; month <= months; month += 1) {
      const interest = interestPayment
      const principal = month === months ? amount : 0
      const payment = interest + principal
      balance = month === months ? 0 : amount

      totalInterest += interest
      totalPrincipal += principal
      cumulativeInterest += interest
      cumulativePrincipal += principal

      schedule.push({
        month,
        interestPayment: round2(interest),
        principalPayment: round2(principal),
        totalPayment: round2(payment),
        balanceAfter: round2(balance),
        cumulativeInterest: round2(cumulativeInterest),
        cumulativePrincipal: round2(cumulativePrincipal),
      })
    }
  } else {
    const factor = monthlyRate === 0 ? months : Math.pow(1 + monthlyRate, months)
    const emi = monthlyRate === 0 ? amount / months : amount * monthlyRate * factor / (factor - 1)
    monthlyPayment = emi

    for (let month = 1; month <= months; month += 1) {
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate
      let principal = emi - interest

      if (month === months) {
        principal = balance
      }

      balance = Math.max(0, balance - principal)

      totalInterest += interest
      totalPrincipal += principal
      cumulativeInterest += interest
      cumulativePrincipal += principal

      const payment = principal + interest

      schedule.push({
        month,
        interestPayment: round2(interest),
        principalPayment: round2(principal),
        totalPayment: round2(payment),
        balanceAfter: round2(balance),
        cumulativeInterest: round2(cumulativeInterest),
        cumulativePrincipal: round2(cumulativePrincipal),
      })
    }
  }

  const totalPaid = totalInterest + totalPrincipal

  return {
    schedule,
    summary: {
      totalInterest: round2(totalInterest),
      totalPrincipal: round2(totalPrincipal),
      totalPaid: round2(totalPaid),
      monthlyPayment: round2(monthlyPayment),
      totalMonths: months,
    },
  }
}

const LoanCalculatorTab = () => {
  const { formatCurrency } = useCurrency()
  const [loanAmount, setLoanAmount] = useState(250000)
  const [loanDurationMonths, setLoanDurationMonths] = useState(60)
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanType, setLoanType] = useState('emi')

  const { schedule, summary } = useMemo(
    () =>
      calculateLoanSchedule({
        amount: Number(loanAmount) || 0,
        months: Math.max(1, Math.round(Number(loanDurationMonths) || 0)),
        annualRate: Number(interestRate) || 0,
        loanType,
      }),
    [loanAmount, loanDurationMonths, interestRate, loanType]
  )

  const chartData = useMemo(
    () =>
      schedule.map((entry) => ({
        month: entry.month,
        interestPayment: entry.interestPayment,
        principalPayment: entry.principalPayment,
        totalPayment: entry.totalPayment,
      })),
    [schedule]
  )

  const handleExportExcel = useCallback(() => {
    if (!schedule.length) {
      toast.error('Nothing to export yet - enter loan details first.')
      return
    }

    try {
      const workbook = XLSX.utils.book_new()

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Loan Summary'],
        [],
        ['Loan amount', Number(loanAmount)],
        ['Loan duration (months)', Math.round(Number(loanDurationMonths) || 0)],
        ['Interest rate (p.a.)', `${Number(interestRate) || 0}%`],
        ['Loan type', loanType === 'emi' ? 'EMI (amortized)' : 'Interest Only'],
        ['Standard monthly payment', summary.monthlyPayment],
        ['Total principal paid', summary.totalPrincipal],
        ['Total interest paid', summary.totalInterest],
        ['Total cost of loan', summary.totalPaid],
      ])
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      const scheduleSheet = XLSX.utils.json_to_sheet(
        schedule.map((entry) => ({
          Month: entry.month,
          TotalPayment: entry.totalPayment,
          PrincipalComponent: entry.principalPayment,
          InterestComponent: entry.interestPayment,
          RemainingBalance: entry.balanceAfter,
          CumulativePrincipal: entry.cumulativePrincipal,
          CumulativeInterest: entry.cumulativeInterest,
        }))
      )
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule')

      const chartSheet = XLSX.utils.json_to_sheet(
        chartData.map((entry) => ({
          Month: entry.month,
          Principal: entry.principalPayment,
          Interest: entry.interestPayment,
          Total: entry.totalPayment,
        }))
      )
      XLSX.utils.book_append_sheet(workbook, chartSheet, 'ChartData')

      XLSX.writeFile(workbook, `loan-calculator-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Loan schedule exported to Excel')
    } catch (error) {
      console.error('Loan calculator export error:', error)
      toast.error('Failed to export loan details')
    }
  }, [schedule, chartData, loanAmount, loanDurationMonths, interestRate, loanType, summary])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Loan Cash Flow Planner</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Model monthly repayments, interest exposure, and outstanding balance over the life of a loan.
          </p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={handleExportExcel} title="Download schedule and chart data">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Loan amount
            <input
              type="number"
              min={0}
              step="100"
              value={loanAmount}
              onChange={(event) => setLoanAmount(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Loan duration (months)
            <input
              type="number"
              min={1}
              step="1"
              value={loanDurationMonths}
              onChange={(event) => setLoanDurationMonths(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Interest rate (per annum %)
            <input
              type="number"
              min={0}
              step="0.1"
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
            Loan type
            <select
              value={loanType}
              onChange={(event) => setLoanType(event.target.value)}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="emi">EMI (amortized)</option>
              <option value="interest_only">Interest Only (principal at maturity)</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Standard Payment</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {summary.monthlyPayment ? formatCurrency(summary.monthlyPayment) : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loanType === 'interest_only' ? 'Monthly interest outflow' : 'Fixed monthly instalment'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Interest</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalInterest)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Aggregate cost of borrowing</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Paid</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalPaid)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Principal + interest over loan life</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Term Length</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {summary.totalMonths} months
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round((summary.totalMonths / 12 + Number.EPSILON) * 10) / 10} years
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monthly Cash Flow</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Track how each payment splits between interest and principal over time.
        </p>
        <div className="mt-4 h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b22" />
                <XAxis dataKey="month" tickFormatter={(value) => `M${value}`} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(value) => `Month ${value}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1f2937', color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="principalPayment" name="Principal" stroke="#2563eb" fill="url(#principalGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="interestPayment" name="Interest" stroke="#f97316" fill="url(#interestGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Enter loan details to visualise payments.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payment Schedule</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Detailed breakdown of every cash flow. Export to Excel for further modelling.
        </p>
        <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800/70">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Principal</th>
                <th className="px-4 py-2">Interest</th>
                <th className="px-4 py-2">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schedule.map((entry) => (
                <tr key={entry.month} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-2 font-medium">M{entry.month}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.totalPayment)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.principalPayment)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.interestPayment)}</td>
                  <td className="px-4 py-2">{formatCurrency(entry.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {schedule.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No payments calculated yet. Enter loan details to generate the schedule.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanCalculatorTab
