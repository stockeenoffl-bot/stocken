-- Zonal Edge Compliance & Subscription Plans Update
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure user_role enum includes 'editor' and 'analyst'
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'analyst';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Deactivate previous non-compliant plans if any
UPDATE public.subscription_plans
SET active = FALSE
WHERE slug NOT IN ('free-trial', 'monthly', 'quarterly', 'annual');

-- 3. Upsert the 4 Compliance Products (in INR)
INSERT INTO public.subscription_plans (
  name,
  slug,
  description,
  price,
  currency,
  billing_interval,
  features,
  active,
  sort_order
)
VALUES
  (
    'Free Trial – 7 Days',
    'free-trial',
    'Complimentary 7-day access to test market structure analytics. No credit card required.',
    0,
    'INR',
    '7 days',
    '["Access to 1 analysis/zone per day", "End-of-day (EOD) full market analysis", "Basic Nifty & Sensex structure", "7 days full trial period"]'::jsonb,
    TRUE,
    1
  ),
  (
    'Monthly Subscription',
    'monthly',
    'Comprehensive intraday market analysis, real-time zones & Open Interest intelligence.',
    499,
    'INR',
    '1 month',
    '["Multiple market zones", "Liquidation levels", "Invalidation levels", "Detailed market analysis", "Open Interest (OI) data", "Real-time Alice Blue candle sync"]'::jsonb,
    TRUE,
    2
  ),
  (
    'Quarterly Subscription',
    'quarterly',
    '3 months of uninterrupted market structure analysis with priority level updates.',
    1299,
    'INR',
    '3 months',
    '["Multiple market zones", "Liquidation levels", "Invalidation levels", "Detailed market analysis", "Open Interest (OI) data", "Save over 13% compared to monthly"]'::jsonb,
    TRUE,
    3
  ),
  (
    'Annual Subscription',
    'annual',
    'Full year of deep algorithmic market structure analysis and institutional orderflow.',
    4999,
    'INR',
    '12 months',
    '["Multiple market zones", "Liquidation levels", "Invalidation levels", "Detailed market analysis", "Open Interest (OI) data", "Maximum value: Save ₹989 annually"]'::jsonb,
    TRUE,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  billing_interval = EXCLUDED.billing_interval,
  features = EXCLUDED.features,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order;

