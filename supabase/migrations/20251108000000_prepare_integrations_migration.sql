-- ============================================================================
-- Migration: Prepare Integrations Infrastructure
-- Created: 2025-11-08
-- Description: Drops old integration tables to prepare for comprehensive schema
--              This migration runs BEFORE 20251108000001_integrations_infrastructure.sql
-- ============================================================================

-- Step 1: Drop all indexes on integration tables first
DROP INDEX IF EXISTS public.idx_integrations_org_provider CASCADE;
DROP INDEX IF EXISTS public.idx_integrations_status CASCADE;
DROP INDEX IF EXISTS public.idx_integrations_provider CASCADE;
DROP INDEX IF EXISTS public.idx_integration_webhooks_integration CASCADE;
DROP INDEX IF EXISTS public.idx_integration_sync_logs_integration CASCADE;

-- Step 2: Drop all policies on integration tables
DROP POLICY IF EXISTS "Users can view integrations in their organization" ON public.integrations CASCADE;
DROP POLICY IF EXISTS "Admins can manage integrations" ON public.integrations CASCADE;
DROP POLICY IF EXISTS "integration_webhooks_select" ON public.integration_webhooks CASCADE;
DROP POLICY IF EXISTS "integration_sync_logs_select" ON public.integration_sync_logs CASCADE;

-- Step 3: Drop all triggers on integration tables
DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations CASCADE;
DROP TRIGGER IF EXISTS update_integration_webhooks_updated_at ON public.integration_webhooks CASCADE;
DROP TRIGGER IF EXISTS audit_integrations_changes ON public.integrations CASCADE;

-- Step 4: Drop all functions related to integrations
DROP FUNCTION IF EXISTS public.handle_integration_status_change() CASCADE;

-- Step 5: Now drop the tables (CASCADE will handle any remaining dependencies)
DROP TABLE IF EXISTS public.integration_sync_logs CASCADE;
DROP TABLE IF EXISTS public.integration_webhooks CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.integration_providers CASCADE;
DROP TABLE IF EXISTS public.integration_credentials CASCADE;
DROP TABLE IF EXISTS public.integration_consents CASCADE;
DROP TABLE IF EXISTS public.integration_oauth_states CASCADE;

-- Note: The comprehensive schema will be created by the next migration
-- (20251108000001_integrations_infrastructure.sql)

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE '✅ Preparation migration completed successfully!';
  RAISE NOTICE 'Old integration tables dropped, ready for comprehensive schema';
END $$;
