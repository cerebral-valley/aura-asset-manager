// Shared asset purpose classification used across the application
// This is the single source of truth for asset purpose categorization

export const assetPurposeOptions = [
  { value: 'hyper_growth', label: 'Hyper Growth' },
  { value: 'growth', label: 'Growth' },
  { value: 'financial_security', label: 'Financial Security' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'childrens_education', label: "Children's Education" },
  { value: 'retirement_fund', label: 'Retirement Fund' },
  { value: 'speculation', label: 'Speculation' }
]

// Get all asset purpose values as a flat array
export const getAllAssetPurposes = () => {
  return assetPurposeOptions.map(option => option.value)
}

// Get display label for asset purpose value
export const getAssetPurposeLabel = (assetPurposeValue) => {
  if (!assetPurposeValue) return 'Unspecified'
  
  const purpose = assetPurposeOptions.find(option => option.value === assetPurposeValue)
  if (purpose) {
    return purpose.label
  }
  
  // Fallback: convert underscores to spaces and capitalize
  return assetPurposeValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Get unique asset purposes from asset data
export const getUniqueAssetPurposes = (assets) => {
  const purposes = [...new Set(assets.map(asset => asset.asset_purpose || 'unspecified').filter(Boolean))]
  return purposes.sort()
}