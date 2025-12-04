-- ============================================================================
-- Migration: Add Settings Tables (Organization & User Level)  
-- Created: 2025-10-12
-- Description: Comprehensive settings system for organization-wide and user-specific preferences
-- ============================================================================

-- SECTION 1: Organization Settings Table
-- ============================================================================

COMMENT ON TABLE public.organizations IS 'Multi-tenant organizations with legacy JSONB settings field (kept for backward compatibility)';

CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- AI Features Configuration
  ai_provider TEXT DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'anthropic', 'none')),
  ai_enabled BOOLEAN DEFAULT false,
  ai_cv_scoring_enabled BOOLEAN DEFAULT false,
  ai_performance_synthesis_enabled BOOLEAN DEFAULT false,
  ai_career_recommendations_enabled BOOLEAN DEFAULT false,
  ai_api_key_encrypted TEXT,
  ai_model TEXT DEFAULT 'gpt-4o',
  ai_max_tokens INTEGER DEFAULT 2000 CHECK (ai_max_tokens > 0 AND ai_max_tokens <= 100000),
  ai_temperature NUMERIC DEFAULT 0.7 CHECK (ai_temperature >= 0 AND ai_temperature <= 2),
  
  -- Integration Settings
  integrations_enabled BOOLEAN DEFAULT true,
  microsoft365_enabled BOOLEAN DEFAULT false,
  asana_enabled BOOLEAN DEFAULT false,
  notion_enabled BOOLEAN DEFAULT false,
  slack_enabled BOOLEAN DEFAULT false,
  teams_enabled BOOLEAN DEFAULT false,
  github_enabled BOOLEAN DEFAULT false,
  gitlab_enabled BOOLEAN DEFAULT false,
  jira_enabled BOOLEAN DEFAULT false,
  
  -- Notification Preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  slack_notifications_enabled BOOLEAN DEFAULT false,
  teams_notifications_enabled BOOLEAN DEFAULT false,
  notification_channels JSONB DEFAULT '{"email": true, "slack": false, "teams": false}'::jsonb,
  
  -- Email Notification Categories
  notify_new_goal BOOLEAN DEFAULT true,
  notify_goal_update BOOLEAN DEFAULT true,
  notify_goal_completion BOOLEAN DEFAULT true,
  notify_new_candidate BOOLEAN DEFAULT true,
  notify_interview_scheduled BOOLEAN DEFAULT true,
  notify_performance_review_due BOOLEAN DEFAULT true,
  notify_performance_review_submitted BOOLEAN DEFAULT true,
  notify_team_member_joined BOOLEAN DEFAULT true,
  
  -- Data Retention Policies
  retention_audit_logs_days INTEGER DEFAULT 365 CHECK (retention_audit_logs_days >= 30),
  retention_deleted_records_days INTEGER DEFAULT 90 CHECK (retention_deleted_records_days >= 0),
  retention_candidate_data_days INTEGER CHECK (retention_candidate_data_days IS NULL OR retention_candidate_data_days >= 180),
  auto_archive_completed_goals_days INTEGER CHECK (auto_archive_completed_goals_days IS NULL OR auto_archive_completed_goals_days >= 90),
  
  -- Security Settings
  enforce_2fa BOOLEAN DEFAULT false,
  password_min_length INTEGER DEFAULT 12 CHECK (password_min_length >= 8 AND password_min_length <= 128),
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_lowercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_special_chars BOOLEAN DEFAULT true,
  password_expiry_days INTEGER CHECK (password_expiry_days IS NULL OR password_expiry_days >= 30),
  session_timeout_minutes INTEGER DEFAULT 480 CHECK (session_timeout_minutes >= 15),
  ip_whitelist TEXT[],
  allowed_email_domains TEXT[],
  
  -- Branding Settings
  brand_logo_url TEXT,
  brand_primary_color TEXT,
  brand_secondary_color TEXT,
  brand_accent_color TEXT,
  custom_domain TEXT,
  company_tagline TEXT,
  
  -- Localization Defaults
  default_language TEXT DEFAULT 'en' CHECK (default_language IN ('en', 'fr', 'es', 'de', 'pt', 'zh', 'ja')),
  default_timezone TEXT DEFAULT 'UTC',
  default_date_format TEXT DEFAULT 'YYYY-MM-DD' CHECK (default_date_format IN ('YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY')),
  default_currency TEXT DEFAULT 'USD' CHECK (LENGTH(default_currency) = 3),
  
  -- Feature Flags
  features_goals_enabled BOOLEAN DEFAULT true,
  features_recruitment_enabled BOOLEAN DEFAULT true,
  features_performance_enabled BOOLEAN DEFAULT true,
  features_career_dev_enabled BOOLEAN DEFAULT true,
  features_analytics_enabled BOOLEAN DEFAULT true,
  
  -- Compliance & Privacy
  gdpr_enabled BOOLEAN DEFAULT false,
  data_processing_region TEXT DEFAULT 'us-east' CHECK (data_processing_region IN ('us-east', 'us-west', 'eu-west', 'eu-central', 'ap-southeast', 'ap-northeast')),
  anonymize_candidate_data BOOLEAN DEFAULT false,
  
  -- Advanced Settings
  advanced_settings JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON public.organization_settings(organization_id);


