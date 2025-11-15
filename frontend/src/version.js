// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.240',
  buildDate: '2025-11-15',
  deploymentId: 'font-preference-selector',
  description: 'Adds multi-font preferences synced with Supabase, provides three slashed-zero friendly families, and keeps dashboards consistent via global font data attributes'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
