// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.212',
  buildDate: '2025-10-16',
  deploymentId: 'asset-map-edges-text-fix',
  description: 'FIX: Show connecting edges (SVG layer) and full text (remove truncate) in PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
