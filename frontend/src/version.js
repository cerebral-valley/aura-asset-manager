// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.154',
  buildDate: '2024-12-08',
  deploymentId: 'standardize-annuity-imports',
  description: 'Standardized annuity service to use named exports - consistent with all other services'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}