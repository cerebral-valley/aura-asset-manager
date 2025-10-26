// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.235',
  buildDate: '2025-10-26',
  deploymentId: 'dashboard-card-improvements',
  description: 'Dashboard UI overhaul: Split Insurance Coverage into 2 cards, theme-aware icon colors, enhanced hover animations, tabular numbers with slashed zeros'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
