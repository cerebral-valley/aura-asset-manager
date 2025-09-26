// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.171',
  buildDate: '2024-12-28',
  deploymentId: 'cors-fix',
  description: 'Enhanced CORS configuration for asset selections endpoint'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}