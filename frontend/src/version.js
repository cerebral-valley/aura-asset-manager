// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.151',
  buildDate: '2025-10-04',
  deploymentId: 'goals-page-foundation',
  description: 'Goals Page Foundation - Created GoalsPage.jsx with selected assets table showing assets where is_selected=true, calculating present values and percentages. Added /goals route to App.jsx with Goals import. Added Goals navigation link to AppLayout.jsx with Target icon. Page includes placeholders for Net Worth Goal (Phase 5), Custom Goals (Phase 6), and Goal Logs (Phase 8) sections.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

