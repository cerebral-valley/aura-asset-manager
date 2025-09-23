// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.135',
  buildDate: '2025-09-23',
  deploymentId: 'database-migration-applied',
  description: 'Database migration 007 successfully applied: created user_asset_selections and target_allocations tables, Target page endpoints should now work'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}