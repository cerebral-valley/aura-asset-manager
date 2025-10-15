// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.204',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-oklch-export-fixed',
  description: 'FINAL FIX: Force inline RGB styles to override OKLCH CSS variables in PNG/PDF exports'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

