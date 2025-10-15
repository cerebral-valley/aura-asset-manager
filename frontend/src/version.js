// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.204',
  buildDate: '2025-01-10',
  deploymentId: 'asset-map-oklch-css-rewrite',
  description: 'FIX: Strip oklch() from cloned CSS <style> blocks before html2canvas parsing for PNG/PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

