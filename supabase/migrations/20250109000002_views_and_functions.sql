-- ============================================================================
-- Migration: Advanced Views and Functions
-- Created: 2025-01-09
-- Description: Database views, materialized views, and utility functions
-- ============================================================================

-- SECTION 1: Goals & OKRs Views
-- ============================================================================

CREATE OR REPLACE VIEW public.goals_with_progress AS
SELECT
  g.*,
  COALESCE(AVG(kr.progress_percentage), 0)::INTEGER AS calculated_progress,
  COUNT(kr.id) AS total_key_results,
  COUNT(kr.id) FILTER (WHERE kr.status = 'achieved') AS completed_key_results,
  p.full_name AS owner_name,
  p.avatar_url AS owner_avatar,
  CASE
    WHEN g.end_date IS NOT NULL AND g.end_date < CURRENT_DATE THEN 'overdue'
    WHEN g.progress_percentage >= 100 THEN 'completed'
    WHEN g.progress_percentage >= 75 THEN 'on_track'
    WHEN g.progress_percentage >= 50 THEN 'needs_attention'
    ELSE 'at_risk'
  END AS health_status
FROM public.goals g
LEFT JOIN public.key_results kr ON kr.goal_id = g.id
LEFT JOIN public.profiles p ON p.id = g.owner_id
WHERE g.deleted_at IS NULL
GROUP BY g.id, p.full_name, p.avatar_url;

COMMENT ON VIEW public.goals_with_progress IS 'Goals with calculated progress and health status';

-- SECTION 2: Recruitment Views
-- ============================================================================

CREATE OR REPLACE VIEW public.job_postings_with_stats AS
SELECT
  jp.*,
  COUNT(c.id) AS total_candidates,
  COUNT(c.id) FILTER (WHERE c.status = 'applied') AS applied_count,
  COUNT(c.id) FILTER (WHERE c.status = 'screening') AS screening_count,
  COUNT(c.id) FILTER (WHERE c.status = 'interview') AS interview_count,
  COUNT(c.id) FILTER (WHERE c.status = 'offer') AS offer_count,
  COUNT(c.id) FILTER (WHERE c.status = 'hired') AS hired_count,
  COUNT(c.id) FILTER (WHERE c.status = 'rejected') AS rejected_count,
  AVG(c.ai_cv_score) AS avg_candidate_score,
  p.full_name AS created_by_name,
  hm.full_name AS hiring_manager_name
FROM public.job_postings jp
LEFT JOIN public.candidates c ON c.job_posting_id = jp.id
LEFT JOIN public.profiles p ON p.id = jp.created_by
LEFT JOIN public.profiles hm ON hm.id = jp.hiring_manager_id
GROUP BY jp.id, p.full_name, hm.full_name;

COMMENT ON VIEW public.job_postings_with_stats IS 'Job postings with candidate pipeline statistics';

CREATE OR REPLACE VIEW public.candidates_with_details AS
SELECT
  c.*,
  jp.title AS job_title,
  jp.department AS job_department,
  COUNT(i.id) AS total_interviews,
  COUNT(i.id) FILTER (WHERE i.status = 'completed') AS completed_interviews,
  AVG(i.rating) AS avg_interview_rating,
  MAX(i.scheduled_at) AS last_interview_date
FROM public.candidates c
LEFT JOIN public.job_postings jp ON jp.id = c.job_posting_id
LEFT JOIN public.interviews i ON i.candidate_id = c.id
GROUP BY c.id, jp.title, jp.department;

COMMENT ON VIEW public.candidates_with_details IS 'Candidates with job and interview details';

-- SECTION 3: Performance Management Views
-- ============================================================================

CREATE OR REPLACE VIEW public.performance_review_summary AS
SELECT
  pr.*,
  reviewee.full_name AS reviewee_name,
  reviewee.avatar_url AS reviewee_avatar,
  reviewee.job_title AS reviewee_title,
  reviewee.department AS reviewee_department,
  reviewer.full_name AS reviewer_name,
  COUNT(prt.id) AS total_criteria_rated,
  AVG(prt.rating) AS avg_criteria_rating,
  COUNT(pf.id) AS peer_feedback_count,
  COUNT(pg.id) AS performance_goals_count
