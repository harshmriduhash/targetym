-- ============================================================================
-- Migration: Row Level Security (RLS) Policies for KPIs Module
-- Created: 2025-10-11
-- Description: Comprehensive RLS policies for KPIs with multi-tenant isolation
-- ============================================================================

-- SECTION 1: Enable RLS on all KPI tables
-- ============================================================================

ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_alerts ENABLE ROW LEVEL SECURITY;

-- SECTION 2: Helper Functions (if not exists)
-- ============================================================================
-- Note: These functions are already defined in 20250109000000_create_complete_schema.sql
-- Commenting out to avoid parameter name conflicts

-- -- Function to get current user's organization ID
-- CREATE OR REPLACE FUNCTION get_user_organization_id()
-- RETURNS UUID AS $$
--   SELECT organization_id
--   FROM public.profiles
--   WHERE id = auth.uid()
--   LIMIT 1;
-- $$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -- Function to check if user has specific role
-- CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
-- RETURNS BOOLEAN AS $$
--   SELECT EXISTS (
--     SELECT 1
--     FROM public.profiles
--     WHERE id = auth.uid()
--     AND role = required_role
--   );
-- $$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -- Function to check if user is manager of target user
-- CREATE OR REPLACE FUNCTION is_manager_of(target_user_id UUID)
-- RETURNS BOOLEAN AS $$
--   SELECT EXISTS (
--     SELECT 1
--     FROM public.profiles
--     WHERE id = target_user_id
--     AND manager_id = auth.uid()
--   );
-- $$ LANGUAGE sql SECURITY DEFINER STABLE;

-- New function: Check if user is in same department (not in base schema)
CREATE OR REPLACE FUNCTION is_same_department(employee_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.department = p2.department
    WHERE p1.id = auth.uid()
    AND p2.id = employee_id
    AND p1.department IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- SECTION 3: RLS Policies for KPIs Table
-- ============================================================================

-- Policy: Users can view KPIs in their organization based on visibility
CREATE POLICY "Users can view organization KPIs"
  ON public.kpis
  FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND (
      -- Public/Organization visibility: everyone can see
      visibility = 'organization'
      -- Owner can always see their own KPIs
      OR owner_id = auth.uid()
      -- Team visibility: same department
      OR (visibility = 'team' AND is_same_department(owner_id))
      -- Department visibility: same department
      OR (visibility = 'department' AND is_same_department(owner_id))
      -- Admins and HR can see all
      OR has_role('admin')
      OR has_role('hr')
      -- Managers can see their reports' KPIs
      OR is_manager_of(owner_id)
    )
  );

-- Policy: Users can create KPIs in their organization
CREATE POLICY "Users can create own KPIs"
  ON public.kpis
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND (
      -- User can create KPIs for themselves
      owner_id = auth.uid()
      -- Admin/HR can create for anyone
      OR has_role('admin')
      OR has_role('hr')
      -- Managers can create for their reports
      OR is_manager_of(owner_id)
    )
  );

-- Policy: Users can update their own KPIs or if they're admin/manager
CREATE POLICY "Users can update own KPIs"
  ON public.kpis
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (
      owner_id = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR is_manager_of(owner_id)
    )
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND (
      owner_id = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR is_manager_of(owner_id)
    )
  );

-- Policy: Only admins and owners can soft delete KPIs
CREATE POLICY "Admins and owners can delete KPIs"
  ON public.kpis
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND (
      owner_id = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
    )
  );

-- SECTION 4: RLS Policies for KPI Measurements
-- ============================================================================

-- Policy: Users can view measurements for KPIs they have access to
CREATE POLICY "Users can view KPI measurements"
  ON public.kpi_measurements
  FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1
      FROM public.kpis k
      WHERE k.id = kpi_measurements.kpi_id
      AND (
        k.visibility = 'organization'
        OR k.owner_id = auth.uid()
        OR (k.visibility = 'team' AND is_same_department(k.owner_id))
        OR (k.visibility = 'department' AND is_same_department(k.owner_id))
        OR has_role('admin')
        OR has_role('hr')
        OR is_manager_of(k.owner_id)
      )
    )
  );

-- Policy: Users can add measurements to KPIs they own or have access to
CREATE POLICY "Users can create KPI measurements"
  ON public.kpi_measurements
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1
      FROM public.kpis k
      WHERE k.id = kpi_measurements.kpi_id
      AND (
        k.owner_id = auth.uid()
        OR has_role('admin')
        OR has_role('hr')
        OR is_manager_of(k.owner_id)
      )
    )
  );

-- Policy: Users can update their own measurements or if they're admin
CREATE POLICY "Users can update own KPI measurements"
  ON public.kpi_measurements
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (
      measured_by = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_measurements.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND (
      measured_by = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_measurements.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- Policy: Admins and KPI owners can delete measurements
CREATE POLICY "Admins and KPI owners can delete measurements"
  ON public.kpi_measurements
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND (
      has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_measurements.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- SECTION 5: RLS Policies for KPI Alerts
-- ============================================================================

-- Policy: Users can view alerts for KPIs they have access to
CREATE POLICY "Users can view KPI alerts"
  ON public.kpi_alerts
  FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND (
      -- User is in the notify_users array
      auth.uid() = ANY(notify_users)
      -- Or admin/HR can see all
      OR has_role('admin')
      OR has_role('hr')
      -- Or owner of the associated KPI
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_alerts.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- Policy: KPI owners and admins can create alerts
CREATE POLICY "KPI owners can create alerts"
  ON public.kpi_alerts
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND (
      has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_alerts.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- Policy: KPI owners and admins can update alerts
CREATE POLICY "KPI owners can update alerts"
  ON public.kpi_alerts
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (
      created_by = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_alerts.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND (
      created_by = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_alerts.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- Policy: KPI owners and admins can delete alerts
CREATE POLICY "KPI owners can delete alerts"
  ON public.kpi_alerts
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND (
      created_by = auth.uid()
      OR has_role('admin')
      OR has_role('hr')
      OR EXISTS (
        SELECT 1
        FROM public.kpis k
        WHERE k.id = kpi_alerts.kpi_id
        AND k.owner_id = auth.uid()
      )
    )
  );

-- SECTION 6: Service Role Bypass (for backend operations)
-- ============================================================================

-- Bypass RLS for service role on all KPI tables
ALTER TABLE public.kpis FORCE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_measurements FORCE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_alerts FORCE ROW LEVEL SECURITY;

-- SECTION 7: Grant Permissions
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_alerts TO authenticated;

-- Grant read access to views
GRANT SELECT ON public.kpis_with_latest_measurement TO authenticated;
GRANT SELECT ON public.kpi_performance_trends TO authenticated;

-- Migration Complete
COMMENT ON POLICY "Users can view organization KPIs" ON public.kpis IS
  'Multi-tenant isolation with visibility-based access control for KPIs';
