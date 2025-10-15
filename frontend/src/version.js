// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.193',
  buildDate: '2025-10-15',
  deploymentId: 'asset-map-tools-page',
  description: 'New Tools page with Asset Mapping visualization - hierarchical mind map using React Flow with left-to-right layout showing assets by liquidity, time horizon, purpose, and type'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

