// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.102',
  commitHash: '870f84b',
  buildDate: '2025-09-16',
  deploymentId: 'version-tracking-system',
  description: 'Implement comprehensive version tracking system with Dashboard display'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version} (${VERSION_INFO.commitHash})`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}