// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.141',
  buildDate: '2025-09-30',
  deploymentId: 'deprecate-annuities-feature',
  description: 'Removed annuities feature - deprecated all annuity-related code, routes, and database fields'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
