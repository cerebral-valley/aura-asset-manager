// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.244',
  buildDate: '2025-11-15',
  deploymentId: 'rollback-v0240',
  description: 'Rolls the platform back to the proven v0.240 baseline to disable the referral code experiment'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
