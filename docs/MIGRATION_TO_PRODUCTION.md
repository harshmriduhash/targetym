# 🚀 Migration vers Production Supabase

## 📊 État Actuel

### Base de Données Production
- **URL**: `https://juuekovwshynwgjkqkbu.supabase.co`
- **Project ID**: `juuekovwshynwgjkqkbu`
- **Status**: Configurée dans `.env.local`

### Migrations Locales (14 fichiers)
```
✅ 20250109000000_create_complete_schema.sql
✅ 20250109000000_5_create_helper_functions.sql
✅ 20250109000001_rls_policies_complete.sql
✅ 20250109000002_views_and_functions.sql
✅ 20250109000003_enable_realtime.sql
✅ 20250109000004_add_ai_fields_candidates.sql
✅ 20250109000005_add_performance_indexes.sql
✅ 20250109000006_rls_ai_features.sql
✅ 20250109000007_enable_rls_all_tables.sql
✅ 20251010000001_create_cvs_storage_bucket.sql
✅ 20251011000000_add_kpis_table.sql
✅ 20251011000001_kpis_rls_policies.sql
✅ 20251012105148_add_settings_tables.sql
✅ 20251012120000_create_notifications_system.sql
```

❌ **Migration supprimée**: `20251010000000_add_clerk_sync.sql` (Clerk removed)

---

## 🎯 Plan de Migration

### Option 1: Via Supabase Dashboard (Recommandé)

#### Étape 1: Accéder au SQL Editor
1. Ouvrir: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql/new
2. Se connecter à votre compte Supabase

#### Étape 2: Appliquer les Migrations (Dans l'ordre!)

**Migration 1: Schéma Complet**
```bash
# Ouvrir: supabase/migrations/20250109000000_create_complete_schema.sql
# Copier le contenu
# Coller dans SQL Editor et exécuter
```

**Migration 2: Fonctions Helper**
```bash
# Ouvrir: supabase/migrations/20250109000000_5_create_helper_functions.sql
# Copier → Coller → Exécuter
```

**Migration 3: Politiques RLS**
```bash
# Ouvrir: supabase/migrations/20250109000001_rls_policies_complete.sql
# Copier → Coller → Exécuter
```

**Migrations 4-14: Suite**
```bash
# Répéter pour chaque fichier dans l'ordre:
20250109000002_views_and_functions.sql
20250109000003_enable_realtime.sql
20250109000004_add_ai_fields_candidates.sql
20250109000005_add_performance_indexes.sql
20250109000006_rls_ai_features.sql
20250109000007_enable_rls_all_tables.sql
20251010000001_create_cvs_storage_bucket.sql
20251011000000_add_kpis_table.sql
20251011000001_kpis_rls_policies.sql
20251012105148_add_settings_tables.sql
20251012120000_create_notifications_system.sql
```

#### Étape 3: Vérifier le Schéma

Après chaque migration, vérifier:
```sql
-- Lister les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Vérifier les fonctions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';
```

---

### Option 2: Via Supabase CLI (Avancé)

⚠️ **Prérequis**: Supabase CLI installé et configuré

#### Étape 1: Lier le Projet
```bash
supabase link --project-ref juuekovwshynwgjkqkbu
```

#### Étape 2: Push les Migrations
```bash
supabase db push
```

#### Étape 3: Vérifier
```bash
supabase db remote status
```

---

## 📝 Après Migration

### 1. Régénérer les Types TypeScript

**Option A: Via Dashboard**
1. Aller sur: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/api/types
2. Copier le contenu TypeScript généré
3. Remplacer le contenu de `src/types/database.types.ts`

**Option B: Via CLI (si link fonctionne)**
```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

### 2. Créer un Profil de Test

```sql
-- Dans SQL Editor
-- Créer une organisation test
INSERT INTO organizations (id, name, slug, created_at)
VALUES (
  gen_random_uuid(),
  'Organisation Test',
  'org-test',
  NOW()
)
RETURNING *;

-- Note: Copiez l'ID de l'organisation retourné

-- Créer un utilisateur test via Supabase Auth
-- Dashboard → Authentication → Users → Add User
-- Email: test@targetym.com
-- Password: TestPassword123!

-- Lier le profil à l'organisation
-- Remplacez <user_id> et <org_id> par les valeurs réelles
INSERT INTO profiles (id, organization_id, role, created_at)
VALUES (
  '<user_id>',  -- ID de l'utilisateur créé
  '<org_id>',   -- ID de l'organisation
  'admin',
  NOW()
);
```

### 3. Tester l'Authentification

```bash
# Démarrer le serveur
npm run dev

