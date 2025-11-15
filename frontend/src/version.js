// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.241',
  buildDate: '2025-11-15',
  deploymentId: 'profile-credit-score',
  description: 'Expands the profile financial section with full credit score tracking (FICO/CIBIL/etc.) and persists the data alongside other profile fields'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
