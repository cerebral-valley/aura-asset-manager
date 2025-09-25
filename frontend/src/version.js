// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.165',
  buildDate: '2025-01-26',
  deploymentId: 'fix-target-completion-invalidation',
  description: 'Fixed target completion query invalidation by invalidating all targets queries instead of individual ones to ensure completed targets appear immediately.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}