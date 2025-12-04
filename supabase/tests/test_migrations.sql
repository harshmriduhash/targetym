-- ============================================================================
-- Test Suite: Migration Validation
-- Description: Comprehensive tests for Targetym database schema
-- ============================================================================

-- Enable required extensions for testing
CREATE EXTENSION IF NOT EXISTS pgtap;

BEGIN;

-- SECTION 1: Schema Tests
-- ============================================================================

SELECT plan(100); -- Adjust based on total tests

-- Test: All core tables exist
SELECT has_table('public', 'organizations', 'Table organizations should exist');
SELECT has_table('public', 'profiles', 'Table profiles should exist');
SELECT has_table('public', 'goals', 'Table goals should exist');
SELECT has_table('public', 'key_results', 'Table key_results should exist');
SELECT has_table('public', 'job_postings', 'Table job_postings should exist');
SELECT has_table('public', 'candidates', 'Table candidates should exist');
SELECT has_table('public', 'interviews', 'Table interviews should exist');
SELECT has_table('public', 'performance_reviews', 'Table performance_reviews should exist');
SELECT has_table('public', 'performance_ratings', 'Table performance_ratings should exist');
SELECT has_table('public', 'career_development', 'Table career_development should exist');

-- Test: Registry tables exist
SELECT has_table('public', 'registry_components', 'Table registry_components should exist');
SELECT has_table('public', 'registry_examples', 'Table registry_examples should exist');
SELECT has_table('public', 'registry_builds', 'Table registry_builds should exist');
SELECT has_table('public', 'registry_publications', 'Table registry_publications should exist');

-- Test: Agent tables exist
SELECT has_table('public', 'agent_activities', 'Table agent_activities should exist');
SELECT has_table('public', 'agent_communications', 'Table agent_communications should exist');

-- Test: Integration tables exist
SELECT has_table('public', 'integrations', 'Table integrations should exist');
SELECT has_table('public', 'integration_webhooks', 'Table integration_webhooks should exist');
SELECT has_table('public', 'integration_sync_logs', 'Table integration_sync_logs should exist');

-- Test: Audit table exists
SELECT has_table('public', 'audit_logs', 'Table audit_logs should exist');

-- SECTION 2: Column Tests
-- ============================================================================

-- Test: Organizations columns
SELECT has_column('public', 'organizations', 'id', 'organizations should have id');
SELECT has_column('public', 'organizations', 'name', 'organizations should have name');
SELECT has_column('public', 'organizations', 'slug', 'organizations should have slug');
SELECT has_column('public', 'organizations', 'subscription_tier', 'organizations should have subscription_tier');
SELECT has_column('public', 'organizations', 'created_at', 'organizations should have created_at');

-- Test: Profiles columns
SELECT has_column('public', 'profiles', 'id', 'profiles should have id');
SELECT has_column('public', 'profiles', 'organization_id', 'profiles should have organization_id');
SELECT has_column('public', 'profiles', 'email', 'profiles should have email');
SELECT has_column('public', 'profiles', 'role', 'profiles should have role');
SELECT has_column('public', 'profiles', 'full_name', 'profiles should have full_name (generated)');

-- Test: Registry Components columns
SELECT has_column('public', 'registry_components', 'component_id', 'registry_components should have component_id');
SELECT has_column('public', 'registry_components', 'category', 'registry_components should have category');
SELECT has_column('public', 'registry_components', 'accessibility_level', 'registry_components should have accessibility_level');
SELECT has_column('public', 'registry_components', 'is_published', 'registry_components should have is_published');

-- SECTION 3: Constraint Tests
-- ============================================================================

-- Test: Primary keys
SELECT has_pk('public', 'organizations', 'organizations should have primary key');
SELECT has_pk('public', 'profiles', 'profiles should have primary key');
SELECT has_pk('public', 'goals', 'goals should have primary key');
SELECT has_pk('public', 'registry_components', 'registry_components should have primary key');

-- Test: Foreign keys
SELECT has_fk('public', 'profiles', 'profiles should have foreign key to organizations');
SELECT has_fk('public', 'goals', 'goals should have foreign key to organizations');
SELECT has_fk('public', 'goals', 'goals should have foreign key to profiles (owner)');
SELECT has_fk('public', 'key_results', 'key_results should have foreign key to goals');

-- Test: Unique constraints
SELECT col_is_unique('public', 'organizations', 'slug', 'organizations.slug should be unique');
SELECT col_is_unique('public', 'profiles', 'email', 'profiles.email should be unique');

-- SECTION 4: Index Tests
-- ============================================================================

SELECT has_index('public', 'goals', 'idx_goals_organization_id', 'Should have index on goals.organization_id');
SELECT has_index('public', 'goals', 'idx_goals_owner_id', 'Should have index on goals.owner_id');
SELECT has_index('public', 'candidates', 'idx_candidates_status', 'Should have index on candidates.status');
SELECT has_index('public', 'registry_components', 'idx_registry_components_category', 'Should have index on registry_components.category');

-- SECTION 5: RLS Tests
-- ============================================================================

