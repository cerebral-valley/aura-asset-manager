// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.5',
  buildDate: '2025-10-21',
  deploymentId: 'userguide-two-column-layout',
  description: 'UserGuide two-column magazine-style layout for better horizontal space utilization (desktop 2 cols, mobile 1 col)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
