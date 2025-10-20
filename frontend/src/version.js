// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.5',
  buildDate: '2025-10-20',
  deploymentId: 'railway-service-retry',
  description: 'RETRY: Another deployment attempt for Railway route ordering fix'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
