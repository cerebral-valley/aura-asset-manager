// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.216',
  buildDate: '2025-10-17',
  deploymentId: 'asset-map-fix-react-flow-v12-api',
  description: 'FIX: Update to React Flow v12 API - getViewportForBounds returns object {x,y,zoom} not array'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
