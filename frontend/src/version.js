// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.141',
  buildDate: '2024-12-29',
  deploymentId: 'annuities-comprehensive-fix',
  description: 'Fixed annuities functionality - all CRUD operations working, comprehensive testing completed'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
