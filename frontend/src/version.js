// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.156',
  buildDate: '2024-12-24',
  deploymentId: 'refactor-asset-selection-architecture',
  description: 'Refactored asset selection to use asset table columns instead of separate user_asset_selections table. Added liquid_assets and is_selected columns to assets table for better performance and simpler data model.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}