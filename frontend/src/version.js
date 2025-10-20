// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.7',
  buildDate: '2025-10-20',
  deploymentId: 'debug-insurance-data-structure',
  description: 'DEBUG: Add console logging to inspect insurance hierarchy data structure'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
