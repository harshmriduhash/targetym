-- ============================================================================
-- Migration: Integrations Infrastructure
-- Created: 2025-11-08
-- Description: Complete integration system for external services (Slack, Asana,
--              Notion, Google Workspace, Microsoft 365, etc.)
-- ============================================================================

-- SECTION 1: Core Integration Tables
-- ============================================================================

-- Integration Providers Registry (Static reference data)
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id TEXT PRIMARY KEY, -- e.g., 'slack', 'asana', 'notion'
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  documentation_url TEXT,
  oauth_version TEXT CHECK (oauth_version IN ('oauth1', 'oauth2', 'pkce', 'api_key')),
  authorization_endpoint TEXT,
  token_endpoint TEXT,
  revocation_endpoint TEXT,
  scopes_available TEXT[] DEFAULT '{}',
  default_scopes TEXT[] DEFAULT '{}',
  webhook_support BOOLEAN DEFAULT false,
  rate_limit_per_hour INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Organization Integration Instances
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  provider_id TEXT REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
  connected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Connection Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- OAuth flow initiated
    'connected',    -- Successfully connected
    'error',        -- Connection error
    'disconnected', -- Manually disconnected
    'expired',      -- Token expired
    'revoked'       -- Access revoked by user
  )),

  -- Configuration
  name TEXT, -- User-defined name for this connection
  scopes_granted TEXT[] DEFAULT '{}',
  workspace_id TEXT, -- For multi-workspace integrations (Slack workspace ID, Notion workspace, etc.)
  workspace_name TEXT,

  -- Sync Configuration
  sync_enabled BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,

  -- Health Monitoring
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy')),
  last_health_check_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,

  -- Metadata
  error_message TEXT,
  error_details JSONB,
  settings JSONB DEFAULT '{}'::jsonb, -- Provider-specific settings
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(organization_id, provider_id, workspace_id)
);

-- Integration Credentials (Encrypted OAuth Tokens)
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Encrypted Tokens (AES-256-GCM encrypted)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,

  -- Token Metadata
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scopes TEXT[],

  -- OAuth State (for PKCE)
  pkce_verifier_encrypted TEXT, -- Temporary, cleared after token exchange

  -- Security
  encryption_key_id TEXT NOT NULL, -- Reference to Supabase Vault key
  last_rotated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Integration Webhooks
CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,

  -- Webhook Configuration
  webhook_url TEXT NOT NULL, -- Our endpoint
  external_webhook_id TEXT, -- ID from provider (for verification/deletion)
  event_types TEXT[] DEFAULT '{}', -- Events subscribed to

  -- Security
  secret_encrypted TEXT NOT NULL, -- HMAC secret for signature verification
  signature_header TEXT DEFAULT 'X-Webhook-Signature',

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_received_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,

  -- Statistics
  total_received INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Integration Sync Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,

  -- Sync Details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual', 'webhook')),
  direction TEXT NOT NULL CHECK (direction IN ('pull', 'push', 'bidirectional')),
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed', 'cancelled')),

  -- Resource Synced
  resource_type TEXT, -- e.g., 'tasks', 'events', 'documents'
  resource_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Results
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Error Tracking
  error_message TEXT,
  error_stack TEXT,
  error_details JSONB,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Integration Consents (GDPR Compliance)
CREATE TABLE IF NOT EXISTS public.integration_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Consent Details
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'data_access',    -- Access to read data
    'data_sync',      -- Sync data bidirectionally
    'data_export',    -- Export data to external service
    'notifications',  -- Send notifications
    'automation'      -- Automated actions
  )),

  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,

  -- Legal
  consent_version TEXT, -- Version of consent terms
  ip_address TEXT,
  user_agent TEXT,

  -- Scope of Consent
  scopes TEXT[] DEFAULT '{}',
  data_categories TEXT[] DEFAULT '{}', -- e.g., ['personal_info', 'performance_data']

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(integration_id, user_id, consent_type)
);

-- OAuth State Management (Temporary, for PKCE flow)
CREATE TABLE IF NOT EXISTS public.integration_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  provider_id TEXT REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,

  -- OAuth State
  state TEXT UNIQUE NOT NULL, -- Random state parameter
  code_verifier TEXT NOT NULL, -- PKCE code verifier
  code_challenge TEXT NOT NULL, -- PKCE code challenge

  -- Metadata
  redirect_uri TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Expiration (states expire after 10 minutes)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),

  -- Tracking
  used_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 2: Indexes for Performance
-- ============================================================================

-- Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider
  ON public.integrations(organization_id, provider_id);

