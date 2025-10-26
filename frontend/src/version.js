// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.230',
  buildDate: '2025-01-09',
  deploymentId: 'react-hook-order-fix',
  description: 'Fixed React error #310 and undefined React issue - moved all hooks before early returns, added useMemo to imports'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
