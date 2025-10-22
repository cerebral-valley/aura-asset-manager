import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { Button } from '../ui/button'
import { Download, Plus } from 'lucide-react'
import DEFAULT_VOL from '@/tools/defaultVol'
import calcVar from '@/utils/varLite'
import { useCurrency } from '@/hooks/useCurrency'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { queryKeys } from '@/lib/queryKeys'
import { assetsService } from '@/services/assets'
import { transactionsService } from '@/services/transactions'
import { useAuth } from '@/hooks/useAuth'
import { buildPortfolioBuckets } from '@/utils/portfolioAllocation'

const sigmaLookup = DEFAULT_VOL.reduce((acc, row) => {
  acc[row.label.toLowerCase()] = row.sigma
  return acc
}, {})

const sigmaAliases = [
  { test: /residential/, target: 're residential' },
  { test: /commercial/, target: 're commercial (core)' },
  { test: /industrial/, target: 're industrial' },
  { test: /agricultural/, target: 're agriculture' },
  { test: /real\s?estate/, target: 're commercial (core)' },
  { test: /bond/, target: 'ig corp bonds' },
  { test: /govt/, target: 'govt bonds' },
  { test: /cash|fd/, target: 'bank fd / cash' },
  { test: /mutual|fund/, target: 'mf balanced' },
  { test: /equities|stock/, target: 'global equities' },
  { test: /crypto|bitcoin/, target: 'crypto' },
  { test: /gold/, target: 'gold' },
]

const resolveSigma = (label) => {
  if (!label) return 0.1
  const direct = sigmaLookup[label.toLowerCase()]
  if (typeof direct === 'number') return direct

  const alias = sigmaAliases.find(({ test }) => test.test(label.toLowerCase()))
  if (alias) {
    const aliasSigma = sigmaLookup[alias.target]
    if (aliasSigma) return aliasSigma
  }
  return 0.1
}

const gaussian = () => {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

const buildPortfolioRows = (assets, transactions) => {
  const { rows, total } = buildPortfolioBuckets(assets, transactions)
  if (total === 0) {
    return { rows: [], total: 0 }
  }

  return {
    rows: rows.map((row, index) => ({
      name: row.type,
      type: row.type,
      weight: row.weight,
      sigma: resolveSigma(row.type),
      __index: index,
    })),
    total,
  }
}

const DEFAULT_PORT_VALUE = 1_000_000
const LOCAL_STORAGE_KEY = 'varLiteDraft'

const horizonOptions = [
  { label: 'Day', value: 1 },
  { label: 'Week (5d)', value: 5 },
  { label: 'Month (21d)', value: 21 },
  { label: 'Quarter (63d)', value: 63 },
  { label: 'Year (252d)', value: 252 },
  { label: 'Custom', value: 'custom' },
]

const confOptions = [
  { label: '95%', value: 0.95 },
  { label: '99%', value: 0.99 },
]

const initialAssets = DEFAULT_VOL.slice(0, 5).map((row, index, arr) => ({
  name: row.label,
  type: row.label,
  weight: Number((100 / arr.length).toFixed(2)),
  sigma: row.sigma,
}))

const useVarLiteStore = create(
  persist(
    (set) => ({
      assets: initialAssets,
      horizon: 1,
      customDays: 10,
      confLvl: 0.95,
      riskApp: 8,
      portValue: DEFAULT_PORT_VALUE,
      setAssets: (assets) => set({ assets }),
      setHorizon: (horizon) => set({ horizon }),
      setCustomDays: (days) => set({ customDays: Math.max(1, days) }),
      setConfLvl: (confLvl) => set({ confLvl }),
      setRiskApp: (riskApp) => set({ riskApp }),
      setPortValue: (portValue) => set({ portValue }),
    }),
    { name: LOCAL_STORAGE_KEY },
  ),
)

const sanitizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const ensureWeightsSum = (assets) => assets.reduce((sum, row) => sum + (Number(row.weight) || 0), 0)

const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) return '0.00%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const generateHeatmapData = (assets, horizonDays) => {
  const dailySigmas = assets.map((asset) => ({
    weight: (Number(asset.weight) || 0) / 100,
    sigmaDaily: (Number(asset.sigma) || 0) / Math.sqrt(252),
  }))

  const windows = Math.max(1, Math.floor(252 / Math.max(1, horizonDays)))
  const samples = []

  for (let w = 1; w <= windows; w += 1) {
    let cumulative = 0

    for (let day = 0; day < horizonDays; day += 1) {
      let dayReturn = 0
      dailySigmas.forEach(({ weight, sigmaDaily }) => {
        dayReturn += weight * sigmaDaily * gaussian()
      })
      cumulative += dayReturn
    }

    samples.push({ window: w, return: cumulative * 100 })
  }

  const returns = samples.map((sample) => sample.return)
  const min = returns.length ? Math.min(...returns) : 0
  const max = returns.length ? Math.max(...returns) : 0
  const mean = returns.length ? returns.reduce((sum, value) => sum + value, 0) / returns.length : 0

  return {
    samples,
    stats: {
      min,
      max,
      mean,
      simulations: samples.length,
    },
  }
}

