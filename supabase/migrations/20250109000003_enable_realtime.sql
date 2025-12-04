-- ============================================================================
-- Migration: Enable Realtime on Critical Tables
-- Created: 2025-01-09
-- Description: Configure Realtime subscriptions for live data sync
-- ============================================================================

-- SECTION 1: Enable Realtime Extension
-- ============================================================================

-- Ensure Realtime is enabled (usually enabled by default in Supabase)
-- This is informational as it's managed by Supabase

-- SECTION 2: Configure Realtime for Goals & OKRs
-- ============================================================================

-- Enable Realtime on goals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;

-- Enable Realtime on key_results table
ALTER PUBLICATION supabase_realtime ADD TABLE public.key_results;

-- Enable Realtime on goal_collaborators table
ALTER PUBLICATION supabase_realtime ADD TABLE public.goal_collaborators;

-- SECTION 3: Configure Realtime for Recruitment
-- ============================================================================

-- Enable Realtime on job_postings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_postings;

-- Enable Realtime on candidates table
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;

-- Enable Realtime on interviews table
ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;

-- Enable Realtime on candidate_notes table (for collaborative note-taking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_notes;

-- SECTION 4: Configure Realtime for Performance
-- ============================================================================

-- Enable Realtime on performance_reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_reviews;

-- Enable Realtime on performance_ratings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_ratings;

-- Enable Realtime on peer_feedback table
ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_feedback;

-- SECTION 5: Configure Realtime for Registry
-- ============================================================================

-- Enable Realtime on registry_components (for live component updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.registry_components;

-- Enable Realtime on registry_builds (for build status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.registry_builds;

-- Enable Realtime on registry_publications (for publication status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.registry_publications;

-- SECTION 6: Configure Realtime for Agents
-- ============================================================================

-- Enable Realtime on agent_activities (for live agent monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_activities;

-- Enable Realtime on agent_communications (for inter-agent messaging)
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_communications;

-- SECTION 7: Configure Realtime for Integrations
-- ============================================================================

-- Enable Realtime on integration_sync_logs (for sync status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.integration_sync_logs;

-- SECTION 8: Configure Realtime for Profiles
-- ============================================================================

-- Enable Realtime on profiles (for user presence and updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- SECTION 9: Create Realtime Helper Functions
-- ============================================================================

-- Function to get current user's subscriptions
CREATE OR REPLACE FUNCTION public.get_user_realtime_tables()
RETURNS TABLE (
  table_name TEXT,
  operations TEXT[]
)
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT
    tablename::TEXT AS table_name,
    ARRAY['INSERT', 'UPDATE', 'DELETE'] AS operations
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  ORDER BY tablename;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_realtime_tables() TO authenticated;

COMMENT ON FUNCTION public.get_user_realtime_tables IS 'Returns list of tables with Realtime enabled';

-- Function to check if table has Realtime enabled
CREATE OR REPLACE FUNCTION public.is_realtime_enabled(table_name_input TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = table_name_input
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_realtime_enabled(TEXT) TO authenticated;

COMMENT ON FUNCTION public.is_realtime_enabled IS 'Check if Realtime is enabled for a specific table';

-- SECTION 10: Realtime Configuration View
-- ============================================================================

CREATE OR REPLACE VIEW public.realtime_configuration AS
SELECT
  pt.schemaname,
  pt.tablename,
  t.reltuples::BIGINT AS estimated_row_count,
  pg_size_pretty(pg_total_relation_size(pt.schemaname || '.' || pt.tablename)) AS table_size,
  CASE
    WHEN pt.tablename IN ('goals', 'candidates', 'profiles', 'agent_activities') THEN 'high'
    WHEN pt.tablename IN ('key_results', 'interviews', 'registry_builds') THEN 'medium'
    ELSE 'low'
  END AS realtime_priority,
  ARRAY['INSERT', 'UPDATE', 'DELETE'] AS enabled_operations
FROM pg_publication_tables pt
JOIN pg_class t ON t.relname = pt.tablename
WHERE pt.pubname = 'supabase_realtime'
AND pt.schemaname = 'public'
ORDER BY
  CASE
    WHEN pt.tablename IN ('goals', 'candidates', 'profiles', 'agent_activities') THEN 1
    WHEN pt.tablename IN ('key_results', 'interviews', 'registry_builds') THEN 2
    ELSE 3
  END,
  pt.tablename;

GRANT SELECT ON public.realtime_configuration TO authenticated;

COMMENT ON VIEW public.realtime_configuration IS 'Overview of Realtime configuration and priorities';

-- SECTION 11: Realtime Event Types (for client-side)
-- ============================================================================

-- Create a type for Realtime event payload (informational)
COMMENT ON SCHEMA public IS 'Realtime Events:
- INSERT: Triggered when new row is inserted
- UPDATE: Triggered when existing row is updated
- DELETE: Triggered when row is deleted
- *: Subscribe to all events

Event Filters:
- Use RLS policies to filter events based on user permissions
- Subscribe with filters: .eq(), .in(), .filter()
- Example: supabase.channel().on("postgres_changes", { event: "INSERT", schema: "public", table: "goals", filter: "organization_id=eq.uuid" })
';

-- SECTION 12: Performance Optimization for Realtime
-- ============================================================================

-- Create indexes for Realtime queries (if not already exist)
CREATE INDEX IF NOT EXISTS idx_goals_updated_at ON public.goals(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_updated_at ON public.candidates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_registry_builds_created_at ON public.registry_builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON public.agent_activities(created_at DESC);

-- SECTION 13: Realtime Rate Limiting (advisory)
-- ============================================================================

COMMENT ON TABLE public.goals IS 'Realtime enabled. Rate limit: Use throttle on client-side subscriptions.';
COMMENT ON TABLE public.candidates IS 'Realtime enabled. Consider debouncing UI updates.';
COMMENT ON TABLE public.agent_activities IS 'Realtime enabled. High-frequency updates expected.';

-- Migration Complete
COMMENT ON SCHEMA public IS 'Targetym - Realtime enabled on 17 critical tables';

-- Show Realtime configuration
SELECT
  tablename,
  estimated_row_count,
  table_size,
  realtime_priority
FROM public.realtime_configuration
ORDER BY
  CASE realtime_priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    ELSE 3
  END,
  tablename;
