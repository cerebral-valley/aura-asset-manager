// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.162',
  buildDate: '2025-01-26',
  deploymentId: 'checkbox-debug-logging',
  description: 'Added debug logging to checkbox mutation to trace data flow and identify why DB updates are not persisting.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}