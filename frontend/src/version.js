// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.120',
  buildDate: '2025-09-23',
  deploymentId: 'agents-md-consolidation',
  description: 'Consolidated copilot-instructions.md into AGENTS.md - single source of truth for AI coding guidance'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}