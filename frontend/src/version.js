// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.2',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-hierarchy-422-fix',
  description: 'FIX: Insurance hierarchy 422 error - fixed SQLAlchemy Decimal type conversions and None handling in annualize_premium function'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
