// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.138',
  buildDate: '2024-12-29',
  deploymentId: 'theme-persistence-debug',
  description: 'Fixed theme save synchronization between ThemeSelector and UserSettings components'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
