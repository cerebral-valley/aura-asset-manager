// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.247',
  buildDate: '2025-01-06',
  deploymentId: 'login-refinements',
  description: 'Removed stats cards, updated Nijat Garavey to Professor, replaced "Aura v2.0" badge with "Aura Asset Manager"'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