FROM public.performance_reviews pr
LEFT JOIN public.profiles reviewee ON reviewee.id = pr.reviewee_id
LEFT JOIN public.profiles reviewer ON reviewer.id = pr.reviewer_id
LEFT JOIN public.performance_ratings prt ON prt.review_id = pr.id
LEFT JOIN public.peer_feedback pf ON pf.review_id = pr.id
LEFT JOIN public.performance_goals pg ON pg.review_id = pr.id
GROUP BY pr.id, reviewee.full_name, reviewee.avatar_url, reviewee.job_title, reviewee.department, reviewer.full_name;

COMMENT ON VIEW public.performance_review_summary IS 'Performance reviews with aggregated ratings and feedback';

-- SECTION 4: Registry Views
-- ============================================================================

CREATE OR REPLACE VIEW public.registry_component_stats AS
SELECT
  category,
  COUNT(*) AS total_components,
  COUNT(*) FILTER (WHERE is_published) AS published_components,
  COUNT(*) FILTER (WHERE deprecated_at IS NOT NULL) AS deprecated_components,
  AVG(bundle_size_kb) AS avg_bundle_size,
  AVG(test_coverage_percentage) AS avg_test_coverage,
  COUNT(*) FILTER (WHERE accessibility_level = 'AAA') AS aaa_components,
  COUNT(*) FILTER (WHERE accessibility_level = 'AA') AS aa_components,
  COUNT(*) FILTER (WHERE has_aria_support) AS aria_supported,
  COUNT(*) FILTER (WHERE has_keyboard_nav) AS keyboard_nav_supported
FROM public.registry_components
GROUP BY category;

COMMENT ON VIEW public.registry_component_stats IS 'Registry statistics by category';

CREATE OR REPLACE VIEW public.registry_latest_build AS
SELECT
  rb.*,
  p.full_name AS created_by_name,
  COUNT(rp.id) AS publication_count
FROM public.registry_builds rb
LEFT JOIN public.profiles p ON p.id = rb.created_by
LEFT JOIN public.registry_publications rp ON rp.build_id = rb.id
WHERE rb.status = 'success'
GROUP BY rb.id, p.full_name
ORDER BY rb.created_at DESC
LIMIT 1;

COMMENT ON VIEW public.registry_latest_build IS 'Latest successful registry build';

-- SECTION 5: Agent Activity Views
-- ============================================================================

CREATE OR REPLACE VIEW public.agent_activity_summary AS
SELECT
  agent_type,
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_tasks,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tasks,
  COUNT(*) FILTER (WHERE status = 'blocked') AS blocked_tasks,
  AVG(duration_seconds) FILTER (WHERE status = 'completed') AS avg_duration_seconds,
  MAX(created_at) AS last_activity_at
FROM public.agent_activities
GROUP BY agent_type;

COMMENT ON VIEW public.agent_activity_summary IS 'Agent performance metrics and activity summary';

-- SECTION 6: Integration Views
-- ============================================================================

CREATE OR REPLACE VIEW public.integrations_health AS
SELECT
  i.*,
  p.full_name AS created_by_name,
  COUNT(isl.id) AS total_syncs,
  COUNT(isl.id) FILTER (WHERE isl.status = 'success') AS successful_syncs,
  COUNT(isl.id) FILTER (WHERE isl.status = 'failed') AS failed_syncs,
  MAX(isl.started_at) AS last_sync_attempt,
  CASE
    WHEN i.error_count = 0 AND i.is_active THEN 'healthy'
    WHEN i.error_count > 0 AND i.error_count < 5 AND i.is_active THEN 'warning'
    WHEN i.error_count >= 5 OR NOT i.is_active THEN 'critical'
    ELSE 'unknown'
  END AS health_status
FROM public.integrations i
LEFT JOIN public.profiles p ON p.id = i.created_by
LEFT JOIN public.integration_sync_logs isl ON isl.integration_id = i.id
GROUP BY i.id, p.full_name;

