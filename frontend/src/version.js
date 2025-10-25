// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.224',
  buildDate: '2025-10-25',
  deploymentId: 'insurance-timeline-tooltip-fix',
  description: 'Fixed pie chart tooltip styling (white bg, black text) and replaced Coverage Distribution with Insurance Timeline for active policies'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
