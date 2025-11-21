// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.260',
  buildDate: '2025-01-25',
  deploymentId: 'password-confirmation-signup',
  description: 'Add password confirmation field for signup security. Users must now enter password twice during registration to prevent typos. Features: conditional confirm password field (only shows during signup), real-time validation before submission, clear error messages if passwords don\'t match, automatic field clearing when toggling between sign-in/sign-up modes. Improves UX and prevents account lockout from password typos.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
