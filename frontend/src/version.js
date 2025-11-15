// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.245',
  buildDate: '2025-11-15',
  deploymentId: 'login-hero-refresh',
  description: 'Reimagines the landing/login experience with a cinematic hero, new copy, and refreshed card UI'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
