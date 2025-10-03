// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.154',
  buildDate: '2025-10-04',
  deploymentId: 'goals-feature-complete',
  description: 'Goals Feature Complete (Phases 1-6) - Full Goals page with: (1) Selected assets table showing is_selected=true assets with all columns, (2) Net worth goal with target setting, progress bar, monthly growth calculation, (3) Custom goals with +Add button, 3-goal limit, type selection (asset/expense/income), allocation tracking, Edit/Delete actions, (4) TanStack Query mutations for all CRUD operations. Ready for Phase 7-8: UI polish, allocation validation warning, Mark as Complete functionality, Goal Logs section.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

