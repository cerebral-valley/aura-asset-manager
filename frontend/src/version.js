// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.208',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-oklch-sanitizer',
  description: 'FIX: Convert OKLCH colors to sRGB within export clone so PNG/PDF generation retains styling'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
