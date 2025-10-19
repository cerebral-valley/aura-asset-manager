// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.217',
  buildDate: '2025-10-19',
  deploymentId: 'insurance-mapping-visualization',
  description: 'NEW: Insurance Coverage Map with React Flow visualization - shows policy hierarchy by type with coverage and premium totals, includes PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
