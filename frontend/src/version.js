// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.181',
  buildDate: '2025-10-14',
  deploymentId: 'ui-cleanup-chart-alignment',
  description: 'Remove Test Sentry Error button and fix dashboard chart alignment consistency'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

