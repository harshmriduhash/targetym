-- Migration: Create orders table to map provider orders/sessions to organizations
-- Run via your migration tooling or psql

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  provider TEXT NOT NULL,
  provider_order_id TEXT NOT NULL,
  amount BIGINT,
  currency TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_provider_order_id ON orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_organization_id ON orders(organization_id);
