// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.107',
  buildDate: '2025-09-16',
  deploymentId: 'release-notes-prefetch-enhancement',
  description: 'Add comprehensive release notes to User Guide with full changelog from v0.100-v0.107. Enhanced prefetch coverage to include annuities summary for instant loading. Identified remaining manual invalidation cleanup needed.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}