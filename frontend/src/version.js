// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.139',
  buildDate: '2024-12-21',
  deploymentId: 'debug-liquid-assets',
  description: 'Added debug logging to liquid assets endpoint to trace the is_liquid error'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}