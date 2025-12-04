-- ============================================================================
-- Migration: Fix Profiles RLS Recursion - Final Fix
-- Created: 2025-11-14
-- Description: Remove recursive policies and use simple authentication checks
-- ============================================================================

-- Drop all existing recursive policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "HR can update profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_simple" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_simple" ON public.profiles;

-- Create non-recursive policies

-- Policy 1: Users can view all profiles (org filtering in app)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Users/triggers can insert profiles (for signup flow)
CREATE POLICY "profiles_insert_authenticated"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true); -- Allow insert for authenticated users and triggers

-- Policy 3: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Add helpful comments
COMMENT ON POLICY "profiles_select_all" ON public.profiles IS
  'Allow authenticated users to SELECT profiles - organization filtering handled in application layer';

COMMENT ON POLICY "profiles_insert_authenticated" ON public.profiles IS
  'Allow INSERT for signup triggers and authenticated users';

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS
  'Users can only UPDATE their own profile';

COMMENT ON POLICY "profiles_delete_own" ON public.profiles IS
  'Users can only DELETE their own profile';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ============================================================================
-- Migration completed - No more recursion!
-- ============================================================================
