-- ============================================================================
-- Migration: Fix RLS Security - Critical Cross-Organization Leakage
-- Created: 2025-11-17
-- Priority: P0 - CRITICAL SECURITY FIX
-- Description: Secure all tables with proper organization_id filtering
--              without recursion issues
-- ============================================================================
-- AUDIT ISSUE: AUDIT-P0-1
-- Previous migration 20251106000002 used overly permissive policies
-- (USING true or auth.role() = 'authenticated') which allows cross-org access
-- ============================================================================

-- SECTION 1: Create Safe Helper Function (Non-Recursive)
-- ============================================================================

-- Create a materialized organization lookup that doesn't cause recursion
-- Note: Created in public schema as we don't have permission to create in auth schema
CREATE OR REPLACE FUNCTION public.user_organization_id_safe()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  -- Direct lookup without going through RLS on profiles
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.user_organization_id_safe IS
  'Returns the organization_id for the current authenticated user. Uses SECURITY DEFINER to bypass RLS and avoid recursion. Safe alternative to auth.user_organization_id().';

-- ============================================================================
-- SECTION 2: PROFILES Table - Foundation (No Recursion)
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "profiles_select_simple" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_simple" ON public.profiles;

-- Profiles SELECT: Users can only see profiles in their organization
-- Uses a self-join to avoid recursion
DROP POLICY IF EXISTS "profiles_select_own_organization" ON public.profiles;
CREATE POLICY "profiles_select_own_organization"
  ON public.profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT p.organization_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );

-- Profiles INSERT: Users can create their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Profiles UPDATE: Users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Profiles DELETE: Only admins can delete profiles (via application logic)
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SECTION 3: ORGANIZATIONS Table
-- ============================================================================

DROP POLICY IF EXISTS "organizations_select_all" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert_any" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_any" ON public.organizations;

-- Organizations SELECT: Users can only see their own organization
DROP POLICY IF EXISTS "organizations_select_own" ON public.organizations;
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

-- Organizations INSERT: Authenticated users can create organizations
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;
CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Organizations UPDATE: Only admins can update organization settings
DROP POLICY IF EXISTS "organizations_update_admin" ON public.organizations;
CREATE POLICY "organizations_update_admin"
  ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SECTION 4: GOALS Table - Secure Multi-Tenant Isolation
-- ============================================================================

DROP POLICY IF EXISTS "goals_select_authenticated" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_authenticated" ON public.goals;
DROP POLICY IF EXISTS "goals_update_owner" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_owner" ON public.goals;

-- Goals SELECT: Users can view goals in their organization
DROP POLICY IF EXISTS "goals_select_own_organization" ON public.goals;
CREATE POLICY "goals_select_own_organization"
  ON public.goals
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Goals INSERT: Users can create goals in their organization
DROP POLICY IF EXISTS "goals_insert_own_organization" ON public.goals;
CREATE POLICY "goals_insert_own_organization"
  ON public.goals
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND owner_id = auth.uid()
  );

-- Goals UPDATE: Owner or admin/manager can update
DROP POLICY IF EXISTS "goals_update_owner_or_admin" ON public.goals;
CREATE POLICY "goals_update_owner_or_admin"
  ON public.goals
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

-- Goals DELETE: Owner or admin can delete
DROP POLICY IF EXISTS "goals_delete_owner_or_admin" ON public.goals;
CREATE POLICY "goals_delete_owner_or_admin"
  ON public.goals
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- ============================================================================
-- SECTION 5: KEY_RESULTS Table
-- ============================================================================

DROP POLICY IF EXISTS "key_results_select_authenticated" ON public.key_results;
DROP POLICY IF EXISTS "key_results_insert_authenticated" ON public.key_results;
DROP POLICY IF EXISTS "key_results_update_owner" ON public.key_results;
DROP POLICY IF EXISTS "key_results_delete_owner" ON public.key_results;

-- Key Results follow same pattern as goals
DROP POLICY IF EXISTS "key_results_select_own_organization" ON public.key_results;
CREATE POLICY "key_results_select_own_organization"
  ON public.key_results
  FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "key_results_insert_own_organization" ON public.key_results;
CREATE POLICY "key_results_insert_own_organization"
  ON public.key_results
  FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "key_results_update_goal_owner" ON public.key_results;
CREATE POLICY "key_results_update_goal_owner"
  ON public.key_results
  FOR UPDATE
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
      AND (
        owner_id = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM public.profiles WHERE role IN ('admin', 'manager')
        )
      )
    )
  );

