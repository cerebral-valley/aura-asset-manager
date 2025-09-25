// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.167',
  buildDate: '2025-09-26',
  deploymentId: 'railway-redeploy-trigger',
  description: 'Triggered Railway redeploy to fix CORS and cache invalidation issues'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}