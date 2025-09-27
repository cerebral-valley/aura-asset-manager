// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.130',
  buildDate: '2024-12-19', 
  deploymentId: 'spa-routing-and-matrix-charts-fix',
  description: 'Fixed SPA routing by adding specific /assets rewrite rules and corrected MatrixChart import path to enable matrix chart visualization'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}