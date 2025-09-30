// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.145',
  buildDate: '2025-09-30',
  deploymentId: 'asset-selection-checkbox',
  description: 'Added asset selection checkbox to Assets table with optimistic updates and race condition prevention'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

