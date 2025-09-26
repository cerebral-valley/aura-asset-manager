// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.175',
  buildDate: '2024-12-28',
  deploymentId: 'unified-liquid-assets-fix',
  description: 'Unified liquid asset definition, removed user_asset_selection table, single source of truth in assets table'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}