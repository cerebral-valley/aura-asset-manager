// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.172',
  buildDate: '2024-12-28',
  deploymentId: 'asset-selection-fix',
  description: 'Fixed asset selection request payload structure to match backend schema'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}