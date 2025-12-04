-- ============================================================================
-- Migration: Complete RLS Policies for All Tables
-- Created: 2025-01-09
-- Description: Row-Level Security policies for all Targetym tables
-- ============================================================================

-- SECTION 1: Enable RLS on All Tables
-- ============================================================================

ALTER TABLE public.registry_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SECTION 2: Registry Components Policies
-- ============================================================================

-- Global registry components (no organization_id) are public read-only
CREATE POLICY registry_components_select_global ON public.registry_components
  FOR SELECT
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());

CREATE POLICY registry_components_select_org ON public.registry_components
  FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY registry_components_insert ON public.registry_components
  FOR INSERT
  WITH CHECK (
    organization_id IS NULL AND public.has_any_role(ARRAY['admin'])
    OR organization_id = public.get_user_organization_id() AND public.has_any_role(ARRAY['admin', 'hr'])
  );

CREATE POLICY registry_components_update ON public.registry_components
  FOR UPDATE
  USING (
    organization_id IS NULL AND public.has_role('admin')
    OR organization_id = public.get_user_organization_id() AND public.has_any_role(ARRAY['admin', 'hr'])
  );

CREATE POLICY registry_components_delete ON public.registry_components
  FOR DELETE
  USING (public.has_role('admin'));

-- SECTION 3: Registry Examples Policies
-- ============================================================================

CREATE POLICY registry_examples_select ON public.registry_examples
  FOR SELECT
  USING (true); -- Examples are public

CREATE POLICY registry_examples_insert ON public.registry_examples
  FOR INSERT
  WITH CHECK (public.has_any_role(ARRAY['admin', 'hr']));

CREATE POLICY registry_examples_update ON public.registry_examples
  FOR UPDATE
  USING (public.has_any_role(ARRAY['admin', 'hr']));

CREATE POLICY registry_examples_delete ON public.registry_examples
  FOR DELETE
  USING (public.has_role('admin'));

-- SECTION 4: Registry Builds Policies
-- ============================================================================

CREATE POLICY registry_builds_select ON public.registry_builds
  FOR SELECT
  USING (public.has_any_role(ARRAY['admin', 'hr']));

CREATE POLICY registry_builds_insert ON public.registry_builds
  FOR INSERT
  WITH CHECK (public.has_any_role(ARRAY['admin', 'hr']) AND created_by = auth.uid());

CREATE POLICY registry_builds_update ON public.registry_builds
  FOR UPDATE
  USING (public.has_any_role(ARRAY['admin', 'hr']));

-- SECTION 5: Registry Publications Policies
-- ============================================================================

CREATE POLICY registry_publications_select ON public.registry_publications
  FOR SELECT
  USING (true); -- Publications are public

CREATE POLICY registry_publications_insert ON public.registry_publications
  FOR INSERT
  WITH CHECK (public.has_role('admin') AND created_by = auth.uid());

-- SECTION 6: Agent Activities Policies
-- ============================================================================

CREATE POLICY agent_activities_select_global ON public.agent_activities
  FOR SELECT
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());

CREATE POLICY agent_activities_insert ON public.agent_activities
  FOR INSERT
  WITH CHECK (
    organization_id IS NULL
    OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY agent_activities_update ON public.agent_activities
  FOR UPDATE
  USING (
    organization_id IS NULL
    OR organization_id = public.get_user_organization_id()
  );

-- SECTION 7: Agent Communications Policies
-- ============================================================================

CREATE POLICY agent_communications_select ON public.agent_communications
  FOR SELECT
  USING (true); -- All agents can read communications

CREATE POLICY agent_communications_insert ON public.agent_communications
  FOR INSERT
  WITH CHECK (true); -- All agents can send communications

CREATE POLICY agent_communications_update ON public.agent_communications
  FOR UPDATE
  USING (true); -- Agents can update their communications (e.g., mark as responded)

-- SECTION 8: Integrations Policies
-- ============================================================================

CREATE POLICY integrations_select ON public.integrations
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_any_role(ARRAY['admin', 'hr'])
  );

CREATE POLICY integrations_insert ON public.integrations
  FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_any_role(ARRAY['admin', 'hr'])
    AND created_by = auth.uid()
  );

CREATE POLICY integrations_update ON public.integrations
  FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_any_role(ARRAY['admin', 'hr'])
  );

CREATE POLICY integrations_delete ON public.integrations
  FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_role('admin')
  );

-- SECTION 9: Integration Webhooks Policies
-- ============================================================================

CREATE POLICY integration_webhooks_select ON public.integration_webhooks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_webhooks.integration_id
      AND organization_id = public.get_user_organization_id()
      AND public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY integration_webhooks_insert ON public.integration_webhooks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_webhooks.integration_id
      AND organization_id = public.get_user_organization_id()
      AND public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY integration_webhooks_update ON public.integration_webhooks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_webhooks.integration_id
      AND organization_id = public.get_user_organization_id()
      AND public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY integration_webhooks_delete ON public.integration_webhooks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_webhooks.integration_id
      AND organization_id = public.get_user_organization_id()
      AND public.has_role('admin')
    )
  );

-- SECTION 10: Integration Sync Logs Policies
-- ============================================================================

CREATE POLICY integration_sync_logs_select ON public.integration_sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_sync_logs.integration_id
      AND organization_id = public.get_user_organization_id()
      AND public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY integration_sync_logs_insert ON public.integration_sync_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_sync_logs.integration_id
      AND organization_id = public.get_user_organization_id()
    )
  );

-- SECTION 11: Audit Logs Policies
-- ============================================================================

CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    AND (
      user_id = auth.uid()
      OR public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    organization_id IS NULL
    OR organization_id = public.get_user_organization_id()
  );

-- No update or delete on audit logs - they're append-only

-- SECTION 12: Additional Helper Functions for Registry
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_component_accessible(comp_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registry_components
    WHERE id = comp_id
    AND (
      organization_id IS NULL -- Global component
      OR organization_id = public.get_user_organization_id() -- Org component
    )
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_component_accessible(UUID) TO authenticated;

-- SECTION 13: Trigger for Audit Logging
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      new_values
    ) VALUES (
      COALESCE(NEW.organization_id, public.get_user_organization_id()),
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
      COALESCE(NEW.organization_id, public.get_user_organization_id()),
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
      COALESCE(OLD.organization_id, public.get_user_organization_id()),
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

-- Apply audit triggers to key tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'organizations', 'profiles', 'goals', 'job_postings', 'candidates',
      'performance_reviews', 'integrations', 'registry_components'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS audit_%I_changes ON public.%I;
      CREATE TRIGGER audit_%I_changes
        AFTER INSERT OR UPDATE OR DELETE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.log_audit_changes();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- Migration Complete
COMMENT ON TABLE public.registry_components IS 'Component registry with accessibility and quality metrics';
COMMENT ON TABLE public.agent_activities IS 'AI agent task tracking and orchestration';
COMMENT ON TABLE public.integrations IS 'Third-party service integrations (Microsoft 365, Asana, Notion, etc.)';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all important operations';
