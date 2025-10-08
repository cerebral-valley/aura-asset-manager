// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.158',
  buildDate: '2025-10-08',
  deploymentId: 'completion-date-preservation',
  description: 'Goal completion date preservation fix - Backend now preserves original completion dates instead of overwriting with current date. Prevents all completed goals from showing same completion date.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

