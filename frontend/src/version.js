// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.186',
  buildDate: '2025-01-14',
  deploymentId: 'liquidity-fix-filters-goals-insurance',
  description: 'Fix liquidity status bug in Goals, add columns and filters, fix Insurance page naming conflict that caused blank page'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

