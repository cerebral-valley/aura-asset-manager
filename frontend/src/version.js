// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.150',
  buildDate: '2024-12-19',
  deploymentId: 'coding-standards-implementation',
  description: 'Standardized all import paths to @ alias pattern and enforced consistent API URL trailing slash patterns across all services'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
