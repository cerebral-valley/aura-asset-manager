// Shared time horizon classification used across the application
// This is the single source of truth for time horizon categorization

export const timeHorizonOptions = [
  { value: 'short_term', label: 'Short Term (< 1 year)' },
  { value: 'medium_term', label: 'Medium Term (1-3 years)' },
  { value: 'long_term', label: 'Long Term (> 3 years)' }
]

// Get all time horizon values as a flat array
export const getAllTimeHorizons = () => {
  return timeHorizonOptions.map(option => option.value)
}

// Get display label for time horizon value
export const getTimeHorizonLabel = (timeHorizonValue) => {
  if (!timeHorizonValue) return 'Unspecified'
  
  const horizon = timeHorizonOptions.find(option => option.value === timeHorizonValue)
  if (horizon) {
    return horizon.label
  }
  
  // Fallback: convert underscores to spaces and capitalize
  return timeHorizonValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Get unique time horizons from asset data
export const getUniqueTimeHorizons = (assets) => {
  const horizons = [...new Set(assets.map(asset => asset.time_horizon || 'unspecified').filter(Boolean))]
  return horizons.sort()
}
