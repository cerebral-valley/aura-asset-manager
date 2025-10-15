// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.202',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-edges-fix-handles',
  description: 'FIX: Add Handle components (target/source) to CustomNode to restore edge rendering anchor points'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

