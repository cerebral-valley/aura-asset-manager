// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.142',
  buildDate: '2025-09-30',
  deploymentId: 'fix-annuity-references',
  description: 'Fixed remaining annuity references in Assets, UserSettings, and Transactions pages'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
