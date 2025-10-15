// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.197',
  buildDate: '2025-10-15',
  deploymentId: 'asset-map-enhancements',
  description: 'ENHANCEMENT: Asset Map visualization improvements - Visible connecting lines in dark mode, working PNG/PDF export, fullscreen mode, visible controls in dark mode'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

