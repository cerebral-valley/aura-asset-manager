// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.12',
  buildDate: '2025-10-20',
  deploymentId: 'flow-theme-alignment',
  description: 'Align asset and insurance map theming, stabilize fullscreen, and clean OKLCH export errors'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
