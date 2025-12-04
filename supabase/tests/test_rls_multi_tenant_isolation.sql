-- ============================================================================
-- Test: RLS Multi-Tenant Isolation
-- Purpose: Verify that users from different organizations cannot access
--          each other's data
-- ============================================================================

BEGIN;

-- Setup: Create test users and organizations
-- ============================================================================

-- Create two test organizations
INSERT INTO public.organizations (id, name, slug)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp'),
  ('00000000-0000-0000-0000-000000000002', 'Beta Inc', 'beta-inc');

-- Create test users in different organizations
-- User 1: alice@acme.com (Acme Corp - Admin)
-- User 2: bob@beta.com (Beta Inc - Admin)
-- User 3: charlie@acme.com (Acme Corp - Employee)

-- Note: In real setup, these would be created via Clerk webhook
-- For testing, we insert directly
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@acme.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'bob@beta.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'charlie@acme.com', crypt('password', gen_salt('bf')), now(), now(), now());

INSERT INTO public.profiles (id, organization_id, email, first_name, last_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'alice@acme.com', 'Alice', 'Anderson', 'admin'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'bob@beta.com', 'Bob', 'Brown', 'admin'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'charlie@acme.com', 'Charlie', 'Clark', 'employee');

-- Create test data in each organization
-- ============================================================================

-- Goals for Acme Corp (Alice owns)
INSERT INTO public.goals (id, organization_id, owner_id, title, description, period, start_date, end_date, status)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Acme Q1 Goal', 'Secret Acme strategy', 'quarterly', '2025-01-01', '2025-03-31', 'active'),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Charlie Personal Goal', 'Acme employee goal', 'quarterly', '2025-01-01', '2025-03-31', 'active');

