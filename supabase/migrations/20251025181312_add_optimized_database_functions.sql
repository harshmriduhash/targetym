-- =====================================================
-- OPTIMIZED DATABASE FUNCTIONS FOR BACKEND ALGORITHMS
-- =====================================================

-- Enable pg_trgm extension for trigram indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function: Atomic increment for notice views
-- This function ensures thread-safe increments without race conditions
CREATE OR REPLACE FUNCTION increment_notice_views(notice_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notices
  SET views = views + 1
  WHERE id = notice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Atomic increment for FAQ helpful count
CREATE OR REPLACE FUNCTION increment_faq_helpful(faq_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE faqs
  SET helpful_count = helpful_count + 1
  WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get employee statistics (optimized aggregation)
CREATE OR REPLACE FUNCTION get_employee_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'on_leave', COUNT(*) FILTER (WHERE status = 'on-leave'),
    'inactive', COUNT(*) FILTER (WHERE status = 'inactive'),
    'by_department', (
      SELECT json_object_agg(department, count)
      FROM (
        SELECT department, COUNT(*) as count
        FROM employees
        WHERE organization_id = org_id
        GROUP BY department
      ) dept_counts
    )
  )
  INTO result
  FROM employees
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get notice statistics (optimized aggregation)
CREATE OR REPLACE FUNCTION get_notice_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (
      WHERE expires_at IS NULL OR expires_at > NOW()
    ),
    'expired', COUNT(*) FILTER (
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
    ),
    'by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM notices
        WHERE organization_id = org_id
        GROUP BY type
      ) type_counts
    ),
    'by_priority', (
      SELECT json_object_agg(priority, count)
      FROM (
        SELECT priority, COUNT(*) as count
        FROM notices
        WHERE organization_id = org_id
        GROUP BY priority
      ) priority_counts
    )
  )
  INTO result
  FROM notices
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get portal resource statistics (optimized aggregation)
CREATE OR REPLACE FUNCTION get_resource_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'featured', COUNT(*) FILTER (WHERE featured = true),
    'total_views', COALESCE(SUM(views), 0),
    'by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM portal_resources
        WHERE organization_id = org_id
        GROUP BY type
      ) type_counts
    ),
    'by_category', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM portal_resources
        WHERE organization_id = org_id
        GROUP BY category
      ) category_counts
    )
  )
  INTO result
  FROM portal_resources
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search employees with full-text search (future optimization)
-- This prepares for ts_vector implementation
CREATE OR REPLACE FUNCTION search_employees(
  org_id UUID,
  search_term TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  status TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.role,
    e.department,
    e.status,
    -- Calculate similarity score for ranking
    CASE
      WHEN e.first_name ILIKE search_term || '%' THEN 1.0
      WHEN e.last_name ILIKE search_term || '%' THEN 0.9
      WHEN e.email ILIKE search_term || '%' THEN 0.8
      WHEN e.first_name ILIKE '%' || search_term || '%' THEN 0.5
      WHEN e.last_name ILIKE '%' || search_term || '%' THEN 0.4
      ELSE 0.3
    END AS similarity
  FROM employees e
  WHERE e.organization_id = org_id
    AND (
      e.first_name ILIKE '%' || search_term || '%' OR
      e.last_name ILIKE '%' || search_term || '%' OR
      e.email ILIKE '%' || search_term || '%'
    )
  ORDER BY similarity DESC, e.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk status update for employees (optimized)
CREATE OR REPLACE FUNCTION bulk_update_employee_status(
  employee_ids UUID[],
  org_id UUID,
  new_status TEXT
)
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE employees
  SET
    status = new_status,
    updated_at = NOW()
  WHERE
    id = ANY(employee_ids)
    AND organization_id = org_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Archive expired notices (cleanup optimization)
CREATE OR REPLACE FUNCTION archive_expired_notices(org_id UUID)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM notices
  WHERE
    organization_id = org_id
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get urgent notices (optimized query)
CREATE OR REPLACE FUNCTION get_urgent_notices(
  org_id UUID,
  result_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  priority TEXT,
  author_id UUID,
  department TEXT,
  views INT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.content,
    n.type,
    n.priority,
    n.author_id,
    n.department,
    n.views,
    n.created_at,
    n.expires_at
  FROM notices n
  WHERE
    n.organization_id = org_id
    AND n.type = 'urgent'
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERFORMANCE INDEXES FOR OPTIMIZED QUERIES
-- =====================================================

-- Composite index for employee search optimization
CREATE INDEX IF NOT EXISTS idx_employees_search
ON employees (organization_id, status, department);

-- Index for employee name searches
CREATE INDEX IF NOT EXISTS idx_employees_names
ON employees USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Composite index for notice filtering
CREATE INDEX IF NOT EXISTS idx_notices_filtering
ON notices (organization_id, type, priority, expires_at);

-- Index for notice expiry checks
CREATE INDEX IF NOT EXISTS idx_notices_expiry
ON notices (organization_id, expires_at)
WHERE expires_at IS NOT NULL;

-- Composite index for portal resources
CREATE INDEX IF NOT EXISTS idx_portal_resources_filtering
ON portal_resources (organization_id, type, category, featured);

-- Index for popular resources (by views)
CREATE INDEX IF NOT EXISTS idx_portal_resources_views
ON portal_resources (organization_id, views DESC);

-- Index for form entries filtering
CREATE INDEX IF NOT EXISTS idx_form_entries_filtering
ON form_entries (organization_id, status, department, priority);

-- Index for support tickets status
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
ON support_tickets (organization_id, status, priority);

-- =====================================================
-- ENABLE POSTGRESQL EXTENSIONS FOR PERFORMANCE
-- =====================================================

-- Enable pg_trgm for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin for composite indexes (if not already enabled)
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION increment_notice_views IS 'Atomically increment notice view count to prevent race conditions';
COMMENT ON FUNCTION increment_faq_helpful IS 'Atomically increment FAQ helpful count';
COMMENT ON FUNCTION get_employee_stats IS 'Get aggregated employee statistics for dashboard';
COMMENT ON FUNCTION get_notice_stats IS 'Get aggregated notice statistics for dashboard';
COMMENT ON FUNCTION get_resource_stats IS 'Get aggregated portal resource statistics';
COMMENT ON FUNCTION search_employees IS 'Search employees with similarity ranking';
COMMENT ON FUNCTION bulk_update_employee_status IS 'Bulk update employee status for multiple employees';
COMMENT ON FUNCTION archive_expired_notices IS 'Archive/delete expired notices for cleanup';
COMMENT ON FUNCTION get_urgent_notices IS 'Get urgent active notices for dashboard';
