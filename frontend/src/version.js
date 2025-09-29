// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.140',
  buildDate: '2024-12-29',
  deploymentId: 'annuities-api-fix',
  description: 'Fixed annuities API trailing slash issues causing CORS and HTTPS redirect problems'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
