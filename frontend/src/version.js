// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.153',
  buildDate: '2024-12-08',
  deploymentId: 'fix-asset-selection-lookup',
  description: 'Fixed UserAssetSelection lookup to use UUID objects directly instead of strings'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}