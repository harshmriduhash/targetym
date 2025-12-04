-- =====================================================
-- S2: Sécurisation du bucket CVs
-- =====================================================
-- This migration secures the CVs storage bucket with proper RLS policies
-- to ensure only authorized users can access candidate CVs

-- =====================================================
-- 1. CREATE BUCKET (if not exists)
-- =====================================================

-- Insert bucket if it doesn't exist (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false, -- PRIVATE bucket (not public)
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false, -- Ensure it's private
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[];

-- =====================================================
-- 2. DROP EXISTING POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "Users can upload CVs to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can view CVs from their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete CVs from their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can update CVs metadata" ON storage.objects;

-- =====================================================
-- 3. CREATE RLS POLICIES FOR CVS BUCKET
-- =====================================================

-- Policy 1: UPLOAD (INSERT)
-- Users can upload CVs to their organization's folder
CREATE POLICY "Users can upload CVs to their organization"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Policy 2: SELECT (READ/DOWNLOAD)
-- Users can view CVs from their organization
-- Only HR, Admin, and Managers can view CVs
CREATE POLICY "Users can view CVs from their organization"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
  AND (
    -- Check user role: only hr, admin, manager can view CVs
    SELECT role IN ('admin', 'hr', 'manager')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Policy 3: DELETE
-- Only HR and Admins can delete CVs from their organization
CREATE POLICY "Users can delete CVs from their organization"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
  AND (
    -- Only HR and Admin can delete
    SELECT role IN ('admin', 'hr')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Policy 4: UPDATE
-- Only HR and Admins can update CV metadata
CREATE POLICY "Users can update CVs metadata"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
  AND (
    -- Only HR and Admin can update
    SELECT role IN ('admin', 'hr')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Note: COMMENT ON POLICY statements removed due to permission issues
-- postgres user doesn't own storage.objects table
-- Policy documentation:
--   "Users can upload CVs to their organization" - Allows authenticated users to upload CVs to their organization folder
--   "Users can view CVs from their organization" - Allows HR, Admin, and Manager roles to view CVs
--   "Users can delete CVs from their organization" - Allows only HR and Admin roles to delete CVs
--   "Users can update CVs metadata" - Allows only HR and Admin roles to update CV metadata

-- =====================================================
-- 5. ENABLE RLS ON STORAGE.OBJECTS (if not already enabled)
-- =====================================================

-- Note: ALTER TABLE statement removed due to permission issues
-- RLS is already enabled by default on storage.objects in Supabase
-- No action needed - RLS is active by default

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ S2 Migration completed successfully!';
  RAISE NOTICE 'CVs bucket is now secured with RLS policies:';
  RAISE NOTICE '  - Private bucket (not publicly accessible)';
  RAISE NOTICE '  - Users can upload CVs to their organization';
  RAISE NOTICE '  - Only HR/Admin/Manager can view CVs';
  RAISE NOTICE '  - Only HR/Admin can delete CVs';
  RAISE NOTICE '  - File size limit: 10MB';
  RAISE NOTICE '  - Allowed types: PDF, DOC, DOCX';
END $$;
