-- ============================================================================
-- Migration: Fix RLS Policies - Remove Infinite Recursion
-- Created: 2025-11-06
-- Description: Fix recursive policies and permission issues
-- ============================================================================

-- SECTION 1: Drop problematic policies
-- ============================================================================

-- Drop all existing policies on goals to prevent recursion
DROP POLICY IF EXISTS "goals_select" ON public.goals;
DROP POLICY IF EXISTS "goals_insert" ON public.goals;
DROP POLICY IF EXISTS "goals_update" ON public.goals;
DROP POLICY IF EXISTS "goals_delete" ON public.goals;
DROP POLICY IF EXISTS "goals_select_all" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_own_org" ON public.goals;
DROP POLICY IF EXISTS "goals_update_owner_or_collaborator" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_owner" ON public.goals;

-- Drop organizations policies
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_delete" ON public.organizations;

-- Drop profiles policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_org" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Drop job_postings policies
DROP POLICY IF EXISTS "job_postings_select" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_insert" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_update" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_delete" ON public.job_postings;

-- SECTION 2: Create simple, non-recursive policies
-- ============================================================================

-- Organizations: simple policies without recursion
CREATE POLICY "organizations_select_own"
  ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "organizations_update_own"
  ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Profiles: simple policies
CREATE POLICY "profiles_select_own_org"
  ON public.profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_authenticated"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      organization_id IN (
        SELECT organization_id
        FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr')
      )
    )
  );

-- Goals: simple policies without recursion
CREATE POLICY "goals_select_own_org"
  ON public.goals
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "goals_insert_own_org"
  ON public.goals
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "goals_update_owner_or_admin"
  ON public.goals
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "goals_delete_owner_or_admin"
  ON public.goals
  FOR DELETE
  USING (
    owner_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Job Postings: simple policies
CREATE POLICY "job_postings_select_own_org"
  ON public.job_postings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "job_postings_insert_hr_admin"
  ON public.job_postings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "job_postings_update_hr_admin"
  ON public.job_postings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "job_postings_delete_hr_admin"
  ON public.job_postings
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- SECTION 3: Add comments
-- ============================================================================

COMMENT ON POLICY "organizations_select_own" ON public.organizations IS
  'Users can view their own organization';

COMMENT ON POLICY "goals_select_own_org" ON public.goals IS
  'Users can view goals from their organization';

COMMENT ON POLICY "goals_update_owner_or_admin" ON public.goals IS
  'Goals can be updated by owner or organization admins/HR/managers';

-- ============================================================================
-- Migration completed successfully
-- ============================================================================
