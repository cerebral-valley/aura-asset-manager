// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.136',
  buildDate: '2024-12-28',
  deploymentId: 'matrix-improvements',
  description: 'Fixed asset values in matrix tooltips, improved spacing and text wrapping'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
