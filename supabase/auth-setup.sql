-- ============================================================================
-- SUPABASE AUTH SETUP - Tables Minimales pour l'Authentification
-- ============================================================================
-- Ce script crée uniquement les tables essentielles pour Supabase Auth
-- Exécutez ce script dans Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Table Organizations (Multi-tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.organizations IS 'Organizations table for multi-tenancy';

-- Index pour recherche rapide par slug
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 2. Table Profiles (Profils utilisateurs liés à auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase auth.users';

-- Make sure organization_id is nullable (in case table already exists with NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'organization_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN organization_id DROP NOT NULL;
    RAISE NOTICE '✅ organization_id is now nullable';
  END IF;
END $$;

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Fonction: Créer automatiquement un profil lors de l'inscription
-- ============================================================================
-- NOTE: Le trigger sur auth.users nécessite des permissions superuser
-- Nous allons utiliser une approche alternative via Supabase Auth Hooks (Dashboard)
-- Pour l'instant, créez les profils manuellement ou via l'application

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get or create default organization
  SELECT id INTO default_org_id
  FROM public.organizations
  WHERE slug = 'default-org'
  LIMIT 1;

  -- If no default org exists, create one
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES ('Default Organization', 'default-org')
    RETURNING id INTO default_org_id;
  END IF;

  -- Insert profile with default organization
  INSERT INTO public.profiles (id, email, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    default_org_id
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically create a profile when a user signs up';

-- 4. Alternative: Créer le trigger via SQL (nécessite supabase_admin)
-- ============================================================================
-- Si vous avez les permissions, exécutez ceci séparément:
-- (Sinon, configurez via Dashboard → Authentication → Hooks)

DO $$
BEGIN
  -- Essayer de créer le trigger
  BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();

    RAISE NOTICE '✅ Trigger créé avec succès';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer le trigger automatiquement';
    RAISE NOTICE 'Configuration manuelle requise:';
    RAISE NOTICE '1. Allez dans Dashboard → Authentication → Hooks';
    RAISE NOTICE '2. Créez un "Database Webhook" pour l''événement "user.created"';
    RAISE NOTICE '3. Ou créez les profils manuellement après inscription';
  END;
END $$;

-- 5. Fonction: Mettre à jour updated_at automatiquement
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at IS 'Update updated_at timestamp on row update';

-- Triggers pour updated_at
CREATE TRIGGER handle_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update their organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
    OR id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Helper Function: Get user's organization_id
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_organization_id IS 'Returns organization_id for the currently authenticated user';

GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;

-- 8. Helper Function: Check if user has a specific role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = required_role
  );
$$;

COMMENT ON FUNCTION public.has_role IS 'Check if current user has a specific role';

GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated;

-- 9. Créer une organisation par défaut (pour les tests)
-- ============================================================================
INSERT INTO public.organizations (name, slug)
VALUES ('Default Organization', 'default-org')
ON CONFLICT (slug) DO NOTHING;

-- 10. Grant permissions
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ============================================================================
-- 11. Créer les profils pour les utilisateurs existants
-- ============================================================================
-- Pour les utilisateurs qui se sont inscrits avant l'exécution de ce script
-- Note: full_name est une colonne générée, on n'insère pas de valeur

INSERT INTO public.profiles (id, email, organization_id)
SELECT
  u.id,
  u.email,
  (SELECT id FROM public.organizations WHERE slug = 'default-org' LIMIT 1) as organization_id
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SETUP COMPLET
-- ============================================================================

-- Vérification des tables créées
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO org_count FROM public.organizations;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ SUPABASE AUTH SETUP TERMINÉ';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques:';
  RAISE NOTICE '  - Utilisateurs auth.users: %', user_count;
  RAISE NOTICE '  - Profils créés: %', profile_count;
  RAISE NOTICE '  - Organisations: %', org_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables créées:';
  RAISE NOTICE '  - organizations';
  RAISE NOTICE '  - profiles';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Triggers créés:';
  RAISE NOTICE '  - handle_organizations_updated_at';
  RAISE NOTICE '  - handle_profiles_updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS Policies activées';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Helper functions disponibles:';
  RAISE NOTICE '  - get_user_organization_id()';
  RAISE NOTICE '  - has_role(role_name)';
  RAISE NOTICE '';

  IF user_count > profile_count THEN
    RAISE NOTICE '⚠️ ATTENTION: % utilisateur(s) sans profil!', (user_count - profile_count);
    RAISE NOTICE 'Exécutez cette requête pour les créer:';
    RAISE NOTICE 'INSERT INTO public.profiles (id, email, organization_id)';
    RAISE NOTICE 'SELECT id, email, (SELECT id FROM organizations WHERE slug = ''default-org'')';
    RAISE NOTICE 'FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);';
  ELSE
    RAISE NOTICE '✅ Tous les utilisateurs ont un profil';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 Supabase Auth est prêt !';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '  1. Rafraîchissez votre application (F5)';
  RAISE NOTICE '  2. Connectez-vous avec votre compte';
  RAISE NOTICE '  3. Le dashboard devrait maintenant fonctionner';
  RAISE NOTICE '';

  IF profile_count > 0 AND org_count > 0 THEN
    RAISE NOTICE '💡 Conseil: Assignez une organisation à vos utilisateurs:';
    RAISE NOTICE 'UPDATE profiles SET organization_id = (SELECT id FROM organizations LIMIT 1)';
    RAISE NOTICE 'WHERE organization_id IS NULL;';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
END $$;