-- SECTION 2: User Settings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Localization Preferences
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'es', 'de', 'pt', 'zh', 'ja')),
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'YYYY-MM-DD' CHECK (date_format IN ('YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY')),
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  
  -- Email Notification Preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  notify_new_goal BOOLEAN DEFAULT true,
  notify_goal_update BOOLEAN DEFAULT true,
  notify_goal_completion BOOLEAN DEFAULT true,
  notify_goal_comment BOOLEAN DEFAULT true,
  notify_mentioned_in_comment BOOLEAN DEFAULT true,
  notify_assigned_as_collaborator BOOLEAN DEFAULT true,
  notify_new_candidate BOOLEAN DEFAULT true,
  notify_interview_scheduled BOOLEAN DEFAULT true,
  notify_interview_reminder BOOLEAN DEFAULT true,
  notify_performance_review_due BOOLEAN DEFAULT true,
  notify_performance_review_submitted BOOLEAN DEFAULT true,
  notify_feedback_received BOOLEAN DEFAULT true,
  notify_team_member_joined BOOLEAN DEFAULT true,
  notify_direct_report_update BOOLEAN DEFAULT true,
  
  -- Notification Delivery Settings
  email_digest_frequency TEXT DEFAULT 'daily' CHECK (email_digest_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'never')),
  slack_notifications_enabled BOOLEAN DEFAULT false,
  slack_user_id TEXT,
  teams_notifications_enabled BOOLEAN DEFAULT false,
  teams_user_id TEXT,
  
  -- Dashboard & UI Preferences
  dashboard_layout TEXT DEFAULT 'default' CHECK (dashboard_layout IN ('default', 'compact', 'detailed', 'custom')),
  dashboard_widgets JSONB DEFAULT '["goals", "upcoming_interviews", "pending_reviews", "team_performance"]'::jsonb,
  sidebar_collapsed BOOLEAN DEFAULT false,
  show_onboarding_hints BOOLEAN DEFAULT true,
  
  -- Theme Preferences
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  theme_custom_colors JSONB DEFAULT '{}'::jsonb,
  
  -- Accessibility Settings
  accessibility_high_contrast BOOLEAN DEFAULT false,
  accessibility_reduce_motion BOOLEAN DEFAULT false,
  accessibility_screen_reader_mode BOOLEAN DEFAULT false,
  accessibility_font_size TEXT DEFAULT 'medium' CHECK (accessibility_font_size IN ('small', 'medium', 'large', 'x-large')),
  accessibility_keyboard_shortcuts BOOLEAN DEFAULT true,
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'organization' CHECK (profile_visibility IN ('private', 'team', 'organization', 'public')),
  show_email BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT true,
  show_location BOOLEAN DEFAULT true,
  allow_analytics_tracking BOOLEAN DEFAULT true,
  
  -- Work Preferences
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  working_days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5],
  out_of_office_enabled BOOLEAN DEFAULT false,
  out_of_office_message TEXT,
  out_of_office_start_date DATE,
  out_of_office_end_date DATE,
  
  -- Advanced Preferences
  advanced_preferences JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_working_hours CHECK (working_hours_end > working_hours_start),
  CONSTRAINT valid_out_of_office_dates CHECK (
    out_of_office_end_date IS NULL 
    OR out_of_office_start_date IS NULL 
    OR out_of_office_end_date >= out_of_office_start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_org_id ON public.user_settings(organization_id);

-- SECTION 3: Row-Level Security Policies
-- ============================================================================

ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY organization_settings_select ON public.organization_settings
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_any_role(ARRAY['admin', 'hr'])
  );

