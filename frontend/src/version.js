// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.159',
  buildDate: '2025-10-08',
  deploymentId: 'custom-goals-allocation-display',
  description: 'Enhanced Custom Goals header to display Amount Allocated and Available for Allocation amounts. Removed redundant selected assets total text from form for cleaner UI.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

