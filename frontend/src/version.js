// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.134',
  buildDate: '2025-09-23',
  deploymentId: 'target-api-https-fix',
  description: 'Fix CSP violation by enforcing HTTPS in API configuration'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}