CREATE POLICY organization_settings_insert ON public.organization_settings
  FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_role('admin')
  );

CREATE POLICY organization_settings_update ON public.organization_settings
  FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_role('admin')
  );

CREATE POLICY user_settings_select ON public.user_settings
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      organization_id = public.get_user_organization_id()
      AND public.has_any_role(ARRAY['admin', 'hr'])
    )
  );

CREATE POLICY user_settings_insert ON public.user_settings
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.get_user_organization_id()
  );

CREATE POLICY user_settings_update ON public.user_settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- SECTION 4: Helper Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_organization_settings(org_id UUID)
RETURNS public.organization_settings
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT * FROM public.organization_settings
  WHERE organization_id = org_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_organization_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_user_settings(p_user_id UUID)
RETURNS public.user_settings
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT * FROM public.user_settings
  WHERE user_id = p_user_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.initialize_organization_settings(org_id UUID)
RETURNS public.organization_settings
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result public.organization_settings;
BEGIN
  INSERT INTO public.organization_settings (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING
  RETURNING * INTO result;
  
  IF result IS NULL THEN
    SELECT * INTO result FROM public.organization_settings WHERE organization_id = org_id;
  END IF;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_organization_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.initialize_user_settings(p_user_id UUID, org_id UUID)
RETURNS public.user_settings
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result public.user_settings;
BEGIN
  INSERT INTO public.user_settings (user_id, organization_id)
  VALUES (p_user_id, org_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO result;
  
  IF result IS NULL THEN
    SELECT * INTO result FROM public.user_settings WHERE user_id = p_user_id;
  END IF;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_user_settings(UUID, UUID) TO authenticated;

-- SECTION 5: Triggers
-- ============================================================================

CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, organization_id)
  VALUES (NEW.id, NEW.organization_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_settings_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

CREATE OR REPLACE FUNCTION public.create_default_organization_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_settings (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_org_settings_on_organization
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_organization_settings();

-- SECTION 6: Audit Trail
-- ============================================================================

CREATE TRIGGER audit_organization_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_changes();

CREATE TRIGGER audit_user_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_changes();

-- SECTION 7: Comments & Documentation
-- ============================================================================

COMMENT ON TABLE public.organization_settings IS 'Organization-level settings including AI, integrations, security, branding, and compliance';
COMMENT ON TABLE public.user_settings IS 'User-specific preferences including notifications, theme, accessibility, and dashboard layout';

COMMENT ON COLUMN public.organization_settings.ai_api_key_encrypted IS 'Encrypted API key for AI provider (OpenAI/Anthropic)';
COMMENT ON COLUMN public.organization_settings.retention_candidate_data_days IS 'Days to retain candidate data after application (NULL = indefinite)';
COMMENT ON COLUMN public.organization_settings.ip_whitelist IS 'Array of allowed IP addresses/CIDR ranges for organization access';
COMMENT ON COLUMN public.organization_settings.advanced_settings IS 'Flexible JSONB for future settings without schema changes';

COMMENT ON COLUMN public.user_settings.working_days IS 'Array of working days (1=Monday, 7=Sunday)';
COMMENT ON COLUMN public.user_settings.dashboard_widgets IS 'Array of enabled dashboard widget IDs';
COMMENT ON COLUMN public.user_settings.advanced_preferences IS 'Flexible JSONB for custom user preferences';

COMMENT ON FUNCTION public.get_organization_settings(UUID) IS 'Get organization settings with type safety';
COMMENT ON FUNCTION public.get_user_settings(UUID) IS 'Get user settings with type safety';
COMMENT ON FUNCTION public.initialize_organization_settings(UUID) IS 'Initialize default settings for new organization';
COMMENT ON FUNCTION public.initialize_user_settings(UUID, UUID) IS 'Initialize default settings for new user';