COMMENT ON VIEW public.integrations_health IS 'Integration health status and sync statistics';

-- SECTION 7: Organization Dashboard View
-- ============================================================================

CREATE OR REPLACE VIEW public.organization_dashboard AS
SELECT
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_tier,

  -- User Stats
  COUNT(DISTINCT p.id) AS total_employees,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'manager') AS total_managers,
  COUNT(DISTINCT p.id) FILTER (WHERE p.employment_status = 'active') AS active_employees,

  -- Goals Stats
  COUNT(DISTINCT g.id) AS total_goals,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'active') AS active_goals,
  AVG(g.progress_percentage) AS avg_goal_progress,

  -- Recruitment Stats
  COUNT(DISTINCT jp.id) AS total_job_postings,
  COUNT(DISTINCT jp.id) FILTER (WHERE jp.status = 'published') AS open_positions,
  COUNT(DISTINCT c.id) AS total_candidates,

  -- Performance Stats
  COUNT(DISTINCT pr.id) AS total_reviews,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'completed') AS completed_reviews,
  AVG(pr.overall_rating) AS avg_performance_rating,

  -- Registry Stats
  COUNT(DISTINCT rc.id) AS total_components,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.is_published) AS published_components

FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id
LEFT JOIN public.goals g ON g.organization_id = o.id AND g.deleted_at IS NULL
LEFT JOIN public.job_postings jp ON jp.organization_id = o.id
LEFT JOIN public.candidates c ON c.organization_id = o.id
LEFT JOIN public.performance_reviews pr ON pr.organization_id = o.id
LEFT JOIN public.registry_components rc ON rc.organization_id = o.id
GROUP BY o.id;

COMMENT ON VIEW public.organization_dashboard IS 'Comprehensive organization metrics and KPIs';

-- SECTION 8: Utility Functions
-- ============================================================================

