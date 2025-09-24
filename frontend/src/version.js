// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.161',
  buildDate: '2025-01-26',
  deploymentId: 'checkbox-optimistic-updates',
  description: 'Fixed checkbox rapid toggle issue by implementing optimistic updates in asset selection mutation. UI now updates instantly while backend syncs in background.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}