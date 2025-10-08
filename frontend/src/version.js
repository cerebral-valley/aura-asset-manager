// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.156',
  buildDate: '2025-10-08',
  deploymentId: 'goals-phase8-complete',
  description: 'Goals Feature Phase 8 COMPLETE - Mark as Complete & Goal Logs: Added CheckCircle buttons to Net Worth and Custom goal cards with completion mutations, implemented full Goal Logs functionality displaying completed goals with completion dates/details/achievement status, added delete functionality for completed goals, comprehensive filtering for active vs completed goals. All 8 phases of Goals feature now complete with full CRUD operations, progress tracking, completion management, and historical goal logging.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