const generateHistogramData = (sigmaH, buckets = 20, simulations = 500) => {
  const returns = Array.from({ length: simulations }, () => gaussian() * sigmaH * 100)
  const min = Math.min(...returns)
  const max = Math.max(...returns)
  const binSize = (max - min) / buckets || 1

  const data = new Array(buckets).fill(0).map((_, index) => ({
    bucket: min + index * binSize,
    count: 0,
  }))

  returns.forEach((value) => {
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor((value - min) / binSize)))
    data[idx].count += 1
  })

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length || 0

  return {
    bins: data.map((row) => ({ bucket: Number(row.bucket.toFixed(2)), count: row.count })),
    stats: {
      min,
      max,
      mean,
      simulations,
    },
  }
}

const generatePieData = (assets) =>
  assets
    .filter((asset) => (Number(asset.weight) || 0) > 0)
    .map((asset) => ({
      name: asset.name || asset.type || 'Asset',
      value: Number(asset.weight) || 0,
    }))

const importFromWorkbook = (file, onLoad) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(event.target.result, { type: 'array' })
      const [sheetName] = workbook.SheetNames
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      const mapped = rows
        .map((row) => ({
          name: row.Name || row.name || 'Asset',
          type: row.Type || row.type || 'Custom',
          weight: sanitizeNumber(row.Weight ?? row.weight, 0),
          sigma: sanitizeNumber(row.Sigma ?? row.sigma, 0),
        }))
        .filter((row) => row.weight >= 0 && row.sigma >= 0)

      if (mapped.length === 0) {
        toast.error('No valid rows found in spreadsheet')
        return
      }

      onLoad(mapped)
      toast.success('Imported allocation from Excel')
    } catch (error) {
      console.error('VarLite import error:', error)
      toast.error('Failed to import spreadsheet')
    }
  }
  reader.readAsArrayBuffer(file)
}

