// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.135',
  buildDate: '2024-12-28', 
  deploymentId: 'matrix-asset-purpose-fix',
  description: 'Fixed Matrix Chart x-axis to show Asset Purpose instead of Asset Type for proper strategic classification visualization'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