-- Test: RLS is enabled on all tables
SELECT rls_is_enabled('public', 'organizations', 'RLS should be enabled on organizations');
SELECT rls_is_enabled('public', 'profiles', 'RLS should be enabled on profiles');
SELECT rls_is_enabled('public', 'goals', 'RLS should be enabled on goals');
SELECT rls_is_enabled('public', 'registry_components', 'RLS should be enabled on registry_components');
SELECT rls_is_enabled('public', 'agent_activities', 'RLS should be enabled on agent_activities');
SELECT rls_is_enabled('public', 'integrations', 'RLS should be enabled on integrations');
SELECT rls_is_enabled('public', 'audit_logs', 'RLS should be enabled on audit_logs');

-- Test: Policies exist
SELECT policies_are('public', 'goals', ARRAY['goals_select', 'goals_insert', 'goals_update', 'goals_delete']);
SELECT policies_are('public', 'registry_components', ARRAY['registry_components_select_global', 'registry_components_select_org', 'registry_components_insert', 'registry_components_update', 'registry_components_delete']);

-- SECTION 6: Function Tests
-- ============================================================================

-- Test: Helper functions exist
SELECT has_function('public', 'get_user_organization_id', 'Function get_user_organization_id should exist');
SELECT has_function('public', 'has_role', 'Function has_role should exist');
SELECT has_function('public', 'has_any_role', 'Function has_any_role should exist');
SELECT has_function('public', 'is_manager_of', 'Function is_manager_of should exist');
SELECT has_function('public', 'can_access_candidate', 'Function can_access_candidate should exist');
SELECT has_function('public', 'is_component_accessible', 'Function is_component_accessible should exist');

-- Test: Utility functions exist
SELECT has_function('public', 'calculate_okr_health_score', 'Function calculate_okr_health_score should exist');
SELECT has_function('public', 'get_team_performance_trend', 'Function get_team_performance_trend should exist');
SELECT has_function('public', 'get_recruitment_funnel', 'Function get_recruitment_funnel should exist');
SELECT has_function('public', 'get_agent_performance', 'Function get_agent_performance should exist');

-- Test: Trigger functions exist
SELECT has_function('public', 'update_updated_at_column', 'Function update_updated_at_column should exist');
SELECT has_function('public', 'log_audit_changes', 'Function log_audit_changes should exist');

-- SECTION 7: View Tests
-- ============================================================================

-- Test: Views exist
SELECT has_view('public', 'goals_with_progress', 'View goals_with_progress should exist');
SELECT has_view('public', 'job_postings_with_stats', 'View job_postings_with_stats should exist');
SELECT has_view('public', 'candidates_with_details', 'View candidates_with_details should exist');
SELECT has_view('public', 'performance_review_summary', 'View performance_review_summary should exist');
SELECT has_view('public', 'registry_component_stats', 'View registry_component_stats should exist');
SELECT has_view('public', 'agent_activity_summary', 'View agent_activity_summary should exist');
SELECT has_view('public', 'integrations_health', 'View integrations_health should exist');
SELECT has_view('public', 'organization_dashboard', 'View organization_dashboard should exist');

-- Test: Materialized view exists
SELECT has_materialized_view('public', 'mv_organization_metrics', 'Materialized view mv_organization_metrics should exist');

-- SECTION 8: Trigger Tests
-- ============================================================================

-- Test: updated_at triggers exist on key tables
SELECT has_trigger('public', 'goals', 'update_goals_updated_at', 'Should have trigger on goals.updated_at');
SELECT has_trigger('public', 'profiles', 'update_profiles_updated_at', 'Should have trigger on profiles.updated_at');
SELECT has_trigger('public', 'registry_components', 'update_registry_components_updated_at', 'Should have trigger on registry_components.updated_at');

-- Test: Audit triggers exist
SELECT has_trigger('public', 'goals', 'audit_goals_changes', 'Should have audit trigger on goals');
SELECT has_trigger('public', 'registry_components', 'audit_registry_components_changes', 'Should have audit trigger on registry_components');

-- SECTION 9: Data Type Tests
-- ============================================================================

-- Test: Correct data types
SELECT col_type_is('public', 'organizations', 'id', 'uuid', 'organizations.id should be UUID');
SELECT col_type_is('public', 'goals', 'progress_percentage', 'integer', 'goals.progress_percentage should be integer');
SELECT col_type_is('public', 'registry_components', 'metadata', 'jsonb', 'registry_components.metadata should be JSONB');
SELECT col_type_is('public', 'candidates', 'ai_cv_score', 'integer', 'candidates.ai_cv_score should be integer');

-- Test: Generated columns
SELECT col_is_pk('public', 'organizations', 'id', 'organizations.id should be primary key');
SELECT col_has_default('public', 'goals', 'status', 'goals.status should have default value');
SELECT col_has_default('public', 'registry_components', 'is_published', 'registry_components.is_published should have default value');

-- SECTION 10: Enum/Check Constraint Tests
-- ============================================================================

-- Test: Check constraints on status fields
SELECT col_has_check('public', 'goals', 'status', 'goals.status should have check constraint');
SELECT col_has_check('public', 'candidates', 'status', 'candidates.status should have check constraint');
SELECT col_has_check('public', 'registry_components', 'accessibility_level', 'registry_components.accessibility_level should have check constraint');

SELECT * FROM finish();

ROLLBACK;
