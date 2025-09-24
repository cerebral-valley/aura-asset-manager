// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.155',
  buildDate: '2024-09-24',
  deploymentId: 'fix-target-checkbox-eye-button',
  description: 'Fixed asset checkbox persistence issue and added eye button handler for asset details viewing'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}