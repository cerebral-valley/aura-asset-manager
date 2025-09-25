// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.168',
  buildDate: '2025-09-26',
  deploymentId: 'asset-selection-save-button-rewrite',
  description: 'Completely rewrote asset selection logic with save button - checkboxes now work locally with pending changes, save button sends only changed selections to DB, page refreshes after save'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}