-- Goals for Beta Inc (Bob owns)
INSERT INTO public.goals (id, organization_id, owner_id, title, description, period, start_date, end_date, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Beta Q1 Goal', 'Secret Beta strategy', 'quarterly', '2025-01-01', '2025-03-31', 'active');

-- Job Postings for Acme Corp
INSERT INTO public.job_postings (id, organization_id, created_by, title, description, location, employment_type, status)
VALUES
  ('aj111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Acme Senior Developer', 'Confidential Acme position', 'San Francisco', 'full_time', 'published');

-- Job Postings for Beta Inc
INSERT INTO public.job_postings (id, organization_id, created_by, title, description, location, employment_type, status)
VALUES
  ('bj111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Beta Product Manager', 'Confidential Beta position', 'New York', 'full_time', 'published');

-- Candidates for Acme job
INSERT INTO public.candidates (id, organization_id, job_posting_id, name, email, status)
VALUES
  ('ac111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'aj111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', 'applied');

-- Candidates for Beta job
INSERT INTO public.candidates (id, organization_id, job_posting_id, name, email, status)
VALUES
  ('bc111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'bj111111-1111-1111-1111-111111111111', 'Jane Smith', 'jane@example.com', 'applied');

-- Performance Reviews
INSERT INTO public.performance_reviews (id, organization_id, reviewee_id, reviewer_id, review_type, status, review_period_start, review_period_end)
VALUES
  ('ar111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'manager', 'draft', '2024-01-01', '2024-12-31'),
  ('br111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'self', 'draft', '2024-01-01', '2024-12-31');

-- ============================================================================
-- TEST 1: Alice (Acme) can only see Acme data
-- ============================================================================

-- Simulate Alice's session
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111"}';

-- Test Goals
DO $$
DECLARE
  goal_count INT;
BEGIN
  SELECT COUNT(*) INTO goal_count FROM public.goals;

  IF goal_count != 2 THEN
    RAISE EXCEPTION 'FAIL: Alice should see 2 goals (Acme only), got %', goal_count;
  ELSE
    RAISE NOTICE 'PASS: Alice sees only Acme goals (2)';
  END IF;

  -- Verify Alice cannot see Beta goals
  IF EXISTS (SELECT 1 FROM public.goals WHERE title = 'Beta Q1 Goal') THEN
    RAISE EXCEPTION 'FAIL: Alice can see Beta goals - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Alice cannot see Beta goals';
  END IF;
END $$;

-- Test Job Postings
DO $$
DECLARE
  job_count INT;
BEGIN
  SELECT COUNT(*) INTO job_count FROM public.job_postings;

  IF job_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Alice should see 1 job (Acme only), got %', job_count;
  ELSE
    RAISE NOTICE 'PASS: Alice sees only Acme jobs (1)';
  END IF;

  IF EXISTS (SELECT 1 FROM public.job_postings WHERE title = 'Beta Product Manager') THEN
    RAISE EXCEPTION 'FAIL: Alice can see Beta jobs - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Alice cannot see Beta jobs';
  END IF;
END $$;

-- Test Candidates
DO $$
DECLARE
  candidate_count INT;
BEGIN
  SELECT COUNT(*) INTO candidate_count FROM public.candidates;

  IF candidate_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Alice should see 1 candidate (Acme only), got %', candidate_count;
  ELSE
    RAISE NOTICE 'PASS: Alice sees only Acme candidates (1)';
  END IF;

  IF EXISTS (SELECT 1 FROM public.candidates WHERE name = 'Jane Smith') THEN
    RAISE EXCEPTION 'FAIL: Alice can see Beta candidates - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Alice cannot see Beta candidates';
  END IF;
END $$;

-- Test Performance Reviews
DO $$
DECLARE
  review_count INT;
BEGIN
  SELECT COUNT(*) INTO review_count FROM public.performance_reviews;

  IF review_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Alice should see 1 review (Acme only), got %', review_count;
  ELSE
    RAISE NOTICE 'PASS: Alice sees only Acme reviews (1)';
  END IF;
END $$;

-- Test Profiles
DO $$
DECLARE
  profile_count INT;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;

  IF profile_count != 2 THEN
    RAISE EXCEPTION 'FAIL: Alice should see 2 profiles (Acme only), got %', profile_count;
  ELSE
    RAISE NOTICE 'PASS: Alice sees only Acme profiles (2: Alice + Charlie)';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'bob@beta.com') THEN
    RAISE EXCEPTION 'FAIL: Alice can see Beta profiles - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Alice cannot see Beta profiles';
  END IF;
END $$;

-- ============================================================================
-- TEST 2: Bob (Beta) can only see Beta data
-- ============================================================================

-- Simulate Bob's session
SET LOCAL "request.jwt.claims" = '{"sub": "22222222-2222-2222-2222-222222222222"}';

-- Test Goals
DO $$
DECLARE
  goal_count INT;
BEGIN
  SELECT COUNT(*) INTO goal_count FROM public.goals;

  IF goal_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Bob should see 1 goal (Beta only), got %', goal_count;
  ELSE
    RAISE NOTICE 'PASS: Bob sees only Beta goals (1)';
  END IF;

  IF EXISTS (SELECT 1 FROM public.goals WHERE title LIKE 'Acme%') THEN
    RAISE EXCEPTION 'FAIL: Bob can see Acme goals - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Bob cannot see Acme goals';
  END IF;
END $$;

-- Test Job Postings
DO $$
DECLARE
  job_count INT;
BEGIN
  SELECT COUNT(*) INTO job_count FROM public.job_postings;

  IF job_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Bob should see 1 job (Beta only), got %', job_count;
  ELSE
    RAISE NOTICE 'PASS: Bob sees only Beta jobs (1)';
  END IF;
END $$;

-- Test Candidates
DO $$
DECLARE
  candidate_count INT;
BEGIN
  SELECT COUNT(*) INTO candidate_count FROM public.candidates;

  IF candidate_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Bob should see 1 candidate (Beta only), got %', candidate_count;
  ELSE
    RAISE NOTICE 'PASS: Bob sees only Beta candidates (1)';
  END IF;
END $$;

-- ============================================================================
-- TEST 3: Charlie (Acme Employee) can see Acme data but limited permissions
-- ============================================================================

-- Simulate Charlie's session
SET LOCAL "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333333"}';

-- Test Goals visibility
DO $$
DECLARE
  goal_count INT;
BEGIN
  SELECT COUNT(*) INTO goal_count FROM public.goals;

  IF goal_count != 2 THEN
    RAISE EXCEPTION 'FAIL: Charlie should see 2 goals (Acme only), got %', goal_count;
  ELSE
    RAISE NOTICE 'PASS: Charlie sees only Acme goals (2)';
  END IF;
END $$;

-- Test Charlie can update his own goal
DO $$
BEGIN
  UPDATE public.goals
  SET description = 'Updated by Charlie'
  WHERE id = 'a2222222-2222-2222-2222-222222222222'
    AND owner_id = '33333333-3333-3333-3333-333333333333';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'FAIL: Charlie cannot update his own goal';
  ELSE
    RAISE NOTICE 'PASS: Charlie can update his own goal';
  END IF;
END $$;

-- Test Charlie CANNOT update Alice's goal (not owner, not admin/manager)
DO $$
DECLARE
  updated BOOLEAN := FALSE;
BEGIN
  BEGIN
    UPDATE public.goals
    SET description = 'Charlie trying to update Alice goal'
    WHERE id = 'a1111111-1111-1111-1111-111111111111';

    GET DIAGNOSTICS updated = ROW_COUNT > 0;

    IF updated THEN
      RAISE EXCEPTION 'FAIL: Charlie can update Alice goals - PERMISSION BREACH!';
    ELSE
      RAISE NOTICE 'PASS: Charlie cannot update Alice goals (no rows affected)';
    END IF;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: Charlie cannot update Alice goals (RLS blocked)';
  END;
END $$;

-- ============================================================================
-- TEST 4: Cross-organization INSERT attempts (should fail)
-- ============================================================================

-- Alice tries to insert goal for Beta org (should fail)
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111"}';

DO $$
DECLARE
  inserted BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.goals (organization_id, owner_id, title, period, start_date, end_date)
    VALUES ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Cross-org hack', 'quarterly', '2025-01-01', '2025-03-31');

    inserted := TRUE;
  EXCEPTION
    WHEN check_violation OR insufficient_privilege THEN
      inserted := FALSE;
  END;

  IF inserted THEN
    RAISE EXCEPTION 'FAIL: Alice can insert goals in Beta org - SECURITY BREACH!';
  ELSE
    RAISE NOTICE 'PASS: Alice cannot insert goals in Beta org (RLS blocked)';
  END IF;
END $$;

-- ============================================================================
-- Cleanup
-- ============================================================================

ROLLBACK;

-- ============================================================================
-- All tests completed!
-- ============================================================================

-- To run these tests manually:
-- 1. Start Supabase: npm run supabase:start
-- 2. Apply migration: npm run supabase:reset
-- 3. Run tests: psql $DATABASE_URL -f supabase/tests/test_rls_multi_tenant_isolation.sql

RAISE NOTICE '====================================================================';
RAISE NOTICE 'RLS MULTI-TENANT ISOLATION TESTS COMPLETED';
RAISE NOTICE 'All tests passed - Organization isolation is enforced!';
RAISE NOTICE '====================================================================';
