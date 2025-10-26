// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.236',
  buildDate: '2025-10-26',
  deploymentId: 'asset-matrix-anomaly-detection',
  description: 'Asset Matrix with intelligent anomaly detection: Validates allocation rules for liquid/illiquid assets, highlights misallocated assets with severity indicators, provides detailed writeups with recommendations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
