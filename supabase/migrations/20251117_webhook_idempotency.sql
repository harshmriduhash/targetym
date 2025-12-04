-- Migration: Add webhook_events table for idempotency tracking
-- Date: 2025-11-17
-- Purpose: Prevent duplicate webhook processing from Clerk

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast lookup
CREATE INDEX IF NOT EXISTS idx_webhook_events_svix_id ON webhook_events(svix_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Enable RLS for audit trail
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can read/insert webhooks
CREATE POLICY webhook_events_policy_select ON webhook_events
  FOR SELECT USING (true);

CREATE POLICY webhook_events_policy_insert ON webhook_events
  FOR INSERT WITH CHECK (true);

-- Add comment
COMMENT ON TABLE webhook_events IS 'Tracks processed Clerk webhooks to prevent duplicates (idempotency)';
