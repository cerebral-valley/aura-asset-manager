// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.172',
  buildDate: '2025-01-13',
  deploymentId: 'insurance-document-display-fixes',
  description: 'Fix document metadata display issues - correct property names and date formatting'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

