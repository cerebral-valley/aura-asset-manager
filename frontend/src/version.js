// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.214',
  buildDate: '2025-10-17',
  deploymentId: 'asset-map-bounds-viewport',
  description: 'FIX: Use React Flow getNodesBounds and getViewportForBounds to capture entire map with edges'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