CREATE INDEX IF NOT EXISTS idx_integrations_status
  ON public.integrations(status) WHERE status IN ('connected', 'error');

CREATE INDEX IF NOT EXISTS idx_integrations_health
  ON public.integrations(health_status) WHERE health_status != 'healthy';

CREATE INDEX IF NOT EXISTS idx_integrations_next_sync
  ON public.integrations(next_sync_at) WHERE sync_enabled = true AND status = 'connected';

-- Credentials Index
CREATE INDEX IF NOT EXISTS idx_integration_credentials_integration
  ON public.integration_credentials(integration_id);

-- Webhooks Indexes
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_active
  ON public.integration_webhooks(integration_id) WHERE is_active = true;

-- Sync Logs Indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_created
  ON public.integration_sync_logs(integration_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_logs_status
  ON public.integration_sync_logs(status, created_at DESC);

-- Consents Indexes
CREATE INDEX IF NOT EXISTS idx_integration_consents_user
  ON public.integration_consents(user_id, granted);

CREATE INDEX IF NOT EXISTS idx_integration_consents_integration
  ON public.integration_consents(integration_id, consent_type);

-- OAuth States Indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state
  ON public.integration_oauth_states(state) WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires
  ON public.integration_oauth_states(expires_at) WHERE used_at IS NULL;

-- SECTION 3: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_oauth_states ENABLE ROW LEVEL SECURITY;

-- Integration Providers (Public Read)
CREATE POLICY "Anyone can view active integration providers"
  ON public.integration_providers FOR SELECT
  USING (is_active = true);

-- Integrations (Organization-scoped)
CREATE POLICY "Users can view own organization integrations"
  ON public.integrations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and HR can manage integrations"
  ON public.integrations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- Integration Credentials (Restricted Access)
CREATE POLICY "Service role only can access credentials"
  ON public.integration_credentials FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Webhooks (Organization-scoped via integration)
CREATE POLICY "Users can view webhooks for their org integrations"
  ON public.integration_webhooks FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage webhooks"
  ON public.integration_webhooks FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'hr')
      )
    )
  );

-- Sync Logs (Read-only for organization users)
CREATE POLICY "Users can view sync logs for their org"
  ON public.integration_sync_logs FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.integrations
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert sync logs"
  ON public.integration_sync_logs FOR INSERT
  WITH CHECK (true); -- Service role only

-- Consents (User-specific)
CREATE POLICY "Users can view own consents"
  ON public.integration_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own consents"
  ON public.integration_consents FOR ALL
  USING (user_id = auth.uid());

-- OAuth States (Organization-scoped, temporary)
CREATE POLICY "Users can view own org OAuth states"
  ON public.integration_oauth_states FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service can manage OAuth states"
  ON public.integration_oauth_states FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- SECTION 4: Functions and Triggers
-- ============================================================================

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION public.handle_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_integration_providers_updated_at
  BEFORE UPDATE ON public.integration_providers
  FOR EACH ROW EXECUTE FUNCTION public.handle_integration_updated_at();

CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_integration_updated_at();

CREATE TRIGGER set_integration_credentials_updated_at
  BEFORE UPDATE ON public.integration_credentials
  FOR EACH ROW EXECUTE FUNCTION public.handle_integration_updated_at();

CREATE TRIGGER set_integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.handle_integration_updated_at();

CREATE TRIGGER set_integration_consents_updated_at
  BEFORE UPDATE ON public.integration_consents
  FOR EACH ROW EXECUTE FUNCTION public.handle_integration_updated_at();

-- Function: Clean up expired OAuth states
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.integration_oauth_states
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update integration health status
CREATE OR REPLACE FUNCTION public.update_integration_health(
  p_integration_id UUID,
  p_success BOOLEAN
)
RETURNS void AS $$
BEGIN
  IF p_success THEN
    UPDATE public.integrations
    SET
      health_status = 'healthy',
      consecutive_failures = 0,
      last_health_check_at = now()
    WHERE id = p_integration_id;
  ELSE
    UPDATE public.integrations
    SET
      consecutive_failures = consecutive_failures + 1,
      health_status = CASE
        WHEN consecutive_failures >= 5 THEN 'unhealthy'
        WHEN consecutive_failures >= 2 THEN 'degraded'
        ELSE 'healthy'
      END,
      last_health_check_at = now()
    WHERE id = p_integration_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate sync statistics
