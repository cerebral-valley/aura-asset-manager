// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.199',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-infinite-loop-fix',
  description: 'EMERGENCY FIX: React Error #185 infinite loop (removed setNodes/setEdges from useEffect deps)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

