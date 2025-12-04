-- ============================================================================
-- Migration: Fix Audit Trigger for Organizations Table
-- Created: 2025-11-14
-- Description: Fix audit trigger to handle tables without organization_id field
-- ============================================================================

-- Drop existing audit trigger on organizations
DROP TRIGGER IF EXISTS audit_organizations ON public.organizations;

-- Recreate the log_audit_changes function with proper handling for organizations table
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Special handling for organizations table (it doesn't have organization_id column)
  IF TG_TABLE_NAME = 'organizations' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      org_id := NEW.id;  -- For organizations table, use the id itself
    ELSIF TG_OP = 'DELETE' THEN
      org_id := OLD.id;
    END IF;
  ELSE
    -- For other tables, try to get organization_id from the record
    IF TG_OP = 'DELETE' THEN
      org_id := COALESCE(OLD.organization_id, public.get_user_organization_id());
    ELSE
      org_id := COALESCE(NEW.organization_id, public.get_user_organization_id());
    END IF;
  END IF;

  -- Insert audit log based on operation type
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      new_values
    ) VALUES (
      org_id,
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      org_id,
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values
    ) VALUES (
      org_id,
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_audit_changes() IS 'Audit trigger function with special handling for organizations table';

-- Recreate audit trigger on organizations
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

COMMENT ON TRIGGER audit_organizations ON public.organizations IS 'Audit trigger for organizations table';
