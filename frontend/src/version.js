// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.162',
  buildDate: '2025-10-11',
  deploymentId: 'document-upload-phase-1-2-3',
  description: 'Document Upload Feature Phase 1-3 Implementation: Database schema extension with 5 new document columns, Supabase Storage bucket setup with file validation, Backend API endpoints for upload/download/delete with 3MB/25MB limits, Frontend document service and AssetDocumentUpload component with drag-drop interface, Integration into asset edit modal for existing assets only.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

