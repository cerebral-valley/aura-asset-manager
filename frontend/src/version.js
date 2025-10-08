// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.155',
  buildDate: '2025-10-08',
  deploymentId: 'goals-ui-complete',
  description: 'Goals Feature Phase 7 Complete - UI Overhaul with Dark Theme Matching: Fixed critical JSX structure error, completed comprehensive UI redesign with isDark conditionals throughout all sections (Net Worth, Custom Goals, Goal Logs), added allocation validation warning with AlertTriangle icon, removed all dark: Tailwind prefixes in favor of ternary conditionals, updated form fields/buttons/cards to match app aesthetic (dark slate backgrounds, pink accent buttons). Phase 8 ready: Mark as Complete functionality and Goal Logs enhancement.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

