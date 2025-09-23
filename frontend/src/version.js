// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.136',
  buildDate: '2025-09-23',
  deploymentId: 'fix-edit3-import-error',
  description: 'Fix: Added missing Edit3 icon import to resolve JavaScript error on Target page'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}