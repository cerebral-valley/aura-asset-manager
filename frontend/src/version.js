// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.148-part1',
  buildDate: '2025-10-03',
  deploymentId: 'assets-selection-enhancements',
  description: 'Assets page selection enhancements: wrapped column header "Asset Selection for Goals" and added selected assets total row. Database prep: added allocate_amount column to user_goals table for Goals feature.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

