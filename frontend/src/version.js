// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.21',
  buildDate: '2025-10-24',
  deploymentId: 'user-guide-pdf-sanitization',
  description: 'Strip unsupported emoji and normalize characters in User Guide PDF export'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
