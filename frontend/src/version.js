// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.198',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-critical-fixes',
  description: 'CRITICAL FIX: Asset Map edge rendering (missing dependency array) + OKLCH color export compatibility for PNG/PDF'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

