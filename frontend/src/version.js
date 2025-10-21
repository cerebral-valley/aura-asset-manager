// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.0',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-comprehensive-insights',
  description: 'Fix chart tooltip contrast + Add comprehensive dashboard sections: Net Worth Goal, Profile Snapshot, Recent Transactions with Magic UI components'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