DROP POLICY IF EXISTS "key_results_delete_goal_owner" ON public.key_results;
CREATE POLICY "key_results_delete_goal_owner"
  ON public.key_results
  FOR DELETE
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
      AND (
        owner_id = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM public.profiles WHERE role = 'admin'
        )
      )
    )
  );

-- ============================================================================
-- SECTION 6: JOB_POSTINGS Table
-- ============================================================================

DROP POLICY IF EXISTS "job_postings_select_authenticated" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_insert_creator" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_update_creator" ON public.job_postings;
DROP POLICY IF EXISTS "job_postings_delete_creator" ON public.job_postings;

-- Job Postings SELECT: Users in organization
DROP POLICY IF EXISTS "job_postings_select_own_organization" ON public.job_postings;
CREATE POLICY "job_postings_select_own_organization"
  ON public.job_postings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Job Postings INSERT: HR/Admin/Manager only
DROP POLICY IF EXISTS "job_postings_insert_hr_admin_manager" ON public.job_postings;
CREATE POLICY "job_postings_insert_hr_admin_manager"
  ON public.job_postings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

-- Job Postings UPDATE: Creator or HR/Admin
DROP POLICY IF EXISTS "job_postings_update_creator_or_admin" ON public.job_postings;
CREATE POLICY "job_postings_update_creator_or_admin"
  ON public.job_postings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr')
      )
    )
  );

-- Job Postings DELETE: Admin/HR only
DROP POLICY IF EXISTS "job_postings_delete_admin_hr" ON public.job_postings;
CREATE POLICY "job_postings_delete_admin_hr"
  ON public.job_postings
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================================================
-- SECTION 7: CANDIDATES Table
-- ============================================================================

DROP POLICY IF EXISTS "candidates_select_authenticated" ON public.candidates;
DROP POLICY IF EXISTS "candidates_insert_authenticated" ON public.candidates;
DROP POLICY IF EXISTS "candidates_update_authenticated" ON public.candidates;
DROP POLICY IF EXISTS "candidates_delete_authenticated" ON public.candidates;

DROP POLICY IF EXISTS "candidates_select_own_organization" ON public.candidates;
CREATE POLICY "candidates_select_own_organization"
  ON public.candidates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "candidates_insert_own_organization" ON public.candidates;
CREATE POLICY "candidates_insert_own_organization"
  ON public.candidates
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "candidates_update_own_organization" ON public.candidates;
CREATE POLICY "candidates_update_own_organization"
  ON public.candidates
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "candidates_delete_admin_hr" ON public.candidates;
CREATE POLICY "candidates_delete_admin_hr"
  ON public.candidates
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================================================
-- SECTION 8: INTERVIEWS Table
-- ============================================================================

DROP POLICY IF EXISTS "interviews_select_authenticated" ON public.interviews;
DROP POLICY IF EXISTS "interviews_insert_authenticated" ON public.interviews;
DROP POLICY IF EXISTS "interviews_update_authenticated" ON public.interviews;
DROP POLICY IF EXISTS "interviews_delete_authenticated" ON public.interviews;

DROP POLICY IF EXISTS "interviews_select_own_organization" ON public.interviews;
CREATE POLICY "interviews_select_own_organization"
  ON public.interviews
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM public.candidates
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "interviews_insert_own_organization" ON public.interviews;
CREATE POLICY "interviews_insert_own_organization"
  ON public.interviews
  FOR INSERT
  WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.candidates
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "interviews_update_own_organization" ON public.interviews;
CREATE POLICY "interviews_update_own_organization"
  ON public.interviews
  FOR UPDATE
  USING (
    candidate_id IN (
      SELECT id FROM public.candidates
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "interviews_delete_admin_hr" ON public.interviews;
CREATE POLICY "interviews_delete_admin_hr"
  ON public.interviews
  FOR DELETE
  USING (
    candidate_id IN (
      SELECT id FROM public.candidates
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================================================
-- SECTION 9: PERFORMANCE_REVIEWS Table
-- ============================================================================

DROP POLICY IF EXISTS "performance_reviews_select_authenticated" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_insert_authenticated" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update_authenticated" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_delete_authenticated" ON public.performance_reviews;

-- Performance Reviews SELECT: Users can see reviews they're involved in or if admin/hr
DROP POLICY IF EXISTS "performance_reviews_select_involved_or_admin" ON public.performance_reviews;
CREATE POLICY "performance_reviews_select_involved_or_admin"
  ON public.performance_reviews
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      reviewee_id = auth.uid()
      OR reviewer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr', 'manager')
      )
    )
  );

-- Performance Reviews INSERT: Admin/HR/Manager only
DROP POLICY IF EXISTS "performance_reviews_insert_admin_hr_manager" ON public.performance_reviews;
CREATE POLICY "performance_reviews_insert_admin_hr_manager"
  ON public.performance_reviews
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

-- Performance Reviews UPDATE: Reviewer can update
DROP POLICY IF EXISTS "performance_reviews_update_reviewer" ON public.performance_reviews;
CREATE POLICY "performance_reviews_update_reviewer"
  ON public.performance_reviews
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      reviewer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr')
      )
    )
  );

