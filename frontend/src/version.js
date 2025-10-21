// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.2',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-ui-polish',
  description: 'Polish dashboard UI: format occupation/transaction types (Self Employed), fix tooltip contrast (solid white background)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
