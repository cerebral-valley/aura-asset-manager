// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.1',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-querykeys-fix',
  description: 'Fix Dashboard crash - use queryKeys.user.profile() instead of queryKeys.profile.detail()'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
