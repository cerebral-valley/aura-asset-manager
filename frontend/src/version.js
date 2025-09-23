// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.141',
  buildDate: '2025-01-13',
  deploymentId: 'target-payload-fix',
  description: 'Fixed asset selection payload format - reshaped from array to flat dictionary to match backend schema expectations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}