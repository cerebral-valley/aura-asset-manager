// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.160',
  buildDate: '2025-10-08',
  deploymentId: 'custom-goals-ui-improvements',
  description: 'Enhanced Custom Goals UX: Added clear labels to allocation header (Amount Allocated vs Available), added remaining amount display for each goal, and fixed Add New Goal button to follow theme colors instead of hardcoded pink.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

