// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.210',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-oklch-inline-overrides',
  description: 'FIX: Inline critical color properties after OKLCH→sRGB conversion to stabilise PNG/PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
