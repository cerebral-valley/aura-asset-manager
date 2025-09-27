// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.134',
  buildDate: '2024-12-28', 
  deploymentId: 'fix-route-collision',
  description: 'Fixed SPA routing by renaming /assets route to /portfolio to avoid collision with Vercel static assets directory'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