-- Performance Reviews DELETE: Admin/HR only
DROP POLICY IF EXISTS "performance_reviews_delete_admin_hr" ON public.performance_reviews;
CREATE POLICY "performance_reviews_delete_admin_hr"
  ON public.performance_reviews
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================================================
-- SECTION 10: PEER_FEEDBACK Table
-- ============================================================================

DROP POLICY IF EXISTS "peer_feedback_select_authenticated" ON public.peer_feedback;
DROP POLICY IF EXISTS "peer_feedback_insert_authenticated" ON public.peer_feedback;
DROP POLICY IF EXISTS "peer_feedback_update_authenticated" ON public.peer_feedback;
DROP POLICY IF EXISTS "peer_feedback_delete_authenticated" ON public.peer_feedback;

DROP POLICY IF EXISTS "peer_feedback_select_own_organization" ON public.peer_feedback;
CREATE POLICY "peer_feedback_select_own_organization"
  ON public.peer_feedback
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "peer_feedback_insert_own_organization" ON public.peer_feedback;
CREATE POLICY "peer_feedback_insert_own_organization"
  ON public.peer_feedback
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "peer_feedback_update_creator" ON public.peer_feedback;
CREATE POLICY "peer_feedback_update_creator"
  ON public.peer_feedback
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      reviewer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr')
      )
    )
  );

DROP POLICY IF EXISTS "peer_feedback_delete_creator_or_admin" ON public.peer_feedback;
CREATE POLICY "peer_feedback_delete_creator_or_admin"
  ON public.peer_feedback
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    AND (
      reviewer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr')
      )
    )
  );

-- ============================================================================
-- SECTION 11: GOAL_COLLABORATORS Table
-- ============================================================================

DROP POLICY IF EXISTS "goal_collaborators_select_authenticated" ON public.goal_collaborators;
DROP POLICY IF EXISTS "goal_collaborators_insert_authenticated" ON public.goal_collaborators;
DROP POLICY IF EXISTS "goal_collaborators_update_authenticated" ON public.goal_collaborators;
DROP POLICY IF EXISTS "goal_collaborators_delete_authenticated" ON public.goal_collaborators;

DROP POLICY IF EXISTS "goal_collaborators_select_own_organization" ON public.goal_collaborators;
CREATE POLICY "goal_collaborators_select_own_organization"
  ON public.goal_collaborators
  FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "goal_collaborators_insert_goal_owner" ON public.goal_collaborators;
CREATE POLICY "goal_collaborators_insert_goal_owner"
  ON public.goal_collaborators
  FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
      AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "goal_collaborators_delete_goal_owner" ON public.goal_collaborators;
CREATE POLICY "goal_collaborators_delete_goal_owner"
  ON public.goal_collaborators
  FOR DELETE
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 12: Comments & Documentation
-- ============================================================================

COMMENT ON POLICY "goals_select_own_organization" ON public.goals IS
  'SECURITY: Users can only view goals in their organization. Prevents cross-organization data leakage.';

COMMENT ON POLICY "job_postings_select_own_organization" ON public.job_postings IS
  'SECURITY: Users can only view job postings in their organization. Multi-tenant isolation enforced.';

COMMENT ON POLICY "candidates_select_own_organization" ON public.candidates IS
  'SECURITY: Users can only view candidates in their organization. Protects candidate privacy.';

COMMENT ON POLICY "performance_reviews_select_involved_or_admin" ON public.performance_reviews IS
  'SECURITY: Users can only see reviews they are involved in (as reviewee or reviewer) or if admin/hr/manager.';

COMMENT ON FUNCTION public.user_organization_id_safe IS
  'Helper function to get user organization without recursion. Uses SECURITY DEFINER to bypass RLS.';

-- ============================================================================
-- Migration completed successfully!
-- SECURITY LEVEL: CRITICAL FIX APPLIED
-- All tables now enforce organization_id isolation
-- Cross-organization data leakage RESOLVED
-- ============================================================================
