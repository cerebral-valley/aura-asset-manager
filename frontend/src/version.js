// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.215',
  buildDate: '2025-10-17',
  deploymentId: 'asset-map-capture-container-with-edges',
  description: 'FIX: Capture .react-flow container (parent of viewport AND edges SVG layer) with synchronized transforms'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
