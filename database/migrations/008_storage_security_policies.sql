-- Migration: Add Supabase Storage security policies for user-specific folders
-- Created: October 11, 2025
-- Purpose: Implement RLS policies to ensure users can only access their own document folders

-- Enable RLS on storage.objects table (if not already enabled)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for migration reruns)
DROP POLICY IF EXISTS "Users can select their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert documents in their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Policy 1: Users can SELECT (view/download) their own documents
-- This allows users to view and download documents in their user_id folder
CREATE POLICY "Users can select their own documents"
ON storage.objects FOR SELECT
USING (
    -- restrict to asset-documents bucket
    bucket_id = 'asset-documents'
    AND (select auth.uid()::text) = (storage.foldername(name))[1]
    AND (select auth.role()) = 'authenticated'
);

-- Policy 2: Users can INSERT (upload) documents to their own folder
-- This allows users to upload new documents to their user_id folder
CREATE POLICY "Users can insert documents in their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    -- restrict to asset-documents bucket
    bucket_id = 'asset-documents'
    AND (select auth.uid()::text) = (storage.foldername(name))[1]
    AND (select auth.role()) = 'authenticated'
);

-- Policy 3: Users can UPDATE their own documents (for metadata changes)
-- This allows users to update metadata of their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
    -- restrict to asset-documents bucket
    bucket_id = 'asset-documents'
    AND (select auth.uid()::text) = (storage.foldername(name))[1]
    AND (select auth.role()) = 'authenticated'
)
WITH CHECK (
    -- restrict to asset-documents bucket
    bucket_id = 'asset-documents'
    AND (select auth.uid()::text) = (storage.foldername(name))[1]
    AND (select auth.role()) = 'authenticated'
);

-- Policy 4: Users can DELETE their own documents
-- This allows users to delete documents from their user_id folder
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
    -- restrict to asset-documents bucket
    bucket_id = 'asset-documents'
    AND (select auth.uid()::text) = (storage.foldername(name))[1]
    AND (select auth.role()) = 'authenticated'
);

-- Enable RLS on storage.buckets table for bucket-level security
ALTER TABLE IF EXISTS storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing bucket policy if it exists
DROP POLICY IF EXISTS "Authenticated users can access asset-documents bucket" ON storage.buckets;

-- Policy for bucket access: Only authenticated users can access the asset-documents bucket
CREATE POLICY "Authenticated users can access asset-documents bucket"
ON storage.buckets FOR SELECT
USING (
    id = 'asset-documents'
    AND (select auth.role()) = 'authenticated'
);

-- Add helpful comments
COMMENT ON POLICY "Users can select their own documents" ON storage.objects IS 
'Allows authenticated users to view/download documents in their user_id folder only';

COMMENT ON POLICY "Users can insert documents in their own folder" ON storage.objects IS 
'Allows authenticated users to upload documents to their user_id folder only';

COMMENT ON POLICY "Users can update their own documents" ON storage.objects IS 
'Allows authenticated users to update metadata of documents in their user_id folder only';

COMMENT ON POLICY "Users can delete their own documents" ON storage.objects IS 
'Allows authenticated users to delete documents from their user_id folder only';

COMMENT ON POLICY "Authenticated users can access asset-documents bucket" ON storage.buckets IS 
'Allows authenticated users to access the asset-documents bucket for document storage';