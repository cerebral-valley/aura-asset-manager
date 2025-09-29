// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.142',
  buildDate: '2024-09-29',
  deploymentId: 'remove-annuities-feature',
  description: 'Completely removed annuities feature - simplified application by removing all annuity-related components, services, backend endpoints, and navigation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
