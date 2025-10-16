// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.213',
  buildDate: '2025-10-16',
  deploymentId: 'asset-map-wrapper-capture',
  description: 'FIX: Capture reactFlowWrapper (parent div) instead of inner elements - simpler and more reliable'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
