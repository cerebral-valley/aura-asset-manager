// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.237',
  buildDate: '2025-11-07',
  deploymentId: 'welcome-onboarding-flow',
  description: 'Adds a guided first-time experience for users without data, updates the beginner guide, and ensures dashboard insights only appear after assets and insurance exist'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
