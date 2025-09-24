// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.157',
  buildDate: '2024-12-24',
  deploymentId: 'debug-put-network-failures',
  description: 'Added detailed debug logging for PUT requests to diagnose network failures causing checkbox selection issues.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}