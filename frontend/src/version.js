// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.163',
  buildDate: '2025-01-26',
  deploymentId: 'simplified-checkbox-persistence',
  description: 'Simplified checkbox persistence: store selections in user_asset_selections table, send changes immediately, fetch on login. Removed complex optimistic updates.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}