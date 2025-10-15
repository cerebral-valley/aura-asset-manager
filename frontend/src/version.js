// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.203',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-complete-fix',
  description: 'COMPLETE FIX: Asset Map edges rendering + OKLCH export workaround for PNG/PDF'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

