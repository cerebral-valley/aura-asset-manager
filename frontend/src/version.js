// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.158',
  buildDate: '2024-12-24',
  deploymentId: 'debug-checkbox-persistence',
  description: 'Enhanced backend debugging to trace checkbox selection persistence issue. Added detailed logging for PUT/GET asset selection operations.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}