// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.7',
  buildDate: '2025-10-21',
  deploymentId: 'var-lite-stress-test',
  description: 'Add VaR stress testing with portfolio loader, property planners, and move asset matrix into tools'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
