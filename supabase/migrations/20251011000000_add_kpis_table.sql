-- ============================================================================
-- Migration: Add KPIs Table for OKRs vs KPIs Distinction
-- Created: 2025-10-11
-- Description: Implements KPIs (Key Performance Indicators) as ongoing metrics
--              separate from OKRs (Objectives & Key Results) for goal setting
-- ============================================================================

-- SECTION 1: KPIs Table (Key Performance Indicators)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- KPI Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('revenue', 'customer', 'operational', 'employee', 'quality', 'efficiency', 'custom')),

  -- Measurement Configuration
  metric_type TEXT DEFAULT 'number' CHECK (metric_type IN ('number', 'percentage', 'currency', 'ratio', 'boolean')),
  unit TEXT, -- e.g., 'USD', '%', 'hours', 'count'
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  baseline_value NUMERIC, -- Starting reference point

  -- Thresholds for status determination
  target_min NUMERIC, -- Green threshold (good performance)
  target_max NUMERIC, -- Red threshold (poor performance)

  -- Status & Tracking
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'below_target', 'above_target', 'needs_attention')),
  measurement_frequency TEXT DEFAULT 'monthly' CHECK (measurement_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),

  -- Context & Alignment
  department TEXT,
  aligned_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL, -- Link to OKR if applicable
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Visibility & Access
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'department', 'organization')),

  -- Data Source & Automation
  data_source TEXT, -- e.g., 'manual', 'salesforce', 'google_analytics', 'api'
  auto_update_enabled BOOLEAN DEFAULT false,
  last_measured_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_target_range CHECK (target_max IS NULL OR target_min IS NULL OR target_max >= target_min)
);

-- SECTION 2: KPI Measurements History
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE NOT NULL,

  -- Measurement Data
  measured_value NUMERIC NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  measurement_period_start DATE,
  measurement_period_end DATE,

  -- Context
  notes TEXT,
  measured_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  measurement_source TEXT DEFAULT 'manual' CHECK (measurement_source IN ('manual', 'automated', 'api', 'integration')),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT valid_measurement_period CHECK (
    measurement_period_end IS NULL OR
    measurement_period_start IS NULL OR
    measurement_period_end >= measurement_period_start
  )
);

-- SECTION 3: KPI Alerts & Notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE NOT NULL,

  -- Alert Configuration
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_breach', 'target_achieved', 'trend_change', 'missing_data', 'custom')),
  condition TEXT NOT NULL, -- JSON or SQL-like condition
  threshold_value NUMERIC,

  -- Notification
  notify_users UUID[], -- Array of profile IDs to notify
  notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'slack', etc.

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SECTION 4: Extend Goals Table for OKR Type
-- ============================================================================

-- Add goal_type column to distinguish between OKRs and regular goals
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'okr'
    CHECK (goal_type IN ('okr', 'smart', 'stretch', 'operational'));

-- Add field to indicate if goal is aspirational (typical for OKRs)
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS is_aspirational BOOLEAN DEFAULT true;

-- Add field for OKR confidence level (0-10 scale common in OKRs)
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS confidence_level INTEGER
    CHECK (confidence_level IS NULL OR (confidence_level >= 0 AND confidence_level <= 10));

-- SECTION 5: Indexes for Performance
-- ============================================================================

