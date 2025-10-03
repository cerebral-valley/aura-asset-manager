// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.152',
  buildDate: '2025-10-04',
  deploymentId: 'net-worth-goal-section',
  description: 'Net Worth Goal Section - Enhanced GoalsPage.jsx with full net worth goal functionality: displays present net worth from selected assets, set/edit/delete target with optional date, animated progress bar showing completion percentage, monthly growth calculation showing required growth rate to reach target by date. Uses TanStack Query mutations for CRUD operations with optimistic updates and error handling. Includes confirmation dialogs for delete actions.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

