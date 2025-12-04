-- ============================================================================
-- Script: Configuration du Bucket CVs en Production
-- Description: Créer et sécuriser le bucket CVs avec RLS
-- Usage: Copiez-collez ce script dans Supabase SQL Editor
-- ============================================================================

-- SECTION 1: Créer le bucket CVs (PRIVATE)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false, -- PRIVATE (pas public!)
  10485760, -- 10MB en bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[];

-- SECTION 2: RLS Policies pour le bucket CVs
-- ============================================================================

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload CVs to their organization folder" ON storage.objects;
DROP POLICY IF EXISTS "HR/Admin/Manager can view CVs from their organization" ON storage.objects;
DROP POLICY IF EXISTS "HR/Admin can delete CVs from their organization" ON storage.objects;
DROP POLICY IF EXISTS "HR/Admin can update CVs from their organization" ON storage.objects;

-- Policy: Tous les utilisateurs authentifiés peuvent uploader des CVs
CREATE POLICY "Authenticated users can upload CVs to their organization folder"
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

-- Policy: Seuls HR/Admin/Manager peuvent voir les CVs de leur organisation
CREATE POLICY "HR/Admin/Manager can view CVs from their organization"
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
    SELECT role IN ('admin', 'hr', 'manager')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Seuls HR/Admin peuvent supprimer des CVs
CREATE POLICY "HR/Admin can delete CVs from their organization"
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
    SELECT role IN ('admin', 'hr')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Seuls HR/Admin peuvent mettre à jour des CVs
CREATE POLICY "HR/Admin can update CVs from their organization"
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
    SELECT role IN ('admin', 'hr')
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- SECTION 3: Vérification
-- ============================================================================

-- Vérifier que le bucket est bien créé
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'cvs';

-- Vérifier les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%cvs%' OR policyname LIKE '%CV%';

-- ============================================================================
-- 🎉 Configuration terminée!
-- ============================================================================
--
-- Résultats attendus:
-- 1. Bucket 'cvs' créé avec public = false
-- 2. Limite de taille: 10MB (10485760 bytes)
-- 3. MIME types: PDF, DOC, DOCX seulement
-- 4. 4 RLS policies actives (INSERT, SELECT, DELETE, UPDATE)
--
-- ✅ Le script supprime automatiquement les anciennes policies avant de les recréer.
-- Vous pouvez l'exécuter plusieurs fois sans erreurs.
-- ============================================================================
