// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.164',
  buildDate: '2025-01-26',
  deploymentId: 'fix-target-completion-delay',
  description: 'Fixed target completion delay: Added query invalidation for completed targets in completeTargetMutation to ensure immediate UI updates when targets are marked complete.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}