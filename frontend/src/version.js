// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.148',
  buildDate: '2025-01-04',
  deploymentId: 'https-api-fix',
  description: 'Fixed API base URL to use HTTPS instead of HTTP for production deployment compatibility'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}