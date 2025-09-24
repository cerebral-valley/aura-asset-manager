// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.159',
  buildDate: '2025-01-26',
  deploymentId: 'asset-selection-architecture-complete',
  description: 'CRITICAL SUCCESS: Asset selection architectural refactor complete! Eliminated user_asset_selections table, moved selection state to asset.is_selected column. Checkbox persistence issue permanently resolved.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}