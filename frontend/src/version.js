// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.129',
  buildDate: '2024-12-26',
  deploymentId: 'spa-routing-fix-corrected',
  description: 'Fixed SPA routing configuration - removed incorrect /assets route mapping'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}