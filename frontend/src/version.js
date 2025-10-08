// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.157',
  buildDate: '2025-10-08',
  deploymentId: 'goals-completion-fix',
  description: 'Goals completion functionality fix - Removed frontend completed_date override to let backend handle completion date automatically. Fixed tick button functionality for marking goals as complete and moving them to Goal Logs section.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

