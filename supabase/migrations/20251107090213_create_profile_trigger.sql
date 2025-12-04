-- ============================================================================
-- Migration: Create Profile Trigger and Auth Policies
-- Created: 2025-11-07
-- Description: Automatically create user profile on signup + RLS policies
-- ============================================================================

-- SECTION 1: Function to handle new user creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Try to get an existing organization or create a default one
  SELECT id INTO default_org_id
  FROM public.organizations
  WHERE slug = 'default'
  LIMIT 1;

  -- If no default organization exists, create one
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, subscription_tier, subscription_status)
    VALUES ('Default Organization', 'default', 'free', 'active')
    RETURNING id INTO default_org_id;
  END IF;

  -- Create the user profile
  INSERT INTO public.profiles (
    id,
    organization_id,
    email,
    first_name,
    last_name,
    role,
    employment_status,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    default_org_id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'employee', -- Default role
    'active',
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up';

-- SECTION 2: Create trigger on auth.users
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECTION 3: RLS Policies for Profiles Table
-- ============================================================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view team profiles" ON public.profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can view profiles in their organization
CREATE POLICY "Users can view profiles in same organization"
ON public.profiles FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow profile creation during signup (via trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 5: Admins can manage all profiles in their organization
CREATE POLICY "Admins can manage all profiles in organization"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND organization_id = public.profiles.organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND organization_id = public.profiles.organization_id
  )
);

-- Policy 6: HR can view and update profiles in their organization
CREATE POLICY "HR can update profiles in organization"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hr')
    AND organization_id = public.profiles.organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hr')
    AND organization_id = public.profiles.organization_id
  )
);

-- SECTION 4: Function to update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- SECTION 5: Grant necessary permissions
-- ============================================================================

-- Grant necessary permissions on profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Grant permissions on organizations table
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT, INSERT ON public.organizations TO authenticated;

COMMENT ON TABLE public.profiles IS 'User profiles with organization membership and role';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id) - automatically set on signup';
COMMENT ON COLUMN public.profiles.organization_id IS 'Organization the user belongs to';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin, hr, manager, or employee';
COMMENT ON COLUMN public.profiles.employment_status IS 'Employment status: active, inactive, on_leave, or terminated';
