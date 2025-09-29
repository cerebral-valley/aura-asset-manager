// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.145',
  buildDate: '2025-01-28',
  deploymentId: 'goals-api-fix',
  description: 'Fixed Goals API HTTP/HTTPS and trailing slash issues for CSP compliance'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
