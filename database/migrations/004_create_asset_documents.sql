-- Migration: Add document attachment columns to assets table
-- Created: October 11, 2025
-- Purpose: Support document uploads for assets (PDF, JPEG, DOCX files)

-- Add document columns to assets table if they don't exist
DO $$
BEGIN
    -- Check if document_path column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'document_path'
    ) THEN
        ALTER TABLE assets ADD COLUMN document_path TEXT;
        ALTER TABLE assets ADD COLUMN document_name TEXT;
        ALTER TABLE assets ADD COLUMN document_size INTEGER;
        ALTER TABLE assets ADD COLUMN document_type TEXT;
        ALTER TABLE assets ADD COLUMN document_uploaded_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added document attachment columns to assets table';
    ELSE
        RAISE NOTICE 'Document attachment columns already exist in assets table';
    END IF;
END
$$;

-- Create index for faster queries on document-related columns
CREATE INDEX IF NOT EXISTS idx_assets_document_path ON assets(document_path);
CREATE INDEX IF NOT EXISTS idx_assets_document_uploaded_at ON assets(document_uploaded_at);

-- Comment the new columns
COMMENT ON COLUMN assets.document_path IS 'Storage path in Supabase Storage (bucket/user_id/filename)';
COMMENT ON COLUMN assets.document_name IS 'Original filename of uploaded document';
COMMENT ON COLUMN assets.document_size IS 'File size in bytes (max 3MB per file)';
COMMENT ON COLUMN assets.document_type IS 'File extension: pdf, jpeg, jpg, docx';
COMMENT ON COLUMN assets.document_uploaded_at IS 'Timestamp when document was uploaded';
