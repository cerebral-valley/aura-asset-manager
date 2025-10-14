// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.192',
  buildDate: '2025-01-14',
  deploymentId: 'all-filter-dropdowns',
  description: 'Convert Type, Liquidity, Time Horizon, and Purpose filters to dropdown selects - consistent UX with exact matching for all filters'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

