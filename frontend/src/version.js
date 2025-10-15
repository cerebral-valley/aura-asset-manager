// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.196',
  buildDate: '2025-10-15',
  deploymentId: 'fix-react-flow-infinite-loop',
  description: 'CRITICAL FIX: Resolve infinite loop in AssetMapTab causing React error #185 - Fixed useEffect dependency array to prevent repeated state updates'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

