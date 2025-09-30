// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.149',
  buildDate: '2024-12-19',
  deploymentId: 'route-pattern-fix',
  description: 'Fixed FastAPI route patterns to handle both slash and no-slash URLs for assets and transactions endpoints'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
