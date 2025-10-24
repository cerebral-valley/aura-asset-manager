// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.20',
  buildDate: '2025-10-24',
  deploymentId: 'user-guide-pdf-dom-export',
  description: 'Generate User Guide PDF from live DOM content to avoid styling incompatibilities'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
