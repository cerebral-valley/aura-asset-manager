// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.106',
  buildDate: '2025-09-16',
  deploymentId: 'complete-tanstack-query-performance-optimization',
  description: 'Complete TanStack Query performance optimization: optimized axios interceptor, increased staleTime to 30min, fixed dashboard service call in prefetch. All missing migration pieces now implemented for 70% database load reduction.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}