-- Function: Calculate OKR Health Score
CREATE OR REPLACE FUNCTION public.calculate_okr_health_score(goal_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql STABLE AS $$
DECLARE
  progress INTEGER;
  end_date DATE;
  days_remaining INTEGER;
  health_score INTEGER;
BEGIN
  SELECT g.progress_percentage, g.end_date
  INTO progress, end_date
  FROM public.goals g
  WHERE g.id = goal_id;

  IF end_date IS NULL THEN
    RETURN 50; -- Neutral score for goals without end date
  END IF;

  days_remaining := end_date - CURRENT_DATE;

  -- Calculate health score based on progress and time remaining
  IF days_remaining < 0 THEN
    -- Overdue
    health_score := GREATEST(0, progress - 50);
  ELSIF days_remaining = 0 THEN
    health_score := progress;
  ELSE
    -- Compare actual progress vs expected progress
    DECLARE
      expected_progress NUMERIC;
      total_days INTEGER;
      days_passed INTEGER;
    BEGIN
      SELECT g.end_date - g.start_date INTO total_days
      FROM public.goals g WHERE g.id = goal_id;

      days_passed := total_days - days_remaining;
      expected_progress := (days_passed::NUMERIC / total_days * 100);

      -- Health score is actual vs expected
      health_score := LEAST(100, GREATEST(0,
        50 + (progress - expected_progress)::INTEGER
      ));
    END;
  END IF;

  RETURN health_score;
END;
$$;

COMMENT ON FUNCTION public.calculate_okr_health_score IS 'Calculate health score for a goal based on progress and timeline';

-- Function: Get Team Performance Trend
CREATE OR REPLACE FUNCTION public.get_team_performance_trend(team_id UUID, months INTEGER DEFAULT 6)
RETURNS TABLE (
  month TEXT,
  avg_rating NUMERIC,
  review_count BIGINT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    TO_CHAR(pr.completed_at, 'YYYY-MM') AS month,
    AVG(pr.overall_rating) AS avg_rating,
    COUNT(*) AS review_count
  FROM public.performance_reviews pr
  JOIN public.profiles p ON p.id = pr.reviewee_id
  WHERE p.manager_id = team_id
    AND pr.completed_at >= CURRENT_DATE - (months || ' months')::INTERVAL
    AND pr.status = 'completed'
  GROUP BY TO_CHAR(pr.completed_at, 'YYYY-MM')
  ORDER BY month DESC;
$$;

COMMENT ON FUNCTION public.get_team_performance_trend IS 'Get performance rating trends for a team';

-- Function: Get Recruitment Funnel Metrics
CREATE OR REPLACE FUNCTION public.get_recruitment_funnel(job_id UUID DEFAULT NULL, org_id UUID DEFAULT NULL)
RETURNS TABLE (
  stage TEXT,
  candidate_count BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE SQL STABLE AS $$
  WITH stage_counts AS (
    SELECT
      c.status,
      COUNT(*) AS count
    FROM public.candidates c
    WHERE (job_id IS NULL OR c.job_posting_id = job_id)
      AND (org_id IS NULL OR c.organization_id = org_id)
    GROUP BY c.status
  ),
  total AS (
    SELECT SUM(count) AS total_count FROM stage_counts
  )
  SELECT
    sc.status AS stage,
    sc.count AS candidate_count,
    ROUND((sc.count::NUMERIC / t.total_count * 100), 2) AS conversion_rate
  FROM stage_counts sc
  CROSS JOIN total t
  ORDER BY
    CASE sc.status
      WHEN 'applied' THEN 1
      WHEN 'screening' THEN 2
      WHEN 'interview' THEN 3
      WHEN 'offer' THEN 4
      WHEN 'hired' THEN 5
      ELSE 6
    END;
$$;

COMMENT ON FUNCTION public.get_recruitment_funnel IS 'Get recruitment funnel metrics with conversion rates';

-- Function: Get Agent Performance Metrics
CREATE OR REPLACE FUNCTION public.get_agent_performance(
  agent TEXT DEFAULT NULL,
  days INTEGER DEFAULT 30
)
RETURNS TABLE (
  agent_type TEXT,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  failed_tasks BIGINT,
  avg_duration_seconds NUMERIC,
  success_rate NUMERIC
)
LANGUAGE SQL STABLE AS $$
  SELECT
    aa.agent_type,
    COUNT(*) AS total_tasks,
    COUNT(*) FILTER (WHERE aa.status = 'completed') AS completed_tasks,
    COUNT(*) FILTER (WHERE aa.status = 'failed') AS failed_tasks,
    AVG(aa.duration_seconds) FILTER (WHERE aa.status = 'completed') AS avg_duration_seconds,
    ROUND(
      COUNT(*) FILTER (WHERE aa.status = 'completed')::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) AS success_rate
  FROM public.agent_activities aa
  WHERE (agent IS NULL OR aa.agent_type = agent)
    AND aa.created_at >= CURRENT_DATE - (days || ' days')::INTERVAL
  GROUP BY aa.agent_type
  ORDER BY success_rate DESC;
$$;

COMMENT ON FUNCTION public.get_agent_performance IS 'Get AI agent performance metrics';

-- SECTION 9: Materialized Views for Performance
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_organization_metrics AS
SELECT
  organization_id,
  organization_name,
  total_employees,
  active_employees,
  total_goals,
  active_goals,
  avg_goal_progress,
  total_job_postings,
  open_positions,
  total_candidates,
  total_reviews,
  completed_reviews,
  avg_performance_rating,
  NOW() AS last_refreshed
FROM public.organization_dashboard;

CREATE UNIQUE INDEX ON public.mv_organization_metrics (organization_id);

COMMENT ON MATERIALIZED VIEW public.mv_organization_metrics IS 'Cached organization metrics for dashboard performance';

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_organization_metrics;
END;
$$;

-- Schedule refresh (requires pg_cron extension in production)
-- SELECT cron.schedule('refresh-mv', '0 * * * *', 'SELECT public.refresh_materialized_views();');

-- SECTION 10: Grant Permissions
-- ============================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- Views are tables in PostgreSQL, so the above GRANT covers views as well
GRANT SELECT ON public.mv_organization_metrics TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Migration Complete
COMMENT ON SCHEMA public IS 'Targetym HR Platform - Views and Functions v1.0';
