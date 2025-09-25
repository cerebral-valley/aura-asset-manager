// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.169',
  buildDate: '2024-12-26',
  deploymentId: 'fix-liquid-assets-endpoint',
  description: 'Fixed PUT /liquid-assets endpoint to use UserAssetSelection table instead of Asset.is_selected column'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}