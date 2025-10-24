// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.18',
  buildDate: '2025-10-23',
  deploymentId: 'fire-cashflow-outlook',
  description: 'Project FIRE capital with nominal vs real decays and corrected expense trajectory'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
