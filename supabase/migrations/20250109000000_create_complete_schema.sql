-- ============================================================================
-- Migration: Complete Targetym Schema with Registry Support
-- Created: 2025-01-09
-- Description: Full database schema for HR platform with component registry
-- ============================================================================

-- SECTION 1: Core Tables
-- ============================================================================

-- Organizations (Multi-tenant container)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles (Users within organizations)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
  department TEXT,
  job_title TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hire_date DATE,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave', 'terminated')),
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  bio TEXT,
  skills TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 2: Goals & OKRs Module
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  period TEXT NOT NULL CHECK (period IN ('quarterly', 'semi-annual', 'annual', 'custom')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'on_hold')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'organization', 'public')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  alignment_level TEXT CHECK (alignment_level IN ('individual', 'team', 'department', 'company')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric_type TEXT DEFAULT 'number' CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  start_value NUMERIC DEFAULT 0,
  unit TEXT,
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN target_value = start_value THEN 0
      WHEN current_value >= target_value THEN 100
      ELSE LEAST(100, GREATEST(0, ((current_value - start_value) * 100.0 / NULLIF(target_value - start_value, 0))::INTEGER))
    END
  ) STORED,
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'achieved')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.goal_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'contributor' CHECK (role IN ('owner', 'contributor', 'viewer')),
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(goal_id, profile_id)
);

-- SECTION 3: Recruitment Module
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'temporary')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  remote_allowed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hiring_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_salary_range CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  source TEXT CHECK (source IN ('website', 'referral', 'linkedin', 'indeed', 'glassdoor', 'other')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  ai_cv_score INTEGER CHECK (ai_cv_score >= 0 AND ai_cv_score <= 100),
  ai_cv_summary TEXT,
  ai_cv_recommendation TEXT,
  ai_scored_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  interview_type TEXT DEFAULT 'technical' CHECK (interview_type IN ('phone_screen', 'technical', 'behavioral', 'cultural', 'final', 'other')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 4: Performance Management Module
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  review_type TEXT DEFAULT 'annual' CHECK (review_type IN ('quarterly', 'semi_annual', 'annual', 'probation', '360')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'completed', 'archived')),
  overall_rating NUMERIC CHECK (overall_rating >= 1 AND overall_rating <= 5),
  summary TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_for_next_period TEXT,
  reviewer_comments TEXT,
  reviewee_comments TEXT,
  manager_comments TEXT,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_review_period CHECK (review_period_end >= review_period_start)
);

CREATE TABLE IF NOT EXISTS public.performance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('technical', 'leadership', 'communication', 'collaboration', 'innovation', 'results', 'values')),
  weight NUMERIC DEFAULT 1 CHECK (weight > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.performance_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE NOT NULL,
  criteria_id UUID REFERENCES public.performance_criteria(id) ON DELETE CASCADE NOT NULL,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(review_id, criteria_id)
);

