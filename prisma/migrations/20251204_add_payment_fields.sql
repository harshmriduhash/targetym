-- Migration: Add payment tracking fields for Razorpay and Stripe
-- Run this file manually or integrate into your migration workflow

ALTER TABLE IF EXISTS organizations
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;

-- Create a simple payments audit table
CREATE TABLE IF NOT EXISTS payments_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  provider TEXT,
  provider_payment_id TEXT,
  provider_subscription_id TEXT,
  amount BIGINT,
  currency TEXT,
  status TEXT,
  raw_event JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
