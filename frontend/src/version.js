// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.140',
  buildDate: '2025-09-30',
  deploymentId: 'repository-revert',
  description: 'Repository reverted to clean state at v0.139 baseline'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
