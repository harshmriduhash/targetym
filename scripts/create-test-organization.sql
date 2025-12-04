-- Script SQL pour créer une organisation de test et un profil utilisateur
-- Exécutez ce script dans Supabase SQL Editor après avoir créé votre compte

-- 1. Créer une organisation de test
INSERT INTO public.organizations (
  name,
  slug,
  subscription_plan,
  subscription_status,
  trial_ends_at
) VALUES (
  'Targetym Demo',
  'targetym-demo',
  'professional',
  'active',
  NOW() + INTERVAL '30 days'
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- 2. Créer un profil pour votre utilisateur
-- REMPLACEZ 'VOTRE-USER-ID' par votre vrai user ID de auth.users
-- Vous pouvez le trouver avec: SELECT id, email FROM auth.users;

INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  avatar_url
) VALUES (
  'VOTRE-USER-ID', -- <- REMPLACEZ par votre UUID
  'test@targetym.com',
  'Test',
  'User',
  'admin',
  (SELECT id FROM public.organizations WHERE slug = 'targetym-demo' LIMIT 1),
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  role = EXCLUDED.role;

-- 3. Vérifiez que tout est créé
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  o.name as organization_name,
  o.subscription_plan
FROM public.profiles p
JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'test@targetym.com';
