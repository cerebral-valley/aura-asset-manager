// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.174',
  buildDate: '2024-12-28',
  deploymentId: 'asset-selection-fix-complete',
  description: 'Fixed asset selection sync between tables and improved error handling'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}