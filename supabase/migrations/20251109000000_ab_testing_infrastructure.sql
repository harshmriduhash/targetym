-- A/B Testing Infrastructure
-- Feature flags and experiment tracking for integration features

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flag User Overrides
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flag_name VARCHAR(100) NOT NULL REFERENCES feature_flags(name) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flag_name)
);

-- A/B Test Experiments
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  variants JSONB NOT NULL DEFAULT '[]',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_percentage INT DEFAULT 100 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test User Assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experiment_id VARCHAR(100) NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  variant_id VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, experiment_id)
);

-- A/B Test Exposure Tracking
CREATE TABLE IF NOT EXISTS ab_test_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experiment_id VARCHAR(100) NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  variant_id VARCHAR(100) NOT NULL,
  exposed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flag_overrides_user ON feature_flag_overrides(user_id);
CREATE INDEX idx_ab_assignments_user_exp ON ab_test_assignments(user_id, experiment_id);
CREATE INDEX idx_ab_exposures_user_exp ON ab_test_exposures(user_id, experiment_id);
CREATE INDEX idx_ab_exposures_exposed_at ON ab_test_exposures(exposed_at);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_exposures ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Feature Flags: Admins can manage, all users can read
CREATE POLICY "Admins can manage feature flags"
  ON feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view feature flags"
  ON feature_flags
  FOR SELECT
  USING (true);

-- Feature Flag Overrides: Users can view their own
CREATE POLICY "Users can view own flag overrides"
  ON feature_flag_overrides
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage flag overrides"
  ON feature_flag_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- A/B Test Experiments: Admins can manage, all users can read active experiments
CREATE POLICY "Admins can manage experiments"
  ON ab_test_experiments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view running experiments"
  ON ab_test_experiments
  FOR SELECT
  USING (status = 'running');

-- A/B Test Assignments: Users can view their own
CREATE POLICY "Users can view own assignments"
  ON ab_test_assignments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create assignments"
  ON ab_test_assignments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- A/B Test Exposures: Users can view their own
CREATE POLICY "Users can view own exposures"
  ON ab_test_exposures
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can track exposures"
  ON ab_test_exposures
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Seed initial integration experiments
INSERT INTO ab_test_experiments (id, name, description, status, variants, target_percentage) VALUES
  (
    'oauth_flow_optimization',
    'OAuth Flow Optimization',
    'Test optimized OAuth flow with improved UX and better error handling',
    'running',
    '[
      {
        "id": "control",
        "name": "control",
        "description": "Current OAuth flow",
        "weight": 50,
        "config": {"useNewFlow": false}
      },
      {
        "id": "optimized",
        "name": "optimized",
        "description": "Optimized OAuth flow with better UX",
        "weight": 50,
        "config": {"useNewFlow": true}
      }
    ]'::jsonb,
    100
  ),
  (
    'provider_onboarding_ux',
    'Provider Onboarding UX',
    'Test different onboarding experiences for integration providers',
    'running',
    '[
      {
        "id": "control",
        "name": "control",
        "description": "Standard onboarding flow",
        "weight": 33,
        "config": {"flow": "standard"}
      },
      {
        "id": "guided",
        "name": "guided",
        "description": "Guided onboarding with tooltips",
        "weight": 33,
        "config": {"flow": "guided"}
      },
      {
        "id": "video",
        "name": "video",
        "description": "Video tutorial onboarding",
        "weight": 34,
        "config": {"flow": "video"}
      }
    ]'::jsonb,
    100
  );

-- Seed feature flags for integrations
INSERT INTO feature_flags (name, description, enabled, rollout_percentage) VALUES
  ('integration_slack_enabled', 'Enable Slack integration', true, 100),
  ('integration_google_enabled', 'Enable Google Workspace integration', true, 100),
  ('integration_asana_enabled', 'Enable Asana integration', false, 0),
  ('integration_notion_enabled', 'Enable Notion integration', false, 0),
  ('integration_webhooks_enabled', 'Enable webhook processing', true, 100),
  ('integration_auto_sync', 'Enable automatic sync scheduling', true, 50),
  ('integration_advanced_permissions', 'Enable granular permission management', false, 0);

-- Comments
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual feature rollout';
COMMENT ON TABLE feature_flag_overrides IS 'User-specific feature flag overrides';
COMMENT ON TABLE ab_test_experiments IS 'A/B test experiment configurations';
COMMENT ON TABLE ab_test_assignments IS 'User assignments to experiment variants';
COMMENT ON TABLE ab_test_exposures IS 'Tracking when users are exposed to variants';
