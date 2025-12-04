-- =====================================================
-- FULL-TEXT SEARCH OPTIMIZATION WITH TS_VECTOR
-- Improves search performance drastically
-- =====================================================

-- Extension required for ts_vector (already enabled normally)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- EMPLOYEES: Recherche full-text sur noms et emails
-- =====================================================

-- Ajouter colonne ts_vector pour employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(email, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(role, '')), 'C') ||
  setweight(to_tsvector('french', coalesce(department, '')), 'C')
) STORED;

-- Index GIN pour recherche ultra-rapide
CREATE INDEX IF NOT EXISTS idx_employees_search_vector
ON employees USING gin(search_vector);

-- Optimized search function for employees
CREATE OR REPLACE FUNCTION search_employees_fts(
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
  phone TEXT,
  role TEXT,
  department TEXT,
  status TEXT,
  hire_date DATE,
  location TEXT,
  avatar_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.role,
    e.department,
    e.status,
    e.hire_date,
    e.location,
    e.avatar_url,
    ts_rank(e.search_vector, websearch_to_tsquery('french', search_term)) AS rank
  FROM employees e
  WHERE
    e.organization_id = org_id
    AND e.search_vector @@ websearch_to_tsquery('french', search_term)
  ORDER BY rank DESC, e.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTICES: Recherche full-text sur titre et contenu
-- =====================================================

-- Ajouter colonne ts_vector pour notices
ALTER TABLE notices
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(content, '')), 'B')
) STORED;

-- Index GIN pour notices
CREATE INDEX IF NOT EXISTS idx_notices_search_vector
ON notices USING gin(search_vector);

-- Fonction de recherche pour notices
CREATE OR REPLACE FUNCTION search_notices_fts(
  org_id UUID,
  search_term TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
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
  expires_at TIMESTAMPTZ,
  rank REAL
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
    n.expires_at,
    ts_rank(n.search_vector, websearch_to_tsquery('french', search_term)) AS rank
  FROM notices n
  WHERE
    n.organization_id = org_id
    AND n.search_vector @@ websearch_to_tsquery('french', search_term)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY rank DESC, n.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PORTAL RESOURCES: Recherche sur titre et description
-- =====================================================

-- Ajouter colonne ts_vector pour portal_resources
ALTER TABLE portal_resources
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(category, '')), 'C')
) STORED;

-- Index GIN pour portal_resources
CREATE INDEX IF NOT EXISTS idx_portal_resources_search_vector
ON portal_resources USING gin(search_vector);

