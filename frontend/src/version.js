// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.166',
  buildDate: '2025-09-26',
  deploymentId: 'fix-asset-selection-cache-invalidation',
  description: 'Fixed asset selection checkbox snap-back bug by adding cache invalidation to updateAssetSelectionsMutation onSuccess callback.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}