// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.242',
  buildDate: '2025-11-15',
  deploymentId: 'referral-gating-login',
  description: 'Enforces referral-code gating across assets/insurance, adds profile credit score data storage, and locks email sign-ups to keep Aura invite-only'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
