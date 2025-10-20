// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.9',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-active-pdf-alignment',
  description: 'Filter to active insurance policies and align PDF export with on-screen layout'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
