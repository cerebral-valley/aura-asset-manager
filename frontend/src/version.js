// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.12',
  buildDate: '2025-10-21',
  deploymentId: 'railway-redeploy',
  description: 'Deployment bump for Railway refresh'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
