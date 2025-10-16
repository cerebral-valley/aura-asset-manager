// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.206',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-rgb-export-stylesheet',
  description: 'FIX: Inject RGB-only export stylesheet - clean approach to eliminate all oklch() for PNG/PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

