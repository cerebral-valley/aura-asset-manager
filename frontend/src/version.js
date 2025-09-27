// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.133',
  buildDate: '2024-12-28', 
  deploymentId: 'matrix-charts-critical-fix',
  description: 'Fixed critical undefined .map() error in transaction components preventing matrix chart rendering'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
