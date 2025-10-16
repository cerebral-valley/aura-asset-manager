// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.205',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-oklch-root-fix',
  description: 'FIX: Comprehensive OKLCH stripping - <style> blocks + :root custom properties + inline styles for PNG/PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

