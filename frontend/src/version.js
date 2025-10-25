// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.223',
  // bumped for insurance UI enhancements
  buildDate: '2025-10-25',
  deploymentId: 'insurance-ui-enhancements',
  description: 'Enhanced insurance page with improved button styling, pie chart formatting, totals row, coverage distribution chart, and coverage-to-premium ratios'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
