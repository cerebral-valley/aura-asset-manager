// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.144',
  buildDate: '2025-01-13',
  deploymentId: 'target-selection-complete',
  description: 'COMPLETED: Target page asset selection working perfectly. Reverted to secure CORS configuration. Payload reshaping fix successful.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}