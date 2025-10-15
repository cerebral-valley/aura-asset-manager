// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.201',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-edge-rendering-debug',
  description: 'DEBUG: Remove length check from useEffect + add console logging to diagnose edge rendering issue'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

