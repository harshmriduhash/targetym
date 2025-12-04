-- Migration: Add soft-delete support to profiles table
-- Date: 2025-11-17
-- Purpose: Enable soft-delete instead of hard-delete for GDPR compliance and audit trail

-- Add soft-delete columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for soft-delete queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- Add comment
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when profile was soft-deleted (NULL = not deleted)';
COMMENT ON COLUMN profiles.deleted_by IS 'User ID who performed the deletion (for audit)';

-- Update RLS policy to exclude soft-deleted profiles by default
-- This ensures deleted profiles don't appear in queries unless specifically requested
-- Create policy if it doesn't exist, otherwise alter it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'select_profiles_by_organization'
  ) THEN
    ALTER POLICY select_profiles_by_organization ON profiles
      USING (
        (auth.uid() = id OR
        (SELECT get_user_organization_id()) = organization_id)
        AND deleted_at IS NULL
      );
  ELSE
    CREATE POLICY select_profiles_by_organization ON profiles
      FOR SELECT
      USING (
        (auth.uid() = id OR
        (SELECT get_user_organization_id()) = organization_id)
        AND deleted_at IS NULL
      );
  END IF;
END $$;

-- Create audit function for soft-delete tracking
CREATE OR REPLACE FUNCTION audit_soft_delete()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- Get organization_id from the profile
    org_id := NEW.organization_id;
    
    INSERT INTO audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      org_id,
      COALESCE(NEW.deleted_by, auth.uid()),
      'DELETE',
      'profiles',
      NEW.id,
      to_jsonb(OLD),
      jsonb_build_object(
        'deleted_at', NEW.deleted_at,
        'deleted_by', NEW.deleted_by,
        'id', NEW.id,
        'email', NEW.email,
        'full_name', NEW.full_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS profiles_soft_delete_trigger ON profiles;
CREATE TRIGGER profiles_soft_delete_trigger
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION audit_soft_delete();