-- KPIs
CREATE INDEX IF NOT EXISTS idx_kpis_organization_id ON public.kpis(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpis_owner_id ON public.kpis(owner_id);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON public.kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON public.kpis(status);
CREATE INDEX IF NOT EXISTS idx_kpis_aligned_goal_id ON public.kpis(aligned_goal_id);
CREATE INDEX IF NOT EXISTS idx_kpis_is_active ON public.kpis(is_active);
CREATE INDEX IF NOT EXISTS idx_kpis_department ON public.kpis(department);

-- KPI Measurements
CREATE INDEX IF NOT EXISTS idx_kpi_measurements_organization_id ON public.kpi_measurements(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_measurements_kpi_id ON public.kpi_measurements(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_measurements_measured_at ON public.kpi_measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_measurements_measured_by ON public.kpi_measurements(measured_by);

-- KPI Alerts
CREATE INDEX IF NOT EXISTS idx_kpi_alerts_organization_id ON public.kpi_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_alerts_kpi_id ON public.kpi_alerts(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_alerts_is_active ON public.kpi_alerts(is_active);

-- Goals (new columns)
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON public.goals(goal_type);

-- SECTION 6: Triggers
-- ============================================================================

-- Trigger for updated_at on kpis
DROP TRIGGER IF EXISTS update_kpis_updated_at ON public.kpis;
CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on kpi_alerts
DROP TRIGGER IF EXISTS update_kpi_alerts_updated_at ON public.kpi_alerts;
CREATE TRIGGER update_kpi_alerts_updated_at
  BEFORE UPDATE ON public.kpi_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- SECTION 7: Views for Reporting
-- ============================================================================

-- View: KPIs with latest measurement
CREATE OR REPLACE VIEW public.kpis_with_latest_measurement AS
SELECT
  k.*,
  m.measured_value as latest_measured_value,
  m.measured_at as latest_measured_at,
  m.measured_by as latest_measured_by,
  CASE
    WHEN k.target_value IS NOT NULL AND k.current_value IS NOT NULL THEN
      ROUND(((k.current_value - k.baseline_value) * 100.0 / NULLIF(k.target_value - k.baseline_value, 0)), 2)
    ELSE NULL
  END as progress_percentage,
  CASE
    WHEN k.current_value >= k.target_min AND k.current_value <= k.target_max THEN 'on_track'
    WHEN k.current_value < k.target_min THEN 'below_target'
    WHEN k.current_value > k.target_max THEN 'above_target'
    ELSE 'needs_attention'
  END as calculated_status
FROM public.kpis k
LEFT JOIN LATERAL (
  SELECT measured_value, measured_at, measured_by
  FROM public.kpi_measurements
  WHERE kpi_id = k.id
  ORDER BY measured_at DESC
  LIMIT 1
) m ON true
WHERE k.deleted_at IS NULL;

-- View: KPI Performance Trends
CREATE OR REPLACE VIEW public.kpi_performance_trends AS
SELECT
  k.id as kpi_id,
  k.name,
  k.organization_id,
  k.owner_id,
  k.category,
  COUNT(m.id) as total_measurements,
  AVG(m.measured_value) as avg_value,
  MIN(m.measured_value) as min_value,
  MAX(m.measured_value) as max_value,
  STDDEV(m.measured_value) as stddev_value,
  MAX(m.measured_at) as last_measurement_date,
  MIN(m.measured_at) as first_measurement_date
FROM public.kpis k
LEFT JOIN public.kpi_measurements m ON k.id = m.kpi_id
WHERE k.deleted_at IS NULL
GROUP BY k.id, k.name, k.organization_id, k.owner_id, k.category;

-- SECTION 8: Helper Functions
-- ============================================================================

-- Function to calculate KPI status based on thresholds
CREATE OR REPLACE FUNCTION calculate_kpi_status(
  current_val NUMERIC,
  target_min_val NUMERIC,
  target_max_val NUMERIC
)
RETURNS TEXT AS $$
BEGIN
  IF current_val IS NULL THEN
    RETURN 'needs_attention';
  END IF;

  IF target_min_val IS NOT NULL AND current_val < target_min_val THEN
    RETURN 'below_target';
  END IF;

  IF target_max_val IS NOT NULL AND current_val > target_max_val THEN
    RETURN 'above_target';
  END IF;

  RETURN 'on_track';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update KPI current_value from latest measurement
CREATE OR REPLACE FUNCTION update_kpi_current_value()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.kpis
  SET
    current_value = NEW.measured_value,
    last_measured_at = NEW.measured_at,
    status = calculate_kpi_status(NEW.measured_value, target_min, target_max)
  WHERE id = NEW.kpi_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update KPI when new measurement is added
DROP TRIGGER IF EXISTS trigger_update_kpi_on_measurement ON public.kpi_measurements;
CREATE TRIGGER trigger_update_kpi_on_measurement
  AFTER INSERT ON public.kpi_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_kpi_current_value();

-- SECTION 9: Seed Data (Examples)
-- ============================================================================

-- Example KPI categories with descriptions
COMMENT ON COLUMN public.kpis.category IS 'KPI Category:
- revenue: Revenue growth rate, MRR, ARR, etc.
- customer: Customer satisfaction, NPS, churn rate, CAC, LTV
- operational: Cycle time, throughput, error rate, uptime
- employee: Engagement score, turnover rate, productivity
- quality: Defect rate, customer complaints, SLA compliance
- efficiency: Cost per unit, resource utilization, time to market
- custom: Organization-specific metrics';

COMMENT ON TABLE public.kpis IS 'KPIs (Key Performance Indicators) for ongoing performance monitoring.
Unlike OKRs which are time-bound and aspirational, KPIs are continuous metrics used to track business health.';

COMMENT ON TABLE public.goals IS 'Goals table extended to support OKRs (Objectives & Key Results).
OKRs are typically:
- Time-bound (quarterly or annual)
- Aspirational (60-70% achievement is considered success)
- Measurable through Key Results
- Aligned across organization levels';

-- Migration Complete
COMMENT ON SCHEMA public IS 'Targetym HR Platform - Schema with OKRs and KPIs Separation v1.1';
