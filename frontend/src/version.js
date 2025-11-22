// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.262',
  buildDate: '2025-01-25',
  deploymentId: 'favicon-svg-fix',
  description: 'Fix favicon SVG rendering issue. Corrected viewBox dimensions (100x100 instead of 32x32) and fixed SVG attribute naming (stroke-width instead of strokeWidth). Favicon now renders correctly in browser tabs with crisp MinimalistMandala logo design.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
