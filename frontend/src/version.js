// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.227',
  buildDate: '2025-01-09',
  deploymentId: 'dashboard-fixes',
  description: 'Fixed growth potential inversion, combined insurance coverage cards, fixed font consistency, improved insurance coverage detection with TanStack Query integration'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
