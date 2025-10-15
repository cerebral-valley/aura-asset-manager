// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.200',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-final-infinite-loop-fix',
  description: 'FINAL FIX: React #185 infinite loop - useMemo creates new object refs on every render, only depend on hierarchyData'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

