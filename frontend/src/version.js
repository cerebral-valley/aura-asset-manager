// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.160',
  buildDate: '2025-01-26',
  deploymentId: 'backward-compatibility-enhancement',
  description: 'Enhanced backward compatibility: GET/PUT endpoints now support both new column-based model and legacy user_asset_selections table. Ensures smooth migration and prevents data loss.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}