# Ouvrir http://localhost:3001/auth/signin
# Se connecter avec: test@targetym.com / TestPassword123!
```

### 4. Vérifier RLS Policies

```sql
-- Tester qu'un utilisateur ne peut voir que son organisation
SET request.jwt.claims = '{"sub": "<user_id>"}';

-- Devrait retourner seulement les données de l'organisation de l'utilisateur
SELECT * FROM goals;
SELECT * FROM job_postings;
SELECT * FROM performance_reviews;
```

---

## ✅ Checklist de Validation

### Base de Données
- [ ] Toutes les 14 migrations appliquées
- [ ] Tables créées (organizations, profiles, goals, etc.)
- [ ] RLS activé sur toutes les tables
- [ ] Fonctions helper créées (get_user_organization_id, has_role, etc.)
- [ ] Views créées (goals_with_progress, job_postings_with_stats, etc.)
- [ ] Indexes créés
- [ ] Realtime activé
- [ ] Storage bucket `cvs` créé

### Types TypeScript
- [ ] `src/types/database.types.ts` régénéré
- [ ] Aucune erreur TypeScript (`npm run type-check`)

### Authentification
- [ ] Utilisateur test créé
- [ ] Profil lié à une organisation
- [ ] Connexion fonctionne sur `/auth/signin`
- [ ] Session persiste après rechargement
- [ ] Redirection vers `/dashboard` après login

### RLS & Sécurité
- [ ] RLS policies testées
- [ ] Isolation multi-tenant fonctionne
- [ ] Utilisateur ne peut voir que son organisation
- [ ] Rôles (admin, hr, manager, employee) fonctionnent

### Application
- [ ] Build réussit (`npm run build`)
- [ ] Tests passent (`npm run test`)
- [ ] Couverture >= 80% (`npm run test:coverage`)
- [ ] Lint propre (`npm run lint`)

---

## 🚨 Problèmes Courants

### 1. "relation does not exist"
**Cause**: Migration pas appliquée dans l'ordre
**Solution**: Recommencer depuis la migration 1

### 2. "permission denied for schema"
**Cause**: Pas de droits sur le schéma
**Solution**: Vérifier que vous utilisez le service_role key

### 3. "duplicate key value violates unique constraint"
**Cause**: Migration déjà appliquée partiellement
**Solution**:
```sql
-- Vérifier l'état
SELECT * FROM supabase_migrations.schema_migrations;

-- Reset si nécessaire (ATTENTION: perd les données!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### 4. Types TypeScript obsolètes
**Cause**: Types pas régénérés après migration
**Solution**: Régénérer via dashboard (voir ci-dessus)

---

## 📊 Schéma Final Attendu

### Tables Principales (21 tables)
```
✓ organizations
✓ profiles
✓ goals
✓ key_results
✓ goal_collaborators
✓ job_postings
✓ candidates
✓ interviews
✓ performance_reviews
✓ performance_ratings
✓ peer_feedback
✓ kpis
✓ kpi_measurements
✓ kpi_alerts
✓ settings_categories
✓ settings
✓ notifications
✓ notification_preferences
✓ registry_components
✓ registry_examples
✓ audit_logs
```

### Fonctions (4 fonctions)
```
✓ get_user_organization_id()
✓ has_role(text)
✓ has_any_role(text[])
✓ is_manager_of(uuid)
```

### Views (3 views)
```
✓ goals_with_progress
✓ job_postings_with_stats
✓ performance_review_summary
```

### Storage Buckets
```
✓ cvs (pour les CVs des candidats)
```

---

## 🎯 Prochaines Étapes

Après validation complète:

1. **Environnement de Staging**
   - Créer un projet Supabase de staging
   - Appliquer les mêmes migrations
   - Tester les fonctionnalités critiques

2. **CI/CD**
   - Configurer GitHub Actions
   - Automatiser les tests
   - Automatiser le déploiement

3. **Monitoring**
   - Configurer les alertes Supabase
   - Mettre en place les logs
   - Surveiller les performances

4. **Documentation**
   - Mettre à jour le README
   - Documenter les processus
   - Former l'équipe

---

## 📞 Support

En cas de problème:
1. Vérifier les logs: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/logs
2. Consulter la doc: https://supabase.com/docs/guides/database/migrations
3. Communauté: https://supabase.com/discord

---

**Date de création**: 2025-10-23
**Dernière mise à jour**: 2025-10-23
**Version**: 1.0.0
