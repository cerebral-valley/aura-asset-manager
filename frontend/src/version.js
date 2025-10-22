// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.11',
  buildDate: '2025-10-21',
  deploymentId: 'fire-number-tool',
  description: 'Add FIRE number planner, highlight hourly worth, and extend tools navigation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
