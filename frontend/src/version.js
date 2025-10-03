// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.153',
  buildDate: '2025-10-04',
  deploymentId: 'custom-goals-section',
  description: 'Custom Goals Section - Enhanced GoalsPage.jsx with custom goals functionality: +Add New Goal button, 3-goal maximum enforced with yellow notice, inline create/edit form with goal_type selection (asset/expense/income), title, target_amount, target_date (optional), allocate_amount from selected assets. Grid layout for goal cards with type badges (🎯/💰/📈), progress bars (green), Edit/Delete icons, confirmation dialogs. Uses TanStack Query mutations for CRUD operations.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

