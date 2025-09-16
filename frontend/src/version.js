// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.107',
  buildDate: '2025-09-16',
  deploymentId: 'complete-tanstack-mutations-cross-tab-sync',
  description: 'Complete TanStack Query mutations with cross-tab broadcasting: Insurance.jsx now uses useMutation with optimistic updates and mutationHelpers broadcasting. Fixed Annuities 12s loading issue with guarded retry logic. Aligned persistence/staleness configs.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}