// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.238',
  buildDate: '2025-11-15',
  deploymentId: 'dashboard-slashed-zero',
  description: 'Unifies dashboard typography so every metric, chart label, and ticker uses the slashed-zero variant for consistent numerals'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