CREATE TABLE IF NOT EXISTS public.performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE NOT NULL,
  goal_description TEXT NOT NULL,
  target_completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'achieved', 'not_achieved', 'deferred')),
  achievement_percentage INTEGER DEFAULT 0 CHECK (achievement_percentage >= 0 AND achievement_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.peer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES public.performance_reviews(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feedback_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 5: Career Development Module
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.career_development (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  career_path TEXT,
  current_level TEXT,
  target_level TEXT,
  development_goals TEXT[],
  skills_to_develop TEXT[],
  certifications_to_pursue TEXT[],
  target_completion_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 6: Component Registry Module (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.registry_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL, -- Format: "category/component-name"
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  file_path TEXT NOT NULL,
  documentation_path TEXT,
  tags TEXT[],
  dependencies JSONB DEFAULT '[]'::jsonb,
  accessibility_level TEXT DEFAULT 'AA' CHECK (accessibility_level IN ('A', 'AA', 'AAA')),
  has_aria_support BOOLEAN DEFAULT true,
  has_keyboard_nav BOOLEAN DEFAULT true,
  has_focus_trap BOOLEAN DEFAULT false,
  bundle_size_kb NUMERIC,
  test_coverage_percentage INTEGER CHECK (test_coverage_percentage >= 0 AND test_coverage_percentage <= 100),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  deprecated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(component_id, version)
);

CREATE TABLE IF NOT EXISTS public.registry_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.registry_components(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  code_snippet TEXT,
  is_interactive BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registry_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_number INTEGER NOT NULL,
  registry_version TEXT NOT NULL,
  total_components INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'success', 'failed', 'cancelled')),
  build_output JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registry_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES public.registry_builds(id) ON DELETE SET NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  npm_published BOOLEAN DEFAULT false,
  github_published BOOLEAN DEFAULT false,
  vercel_deployed BOOLEAN DEFAULT false,
  npm_url TEXT,
  github_release_url TEXT,
  vercel_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 7: Agent Activity Tracking (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('orchestrator', 'frontend', 'backend', 'integration')),
  task_id UUID,
  task_type TEXT NOT NULL,
  task_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'blocked')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.agent_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  message_type TEXT NOT NULL,
  context TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  dependencies UUID[],
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 8: Integrations Module (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('microsoft365', 'asana', 'notion', 'slack', 'teams', 'github', 'gitlab', 'jira', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  credentials_encrypted TEXT, -- Encrypted credentials
  oauth_token_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'success', 'partial', 'failed')),
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 9: Audit & Logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 10: Indexes for Performance
-- ============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_organization_id ON public.goals(organization_id);
CREATE INDEX IF NOT EXISTS idx_goals_owner_id ON public.goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent_goal_id ON public.goals(parent_goal_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_period ON public.goals(period);

-- Key Results
CREATE INDEX IF NOT EXISTS idx_key_results_organization_id ON public.key_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_key_results_goal_id ON public.key_results(goal_id);

-- Job Postings
CREATE INDEX IF NOT EXISTS idx_job_postings_organization_id ON public.job_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_by ON public.job_postings(created_by);

-- Candidates
CREATE INDEX IF NOT EXISTS idx_candidates_organization_id ON public.candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_posting_id ON public.candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);

-- Interviews
CREATE INDEX IF NOT EXISTS idx_interviews_organization_id ON public.interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON public.interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON public.interviews(scheduled_at);

-- Performance Reviews
CREATE INDEX IF NOT EXISTS idx_performance_reviews_organization_id ON public.performance_reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewee_id ON public.performance_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON public.performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON public.performance_reviews(status);

-- Registry Components
CREATE INDEX IF NOT EXISTS idx_registry_components_component_id ON public.registry_components(component_id);
CREATE INDEX IF NOT EXISTS idx_registry_components_category ON public.registry_components(category);
CREATE INDEX IF NOT EXISTS idx_registry_components_is_published ON public.registry_components(is_published);

-- Agent Activities
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_type ON public.agent_activities(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_activities_status ON public.agent_activities(status);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON public.agent_activities(created_at);

-- Integrations
CREATE INDEX IF NOT EXISTS idx_integrations_organization_id ON public.integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_is_active ON public.integrations(is_active);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- SECTION 11: Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_at'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- SECTION 12: Helper Functions for RLS Policies
-- ============================================================================

-- Function: Get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_organization_id IS 'Returns organization_id for the currently authenticated user';

-- Function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = required_role
  );
$$;

COMMENT ON FUNCTION public.has_role IS 'Check if current user has a specific role';

-- Function: Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
$$;

COMMENT ON FUNCTION public.has_any_role IS 'Check if current user has any of the specified roles';

-- Function: Check if user is a manager of a specific employee
CREATE OR REPLACE FUNCTION public.is_manager_of(employee_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = employee_id
    AND manager_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_manager_of IS 'Check if current user is the manager of specified employee';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_of(UUID) TO authenticated;

-- Migration Complete
COMMENT ON SCHEMA public IS 'Targetym HR Platform - Complete Schema v1.0';
