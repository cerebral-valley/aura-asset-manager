// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.127',
  buildDate: '2024-12-19', 
  deploymentId: 'asset-matrix-charts',
  description: 'Beautiful matrix chart visualizations showing asset distribution by type and time horizon for both liquid and illiquid assets with hover tooltips and theme-adaptable design'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}