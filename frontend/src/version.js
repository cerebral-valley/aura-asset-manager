// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.251',
  buildDate: '2025-01-25',
  deploymentId: 'logo-showcase',
  description: 'Added Logo Showcase page with 3 custom SVG logo concepts: Cosmic Constellation (sacred geometry), Wealth Prism (geometric crystal), Orbital System (planetary rings). Fully scalable vector logos with size variations and in-context previews. Route: /logo-showcase'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