CREATE OR REPLACE FUNCTION public.get_integration_sync_stats(
  p_integration_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_syncs BIGINT,
  successful_syncs BIGINT,
  failed_syncs BIGINT,
  total_records_processed BIGINT,
  avg_duration_ms NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_syncs,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_syncs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_syncs,
    COALESCE(SUM(records_processed), 0) as total_records_processed,
    COALESCE(AVG(duration_ms), 0) as avg_duration_ms,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0
    END as success_rate
  FROM public.integration_sync_logs
  WHERE integration_id = p_integration_id
    AND created_at >= now() - (p_days || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 5: Seed Data - Common Integration Providers
-- ============================================================================

INSERT INTO public.integration_providers (id, name, display_name, description, oauth_version, authorization_endpoint, token_endpoint, default_scopes, webhook_support, is_active)
VALUES
  -- Slack
  (
    'slack',
    'slack',
    'Slack',
    'Team communication and notifications',
    'oauth2',
    'https://slack.com/oauth/v2/authorize',
    'https://slack.com/api/oauth.v2.access',
    ARRAY['channels:read', 'chat:write', 'users:read'],
    true,
    true
  ),

  -- Asana
  (
    'asana',
    'asana',
    'Asana',
    'Task and project management',
    'oauth2',
    'https://app.asana.com/-/oauth_authorize',
    'https://app.asana.com/-/oauth_token',
    ARRAY['default'],
    true,
    true
  ),

  -- Notion
  (
    'notion',
    'notion',
    'Notion',
    'Documentation and knowledge base',
    'oauth2',
    'https://api.notion.com/v1/oauth/authorize',
    'https://api.notion.com/v1/oauth/token',
    ARRAY['read_content', 'update_content'],
    false,
    true
  ),

  -- Google Workspace
  (
    'google',
    'google',
    'Google Workspace',
    'Calendar, Drive, and Gmail integration',
    'pkce',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    ARRAY['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive.file'],
    true,
    true
  ),

  -- Microsoft 365
  (
    'microsoft',
    'microsoft',
    'Microsoft 365',
    'Teams, Calendar, and OneDrive',
    'oauth2',
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    ARRAY['User.Read', 'Calendars.ReadWrite', 'Files.ReadWrite'],
    true,
    true
  ),

  -- Linear
  (
    'linear',
    'linear',
    'Linear',
    'Issue tracking and project management',
    'oauth2',
    'https://linear.app/oauth/authorize',
    'https://api.linear.app/oauth/token',
    ARRAY['read', 'write'],
    true,
    true
  ),

  -- Jira
  (
    'jira',
    'jira',
    'Jira',
    'Issue and project tracking',
    'oauth2',
    'https://auth.atlassian.com/authorize',
    'https://auth.atlassian.com/oauth/token',
    ARRAY['read:jira-work', 'write:jira-work'],
    true,
    true
  ),

  -- GitHub
  (
    'github',
    'github',
    'GitHub',
    'Code repository and project management',
    'oauth2',
    'https://github.com/login/oauth/authorize',
    'https://github.com/login/oauth/access_token',
    ARRAY['repo', 'read:user'],
    true,
    true
  ),

  -- Zoom
  (
    'zoom',
    'zoom',
    'Zoom',
    'Video conferencing and meetings',
    'oauth2',
    'https://zoom.us/oauth/authorize',
    'https://zoom.us/oauth/token',
    ARRAY['meeting:write', 'user:read'],
    true,
    true
  ),

  -- Trello
  (
    'trello',
    'trello',
    'Trello',
    'Visual project boards',
    'oauth1',
    'https://trello.com/1/authorize',
    'https://trello.com/1/OAuthGetAccessToken',
    ARRAY['read', 'write'],
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- SECTION 6: Comments
-- ============================================================================

COMMENT ON TABLE public.integration_providers IS 'Registry of available integration providers with OAuth configuration';
COMMENT ON TABLE public.integrations IS 'Organization-specific integration instances with connection status';
COMMENT ON TABLE public.integration_credentials IS 'Encrypted OAuth tokens and credentials (service role access only)';
COMMENT ON TABLE public.integration_webhooks IS 'Webhook configurations for real-time event processing';
COMMENT ON TABLE public.integration_sync_logs IS 'Audit trail of all integration sync operations';
COMMENT ON TABLE public.integration_consents IS 'GDPR-compliant user consent tracking for data access';
COMMENT ON TABLE public.integration_oauth_states IS 'Temporary OAuth state management for PKCE flow';

COMMENT ON FUNCTION public.cleanup_expired_oauth_states() IS 'Cleanup function for expired OAuth states (run via pg_cron)';
COMMENT ON FUNCTION public.update_integration_health(UUID, BOOLEAN) IS 'Updates integration health status based on sync success/failure';
COMMENT ON FUNCTION public.get_integration_sync_stats(UUID, INTEGER) IS 'Calculates sync statistics for an integration over specified days';
