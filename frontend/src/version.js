// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.232',
  buildDate: '2025-01-09',
  deploymentId: 'insurance-enhancements',
  description: 'Added Disability and Dental insurance types, Coverage to Income ratio column with horizontal bar chart visualization'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
