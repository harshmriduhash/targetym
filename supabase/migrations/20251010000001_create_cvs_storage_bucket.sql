-- Create CVs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  true,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload CVs to their organization folder
CREATE POLICY "Allow authenticated users to upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Allow authenticated users to read CVs from their organization
CREATE POLICY "Allow users to read organization CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Allow public read access (for viewing CVs via public URLs)
-- WARNING: Only enable this if you want CVs to be publicly accessible
-- Comment out this policy if CVs should remain private
CREATE POLICY "Allow public read access to CVs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');

-- Policy: Allow authenticated users to update their uploaded CVs
CREATE POLICY "Allow users to update organization CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Allow authenticated users to delete CVs from their organization
CREATE POLICY "Allow users to delete organization CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Add comment
-- Note: COMMENT statements removed due to permission issues - postgres user doesn't own system tables
-- COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
-- COMMENT ON POLICY "Allow authenticated users to upload CVs" ON storage.objects IS 'Users can upload CVs to their organization folder';
-- COMMENT ON POLICY "Allow users to read organization CVs" ON storage.objects IS 'Users can read CVs from their organization';
-- COMMENT ON POLICY "Allow public read access to CVs" ON storage.objects IS 'Public can access CVs via public URLs (consider disabling for privacy)';