const exportToWorkbook = (state) => {
  try {
    const workbook = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['Var-Lite Stress Test Snapshot'],
      [],
      ['Confidence Level', state.confLvl],
      ['Horizon Days', state.horizon === 'custom' ? state.customDays : state.horizon],
      ['Portfolio Value', state.portValue],
      ['Risk Appetite %', state.riskApp],
    ])
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    const assetsSheet = XLSX.utils.json_to_sheet(
      state.assets.map((asset) => ({
        Name: asset.name,
        Type: asset.type,
        Weight: asset.weight,
        Sigma: asset.sigma,
      })),
    )
    XLSX.utils.book_append_sheet(workbook, assetsSheet, 'Assets')

    XLSX.writeFile(workbook, `var-lite-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Exported Var-Lite configuration')
  } catch (error) {
    console.error('VarLite export error:', error)
    toast.error('Failed to export spreadsheet')
  }
}

const VarLiteStressTestTab = () => {
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const {
    data: portfolioAssets = [],
    isLoading: assetsLoading,
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  })
  const {
    data: portfolioTransactions = [],
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: ({ signal }) => transactionsService.getTransactions({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  })
  const {
    assets,
    horizon,
    customDays,
    confLvl,
    riskApp,
    portValue,
    setAssets,
    setHorizon,
    setCustomDays,
    setConfLvl,
    setRiskApp,
    setPortValue,
  } = useVarLiteStore()
  const [editingAssets, setEditingAssets] = useState(assets)
  const { formatCurrency } = useCurrency()
  const loadingPortfolio = assetsLoading || transactionsLoading

  useEffect(() => {
    setEditingAssets(assets)
  }, [assets])

  useEffect(() => {
    setAssets(editingAssets)
  }, [editingAssets, setAssets])

  const horizonDays = horizon === 'custom' ? Math.max(1, sanitizeNumber(customDays, 1)) : horizon
  const weightSum = useMemo(() => ensureWeightsSum(editingAssets), [editingAssets])

  const sigmaDaily = useMemo(
    () =>
      Math.sqrt(
        editingAssets.reduce((sum, asset) => {
          const weight = (sanitizeNumber(asset.weight) || 0) / 100
          const sigma = sanitizeNumber(asset.sigma) || 0
          return sum + weight ** 2 * sigma ** 2
        }, 0),
      ) / Math.sqrt(252),
    [editingAssets],
  )

  const varResult = useMemo(
    () =>
      calcVar({
        assets: editingAssets,
        horizonDays,
        confLvl,
        portValue,
      }),
    [editingAssets, horizonDays, confLvl, portValue],
  )

  const sigmaH = sigmaDaily * Math.sqrt(horizonDays)
  const heatmapResult = useMemo(() => (horizonDays <= 5 ? generateHeatmapData(editingAssets, horizonDays) : null), [
    editingAssets,
    horizonDays,
  ])
  const histogramResult = useMemo(() => (horizonDays > 5 ? generateHistogramData(sigmaH) : null), [sigmaH, horizonDays])
  const heatmapData = heatmapResult?.samples ?? []
  const histogramData = histogramResult?.bins ?? []
  const distributionStats = heatmapResult?.stats ?? histogramResult?.stats ?? {
    min: 0,
    max: 0,
    mean: 0,
    simulations: 0,
  }
  const pieData = useMemo(() => generatePieData(editingAssets), [editingAssets])
  const weightTiles = useMemo(() => {
    const maxWeight = Math.max(...editingAssets.map((row) => Number(row.weight) || 0), 0)
    return editingAssets
      .map((row, index) => {
        const weight = Number(row.weight) || 0
        return {
          key: `${row.name || row.type || index}-${index}`,
          name: row.name || row.type || `Asset ${index + 1}`,
          weight,
          intensity: maxWeight > 0 ? weight / maxWeight : 0,
        }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [editingAssets])
  const simulationLabel = horizonDays <= 5 ? 'Rolling windows analysed' : 'Monte Carlo simulations'
  const simulationCount = distributionStats.simulations
  const tailProbability = Number(((1 - confLvl) * 100).toFixed(1))
  const worstReturn = distributionStats.min
  const bestReturn = distributionStats.max
  const averageReturn = distributionStats.mean

  const breach = varResult.varPercent > riskApp
  const horizonLabel = horizon === 'custom' ? `${horizonDays}-day` : horizonOptions.find((opt) => opt.value === horizon)?.label

  const handleRowChange = (index, key, value) => {
    setEditingAssets((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row
        if (key === 'sigma') {
          return { ...row, sigma: Math.max(0, Number(value) / 100) }
        }
        if (key === 'weight') {
          return { ...row, weight: Math.max(0, Number(value) || 0) }
        }
        return { ...row, [key]: value }
      }),
    )
  }

  const handleAddRow = () => {
    setEditingAssets((prev) => [
      ...prev,
      {
        name: `Asset ${prev.length + 1}`,
        type: 'Custom',
        weight: 0,
        sigma: 0.1,
      },
    ])
  }

  const handleRemoveRow = (index) => {
    setEditingAssets((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleLoadPortfolio = () => {
    const { rows, total } = buildPortfolioRows(portfolioAssets, portfolioTransactions)
    if (!rows.length || total === 0) {
      toast.info('No portfolio data available to load yet.')
      return
    }

    setEditingAssets(rows)
    setPortValue(Math.round(total))
    toast.success('Loaded current portfolio allocation')
  }

  const handleResetDefault = () => {
    setEditingAssets(initialAssets)
    setPortValue(DEFAULT_PORT_VALUE)
    toast.success('Restored default sample portfolio')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Portfolio Modelling (VaR Lite)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Quickly approximate Value-at-Risk across configurable horizons using a diagonal covariance shortcut.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Confidence Level</label>
          <div className="flex gap-3">
            {confOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="var-conf"
                  value={option.value}
                  checked={confLvl === option.value}
                  onChange={() => setConfLvl(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Horizon</label>
          <select
            value={horizon}
            onChange={(event) => setHorizon(event.target.value === 'custom' ? 'custom' : Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {horizonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {horizon === 'custom' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Custom Days</label>
            <input
              type="number"
              min={1}
              value={customDays}
              onChange={(event) => setCustomDays(Number(event.target.value) || 1)}
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Portfolio Value</label>
          <input
            type="number"
            min={0}
            value={portValue}
            onChange={(event) => setPortValue(Math.max(0, Number(event.target.value) || 0))}
            className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Risk Appetite %</label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={riskApp}
            onChange={(event) => setRiskApp(Math.max(0, Number(event.target.value) || 0))}
            className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Σ (annual volatility) captures the typical percentage swing for an asset class over a year. Higher values imply more
          uncertainty in short-term returns, while lower values point to steadier behaviour. A {confOptions.find((opt) => opt.value === confLvl)?.label || `${confLvl * 100}%`} confidence
          level means that in roughly {confLvl * 100}% of occasions you expect losses to stay within the VaR number, leaving only
          about {tailProbability}% of cases where losses might be larger.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Asset Mix &amp; Volatility</h3>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const [file] = event.target.files || []
                if (file) {
                  importFromWorkbook(file, setEditingAssets)
                  event.target.value = ''
                }
              }}
            />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Download className="h-4 w-4" />
              Import .xlsx
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => exportToWorkbook({ assets: editingAssets, horizon, customDays, confLvl, riskApp, portValue })}
            >
              <Download className="h-4 w-4" />
              Export .xlsx
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLoadPortfolio}
              disabled={loadingPortfolio}
            >
              Load Portfolio
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleResetDefault}>
              Default Portfolio
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" onClick={handleAddRow}>
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>

        {Math.abs(weightSum - 100) > 0.5 && (
          <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-200">
            Allocation weights must sum to 100%. Currently at {weightSum.toFixed(2)}%.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Weight %</th>
                <th className="px-3 py-2">Σ (annual volatility)</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {editingAssets.map((row, index) => (
                <tr key={index} className="text-slate-700 dark:text-slate-200">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => handleRowChange(index, 'name', event.target.value)}
                      className="w-48 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.type}
                      onChange={(event) => handleRowChange(index, 'type', event.target.value)}
                      className="w-40 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.weight}
                      onChange={(event) => handleRowChange(index, 'weight', event.target.value)}
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={Number((row.sigma * 100).toFixed(2))}
                      onChange={(event) => handleRowChange(index, 'sigma', event.target.value)}
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveRow(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">One-{horizonLabel} VaR</h3>
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${breach ? 'bg-red-500/10 text-red-600 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'}`}
            >
              {breach ? 'Risk Appetite Breach' : 'Within Appetite'}
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(varResult.varValue)}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            In everyday terms, there is roughly a {tailProbability}% chance that losses over this {horizonLabel?.toLowerCase()} horizon exceed
            {` ${formatCurrency(varResult.varValue)} (${varResult.varPercent.toFixed(2)}% of the portfolio).`}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Because your comfort line is {riskApp}% this scenario {breach ? 'sits above that limit—consider trimming risk or adding hedges.' : 'remains below that limit, so you are operating inside your stated tolerance.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Allocation Snapshot</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{weightSum.toFixed(2)}% allocated across {editingAssets.length} asset buckets</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {weightTiles.map((tile) => {
              const intensity = 0.15 + tile.intensity * 0.55
              return (
                <div
                  key={tile.key}
                  className="rounded-lg border border-slate-200/40 p-3 text-sm font-medium text-slate-800 dark:border-white/10 dark:text-slate-100"
                  style={{
                    background: `linear-gradient(135deg, rgba(37,99,235,${intensity}) 0%, rgba(37,99,235,0.12) 100%)`,
                  }}
                >
                  <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">{tile.name}</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">{tile.weight.toFixed(2)}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {horizonDays <= 5 ? 'Heatmap of Simulated Windows' : 'Distribution of Horizon Returns'}
          </h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              {horizonDays <= 5 ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                  <XAxis dataKey="window" tickLine={false} />
                  <YAxis dataKey="return" tickFormatter={(value) => `${value.toFixed(2)}%`} width={80} />
                  <ZAxis dataKey="return" />
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} labelFormatter={(value) => `Window ${value}`} />
                  <Scatter data={heatmapData} fill="#2563eb">
                    {heatmapData.map((entry, index) => (
                      <Cell key={index} fill={entry.return >= 0 ? '#10b981' : '#f87171'} fillOpacity={Math.min(0.9, Math.abs(entry.return) / 5)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : (
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293722" />
                  <XAxis dataKey="bucket" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}`} labelFormatter={(value) => `${value.toFixed(2)}%`} />
                  <ReferenceLine x={-varResult.varPercent} stroke="#ef4444" strokeDasharray="4 4" label="VaR" />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inputs &amp; Diagnostics</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <span className="font-medium text-slate-700 dark:text-slate-200">Daily Σ (portfolio):</span>{' '}
              {(sigmaDaily * 100).toFixed(2)}%
            </li>
            <li>
              <span className="font-medium text-slate-700 dark:text-slate-200">Horizon Σ:</span>{' '}
              {(sigmaH * 100).toFixed(2)}%
            </li>
            <li>
              <span className="font-medium text-slate-700 dark:text-slate-200">{simulationLabel}:</span>{' '}
              {simulationCount}
            </li>
            <li>
              <span className="font-medium text-slate-700 dark:text-slate-200">Mean horizon return:</span>{' '}
              {formatSignedPercent(averageReturn)} (min {formatSignedPercent(worstReturn)}, max {formatSignedPercent(bestReturn)})
            </li>
            <li>
              <span className="font-medium text-slate-700 dark:text-slate-200">Confidence level:</span>{' '}
              {confOptions.find((opt) => opt.value === confLvl)?.label}
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interpreting the Stress Test</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This template summarises the current scenario so you can explain it to stakeholders or capture notes:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Portfolio snapshot:</span>{' '}
            Portfolio value of {formatCurrency(portValue)} spread across {editingAssets.length} buckets. The heaviest slice is{' '}
            {weightTiles[0]?.name || 'n/a'} at {weightTiles[0]?.weight.toFixed(1) || '0.0'}% of the mix.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Risk settings:</span>{' '}
            Confidence level {confOptions.find((opt) => opt.value === confLvl)?.label || ''} means only about {tailProbability}% of
            scenarios are expected to breach the loss limit over a {horizonLabel} horizon. Your declared appetite is {riskApp}%.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Volatility assumptions:</span>{' '}
            Daily Σ works out to {(sigmaDaily * 100).toFixed(2)}%, which compounds to {(sigmaH * 100).toFixed(2)}% across the horizon. Adjust
            the inputs above if you rely on different volatility estimates.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Simulated outcomes:</span>{' '}
            {horizonDays <= 5
              ? `Ran ${simulationCount} rolling ${horizonDays}-day windows using random daily shocks; the heat-map shows how those windows behaved.`
              : `Ran ${simulationCount} Monte Carlo paths for the ${horizonLabel} horizon; the histogram summarises their spread and the red line marks the VaR cut-off.`}
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Distribution insight:</span>{' '}
            Simulations suggest the largest loss was about {formatSignedPercent(worstReturn)}, the best gain was {formatSignedPercent(bestReturn)},
            and the average move was {formatSignedPercent(averageReturn)}.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-100">VaR conclusion:</span>{' '}
            There is roughly a {tailProbability}% chance of losing more than {formatCurrency(varResult.varValue)} ({varResult.varPercent.toFixed(2)}%) over a
            {` ${horizonLabel?.toLowerCase()} period.`} That sits {breach ? 'above' : 'below'} your {riskApp}% appetite, so {breach ? 'consider trimming exposure or adding protection.' : 'the mix remains inside your comfort zone.'}
          </li>
        </ul>
        <p className="mt-4 text-xs italic text-slate-500 dark:text-slate-400">*For indicative purposes only.</p>
      </div>
    </div>
  )
}

export default VarLiteStressTestTab
