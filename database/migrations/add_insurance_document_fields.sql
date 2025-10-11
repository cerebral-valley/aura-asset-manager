-- Add document fields to insurance_policies table
-- Migration: Add document support to insurance policies

ALTER TABLE insurance_policies 
ADD COLUMN IF NOT EXISTS document_path TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_size INTEGER,
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS document_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add comments for clarity
COMMENT ON COLUMN insurance_policies.document_path IS 'Storage path in Supabase Storage';
COMMENT ON COLUMN insurance_policies.document_name IS 'Original filename';
COMMENT ON COLUMN insurance_policies.document_size IS 'File size in bytes';
COMMENT ON COLUMN insurance_policies.document_type IS 'File type: pdf, jpeg, jpg, docx';
COMMENT ON COLUMN insurance_policies.document_uploaded_at IS 'Upload timestamp';