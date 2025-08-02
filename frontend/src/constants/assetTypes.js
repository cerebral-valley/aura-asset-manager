// Shared asset types classification used across the application
// This is the single source of truth for asset categorization

export const assetTypes = {
  'Real Estate': [
    { value: 'real_estate_residential', label: 'Residential' },
    { value: 'real_estate_commercial', label: 'Commercial' },
    { value: 'real_estate_agricultural', label: 'Agricultural' },
    { value: 'real_estate_industrial', label: 'Industrial' }
  ],
  'Financial Instruments': [
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'mutual_funds', label: 'Mutual Funds' },
    { value: 'etf', label: 'ETF' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'cash_in_hand', label: 'Cash in Hand' }
  ],
  'Physical Assets': [
    { value: 'precious_metal_gold', label: 'Gold' },
    { value: 'precious_metal_silver', label: 'Silver' },
    { value: 'precious_metal_platinum', label: 'Platinum' },
    { value: 'jewellery_simple', label: 'Jewellery (without stones)' },
    { value: 'jewellery_precious_stones', label: 'Jewellery (with precious stones)' },
    { value: 'cars', label: 'Cars' },
    { value: 'antiques', label: 'Antiques & Collections' }
  ],
  'Other': [
    { value: 'royalties', label: 'Royalties' },
    { value: 'misc', label: 'Miscellaneous' }
  ]
}

// Create flat list of all asset types for easy lookup
export const getAllAssetTypes = () => {
  const allTypes = [];
  Object.keys(assetTypes).forEach(category => {
    assetTypes[category].forEach(type => {
      allTypes.push({ ...type, category });
    });
  });
  return allTypes;
}

// Get category for a given asset type value
export const getCategoryForAssetType = (assetTypeValue) => {
  for (const [category, types] of Object.entries(assetTypes)) {
    if (types.some(type => type.value === assetTypeValue)) {
      return category;
    }
  }
  return 'Other';
}

// Get display label for asset type value
export const getAssetTypeLabel = (assetTypeValue) => {
  if (!assetTypeValue) return '-';
  
  for (const [category, types] of Object.entries(assetTypes)) {
    const type = types.find(type => type.value === assetTypeValue);
    if (type) {
      return type.label;
    }
  }
  
  // Fallback: convert underscores to spaces and capitalize
  return assetTypeValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Create aggregation categories for dashboard display
export const getAggregationCategories = () => {
  return Object.keys(assetTypes).map(category => ({
    key: category.toLowerCase().replace(/\s+/g, '_'),
    label: category,
    assetTypes: assetTypes[category].map(type => type.value)
  }));
}
