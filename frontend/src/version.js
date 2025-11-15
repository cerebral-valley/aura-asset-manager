// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.243',
  buildDate: '2025-11-15',
  deploymentId: 'login-hotfix',
  description: 'Hotfixes the login form after referral changes so the invite-only banner renders without runtime errors'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
