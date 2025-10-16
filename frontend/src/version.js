// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.211',
  buildDate: '2025-10-16',
  deploymentId: 'asset-map-full-canvas-export',
  description: 'FIX: Capture entire asset map canvas for PDF export (not just viewport), remove PNG option'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
