// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.234',
  buildDate: '2025-10-26',
  deploymentId: 'insurance-ui-enhancements',
  description: '5 Insurance page improvements: Bar chart scaling 5x, policy type capitalization, sidebar theme consistency, tooltip legibility, renewal date highlighting'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
