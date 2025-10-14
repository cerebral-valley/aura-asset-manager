// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.184',
  buildDate: '2025-01-14',
  deploymentId: 'sidebar-optimization',
  description: 'Reduce sidebar width (14rem), enable word wrapping, fix horizontal scroll, align page titles consistently'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

