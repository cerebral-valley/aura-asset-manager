// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.104',
  buildDate: '2025-09-16',
  deploymentId: 'complete-tanstack-query-migration',
  description: 'Complete TanStack Query migration with all missing features: abort signals, cross-tab sync, dashboard invalidation, cache strategy, prefetch, session gating, reduced logging'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}