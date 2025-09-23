// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.140',
  buildDate: '2025-01-13',
  deploymentId: 'api-connectivity-fix',
  description: 'Fixed API connectivity issues by creating .env.production file with correct HTTPS endpoints. Resolved CORS and CSP violations preventing PUT/POST requests to targets endpoints.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}