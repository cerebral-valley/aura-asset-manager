// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.161',
  buildDate: '2025-10-11',
  deploymentId: 'ui-improvements-goals-dashboard-guide',
  description: 'Multiple UI improvements: Fixed Goals page asset type display to show user-friendly names instead of underscores, added comprehensive Goals page documentation to User Guide, and added total assets count and value display to Dashboard Portfolio Composition chart matching Insurance breakdown format.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

