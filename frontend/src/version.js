// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.144',
  buildDate: '2024-09-30',
  deploymentId: 'goals-feature-ui-phase',
  description: 'Phase 5-6: Added asset selection toggle switches and basic Goals page with Available Amount calculation, Net Worth Goal display, and Custom Goals sections'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
