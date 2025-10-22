import { getAssetTypeLabel } from '@/constants/assetTypes'

const getLatestTransactionValue = (asset, transactions, key = 'current_value') => {
  const relatedTx = transactions.filter((tx) => tx.asset_id === asset.id)
  if (relatedTx.length === 0) {
    return key === 'current_value'
      ? Number(asset.current_value) || Number(asset.initial_value) || 0
      : Number(asset.initial_value) || 0
  }

  const sorted = relatedTx.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))

  if (key === 'current_value') {
    const marketUpdate = sorted.find((tx) => tx.transaction_type === 'update_market_value' && tx.amount != null)
    if (marketUpdate) return Number(marketUpdate.amount) || 0

    const currentValueTx = sorted.find((tx) => tx.current_value != null && tx.current_value > 0)
    if (currentValueTx) return Number(currentValueTx.current_value) || 0
  }

  return key === 'current_value'
    ? Number(asset.current_value) || Number(asset.initial_value) || 0
    : Number(asset.initial_value) || 0
}

export const buildPortfolioBuckets = (assets = [], transactions = []) => {
  const buckets = {}

  assets.forEach((asset) => {
    const presentValue = getLatestTransactionValue(asset, transactions, 'current_value')
    if (!presentValue || presentValue <= 0) return

    const typeLabel = getAssetTypeLabel(asset.asset_type) || asset.asset_type || 'Custom'

    if (!buckets[typeLabel]) {
      buckets[typeLabel] = { total: 0, type: typeLabel }
    }
    buckets[typeLabel].total += presentValue
  })

  const entries = Object.values(buckets)
  const total = entries.reduce((sum, row) => sum + row.total, 0)

  if (total === 0) {
    return { rows: [], total: 0 }
  }

  const rows = entries.map((row) => ({
    type: row.type,
    total: row.total,
    weight: Number(((row.total / total) * 100).toFixed(2)),
  }))

  const weightSum = rows.reduce((sum, row) => sum + row.weight, 0)
  if (Math.abs(weightSum - 100) > 0.5) {
    rows.forEach((row) => {
      row.weight = Number(((row.weight / weightSum) * 100).toFixed(2))
    })
  }

  return { rows, total }
}

export default buildPortfolioBuckets
