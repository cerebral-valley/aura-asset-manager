// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.15',
  buildDate: '2025-10-20',
  deploymentId: 'map-color-depth-enhancements',
  description: 'Polish depth-based theming and centering across planning visualisations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
