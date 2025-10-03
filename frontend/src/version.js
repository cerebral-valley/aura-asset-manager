// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.150',
  buildDate: '2025-10-04',
  deploymentId: 'frontend-goals-service',
  description: 'Frontend Goals Service Layer - Created goalsService with named export pattern (getGoals, getGoal, createGoal, updateGoal, completeGoal, deleteGoal), proper trailing slashes matching backend routes, abort signal support. Added goals query keys to queryKeys.js with list/detail/byType/completed keys and invalidation helpers (invalidateGoals, invalidateGoalsAndAssets)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