-- Fonction de recherche pour resources
CREATE OR REPLACE FUNCTION search_portal_resources_fts(
  org_id UUID,
  search_term TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  category TEXT,
  url TEXT,
  thumbnail_url TEXT,
  featured BOOLEAN,
  views INT,
  published_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.description,
    r.type,
    r.category,
    r.url,
    r.thumbnail_url,
    r.featured,
    r.views,
    r.published_at,
    ts_rank(r.search_vector, websearch_to_tsquery('french', search_term)) AS rank
  FROM portal_resources r
  WHERE
    r.organization_id = org_id
    AND r.search_vector @@ websearch_to_tsquery('french', search_term)
  ORDER BY rank DESC, r.published_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RECHERCHE GLOBALE: Tous les modules
-- =====================================================

-- Fonction de recherche globale cross-modules
CREATE OR REPLACE FUNCTION search_all_fts(
  org_id UUID,
  search_term TEXT,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  module TEXT,
  id UUID,
  title TEXT,
  snippet TEXT,
  rank REAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  -- Employees
  SELECT
    'employees'::TEXT AS module,
    e.id,
    (e.first_name || ' ' || e.last_name)::TEXT AS title,
    (e.role || ' - ' || e.department)::TEXT AS snippet,
    ts_rank(e.search_vector, websearch_to_tsquery('french', search_term)) AS rank,
    e.created_at
  FROM employees e
  WHERE
    e.organization_id = org_id
    AND e.search_vector @@ websearch_to_tsquery('french', search_term)

  UNION ALL

  -- Notices
  SELECT
    'notices'::TEXT AS module,
    n.id,
    n.title,
    LEFT(n.content, 100)::TEXT AS snippet,
    ts_rank(n.search_vector, websearch_to_tsquery('french', search_term)) AS rank,
    n.created_at
  FROM notices n
  WHERE
    n.organization_id = org_id
    AND n.search_vector @@ websearch_to_tsquery('french', search_term)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())

  UNION ALL

  -- Portal Resources
  SELECT
    'resources'::TEXT AS module,
    r.id,
    r.title,
    COALESCE(LEFT(r.description, 100), r.category)::TEXT AS snippet,
    ts_rank(r.search_vector, websearch_to_tsquery('french', search_term)) AS rank,
    r.published_at AS created_at
  FROM portal_resources r
  WHERE
    r.organization_id = org_id
    AND r.search_vector @@ websearch_to_tsquery('french', search_term)

  ORDER BY rank DESC, created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction de suggestion de recherche (autocomplete)
CREATE OR REPLACE FUNCTION search_suggestions(
  org_id UUID,
  search_term TEXT,
  result_limit INT DEFAULT 5
)
RETURNS TABLE (
  suggestion TEXT,
  module TEXT
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Suggestions depuis employees
    SELECT DISTINCT
      (e.first_name || ' ' || e.last_name)::TEXT AS suggestion,
      'employees'::TEXT AS module
    FROM employees e
    WHERE
      e.organization_id = org_id
      AND (
        e.first_name ILIKE search_term || '%' OR
        e.last_name ILIKE search_term || '%'
      )
    LIMIT result_limit / 3
  )

  UNION ALL

  (
    -- Suggestions depuis notices
    SELECT DISTINCT
      n.title::TEXT AS suggestion,
      'notices'::TEXT AS module
    FROM notices n
    WHERE
      n.organization_id = org_id
      AND n.title ILIKE search_term || '%'
      AND (n.expires_at IS NULL OR n.expires_at > NOW())
    LIMIT result_limit / 3
  )

  UNION ALL

  (
    -- Suggestions depuis resources
    SELECT DISTINCT
      r.title::TEXT AS suggestion,
      'resources'::TEXT AS module
    FROM portal_resources r
    WHERE
      r.organization_id = org_id
      AND r.title ILIKE search_term || '%'
    LIMIT result_limit / 3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STATISTIQUES DE RECHERCHE
-- =====================================================

-- Table pour tracker les recherches populaires
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  search_term TEXT NOT NULL,
  module TEXT,
  results_count INT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_org
ON search_analytics(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_term
ON search_analytics(organization_id, search_term);

-- Fonction pour logger les recherches
CREATE OR REPLACE FUNCTION log_search(
  org_id UUID,
  term TEXT,
  module_name TEXT DEFAULT NULL,
  results INT DEFAULT 0,
  uid UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO search_analytics (
    organization_id,
    search_term,
    module,
    results_count,
    user_id
  ) VALUES (
    org_id,
    term,
    module_name,
    results,
    uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION search_employees_fts IS 'Optimized full-text search for employees with ranking';
COMMENT ON FUNCTION search_notices_fts IS 'Full-text search for notices with automatic expiration filtering';
COMMENT ON FUNCTION search_portal_resources_fts IS 'Full-text search for portal resources';
COMMENT ON FUNCTION search_all_fts IS 'Global cross-module search with unified ranking';
COMMENT ON FUNCTION search_suggestions IS 'Autocomplete suggestions for search bar';
COMMENT ON FUNCTION log_search IS 'Log searches for analytics';

COMMENT ON COLUMN employees.search_vector IS 'Automatically generated search vector (first_name, last_name, email, role, department)';
COMMENT ON COLUMN notices.search_vector IS 'Automatically generated search vector (title, content)';
COMMENT ON COLUMN portal_resources.search_vector IS 'Automatically generated search vector (title, description, category)';
