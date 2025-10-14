// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.183',
  buildDate: '2025-10-14',
  deploymentId: 'sidebar-layout-fixes',
  description: 'Fix sidebar footer layout in collapsed state, remove horizontal scroll, standardize page titles'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

