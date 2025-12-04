# Guide de Migration Supabase - Targetym

## Vue d'ensemble

Ce guide décrit comment appliquer les migrations de la base de données Targetym avec le nouveau schéma complet incluant le registry de composants et les modules HR étendus.

## Migrations Créées

### 1. `20250109000000_create_complete_schema.sql`
**Schéma complet de la base de données**

Contenu:
- ✅ **Core Tables**: Organizations, Profiles
- ✅ **Goals & OKRs**: Goals, Key Results, Goal Collaborators
- ✅ **Recruitment**: Job Postings, Candidates, Interviews, Candidate Notes
- ✅ **Performance**: Reviews, Criteria, Ratings, Goals, Peer Feedback
- ✅ **Career Development**: Career paths et mentoring
- ✅ **Registry** (NOUVEAU): Components, Examples, Builds, Publications
- ✅ **Agents** (NOUVEAU): Activities, Communications
- ✅ **Integrations** (NOUVEAU): Microsoft 365, Asana, Notion, Webhooks, Sync Logs
- ✅ **Audit**: Comprehensive audit logging

**Nouvelles Tables**:
- `registry_components` - Catalogue des composants
- `registry_examples` - Exemples de code
- `registry_builds` - Historique des builds
- `registry_publications` - Historique des publications
- `agent_activities` - Tracking des agents IA
- `agent_communications` - Communication inter-agents
- `integrations` - Configurations d'intégration
- `integration_webhooks` - Webhooks entrants
- `integration_sync_logs` - Logs de synchronisation
- `audit_logs` - Audit trail complet

**Indexes**:
- 40+ indexes pour optimisation des performances
- Indexes sur organization_id, status, dates, etc.

**Triggers**:
- Auto-update de `updated_at` sur tous les changements
- Génération automatique de `full_name` pour profiles et candidates

### 2. `20250109000001_rls_policies_complete.sql`
**Politiques RLS (Row-Level Security)**

Contenu:
- ✅ RLS activé sur toutes les tables
- ✅ Politiques multi-tenant (isolation par organization_id)
- ✅ Politiques basées sur les rôles (admin, hr, manager, employee)
- ✅ Politiques pour registry (global + org-specific)
- ✅ Politiques pour agents (accès système)
- ✅ Politiques pour intégrations (admin/hr uniquement)
- ✅ Audit logs (append-only)

**Helper Functions**:
- `get_user_organization_id()` - Récupère l'org de l'utilisateur
- `has_role(role_name)` - Vérifie le rôle
- `has_any_role(role_names[])` - Vérifie multiple rôles
- `is_manager_of(manager_id, employee_id)` - Vérifie hiérarchie
- `can_access_candidate(candidate_id)` - Accès candidat
- `is_component_accessible(component_id)` - Accès composant

**Audit Triggers**:
- Auto-logging des INSERT/UPDATE/DELETE sur tables critiques
- Capture old_values et new_values en JSONB
- Tracking de user_id et organization_id

### 3. `20250109000002_views_and_functions.sql`
**Vues et fonctions avancées**

**Views**:
- `goals_with_progress` - Goals avec calcul de progression
- `job_postings_with_stats` - Stats du pipeline de recrutement
- `candidates_with_details` - Détails candidats + interviews
- `performance_review_summary` - Résumés des évaluations
- `registry_component_stats` - Stats par catégorie
- `registry_latest_build` - Dernier build réussi
- `agent_activity_summary` - Performance des agents
- `integrations_health` - Santé des intégrations
- `organization_dashboard` - Métriques org complètes

**Materialized Views**:
- `mv_organization_metrics` - Cache des métriques org
- Refresh automatique possible avec pg_cron

**Functions**:
- `calculate_okr_health_score(goal_id)` - Score de santé OKR
- `get_team_performance_trend(team_id, months)` - Tendance perf équipe
- `get_recruitment_funnel(job_id, org_id)` - Métriques funnel
- `get_agent_performance(agent, days)` - Métriques agents
- `refresh_materialized_views()` - Refresh MV

## Installation

### Prérequis

```bash
# Supabase CLI installé
npm install -g supabase

# Project lié à Supabase
supabase link --project-ref <your-project-ref>
```

### Option 1: Migration Locale (Développement)

```bash
# 1. Démarrer Supabase local
npm run supabase:start

# 2. Vérifier le status
supabase status

# 3. Appliquer les migrations
supabase db reset

# 4. Générer les types TypeScript
npm run supabase:types

# 5. Vérifier les migrations
supabase migration list
```

### Option 2: Migration Production

```bash
# 1. Créer un backup de la base de données
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Tester en staging d'abord
supabase db push --dry-run

# 3. Appliquer à production
supabase db push

# 4. Vérifier que tout fonctionne
supabase db remote commit

# 5. Générer les types
npm run supabase:types
```

## Vérifications Post-Migration

### 1. Vérifier les Tables

```sql
-- Lister toutes les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait retourner 25+ tables
```

### 2. Vérifier RLS

```sql
-- Vérifier que RLS est activé sur toutes les tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Devrait retourner 0 lignes
```

### 3. Vérifier les Politiques

```sql
-- Compter les politiques RLS
SELECT
  schemaname,
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- Chaque table devrait avoir au moins 1 politique
```

### 4. Vérifier les Views

```sql
-- Lister toutes les vues
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait retourner 9+ vues
```

### 5. Vérifier les Functions

```sql
-- Lister toutes les fonctions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Devrait retourner 10+ fonctions
```

### 6. Tester les Helpers

```sql
-- Tester get_user_organization_id() (nécessite un user authentifié)
SELECT public.get_user_organization_id();

-- Tester has_role()
SELECT public.has_role('admin');

-- Tester calcul OKR health score (avec un goal_id existant)
SELECT public.calculate_okr_health_score('goal-uuid-here');
```

## Tests de Performance

### 1. Test de Requête Goals

```sql
-- Devrait être rapide avec les indexes
EXPLAIN ANALYZE
SELECT * FROM public.goals_with_progress
WHERE organization_id = 'org-uuid-here'
AND status = 'active'
LIMIT 10;
```

### 2. Test de Requête Recruitment

```sql
-- Pipeline funnel
EXPLAIN ANALYZE
SELECT * FROM public.get_recruitment_funnel(NULL, 'org-uuid-here');
```

### 3. Test de Performance Reviews

```sql
-- Summary avec stats
EXPLAIN ANALYZE
SELECT * FROM public.performance_review_summary
WHERE organization_id = 'org-uuid-here'
LIMIT 10;
```

## Données de Test (Optionnel)

```sql
-- Insérer une organisation de test
INSERT INTO public.organizations (name, slug, subscription_tier)
VALUES ('Test Org', 'test-org', 'pro')
RETURNING id;

-- Insérer un profil de test (nécessite un user auth.users)
-- Note: En production, Clerk/Auth gère ça via webhook

-- Insérer un composant registry de test
INSERT INTO public.registry_components (
  component_id,
  name,
  category,
  version,
  description,
  file_path,
  tags,
  is_published
) VALUES (
  'ui/test-button',
  'TestButton',
  'ui',
  '1.0.0',
  'Test button component',
  'components/ui/test-button.tsx',
  ARRAY['ui', 'test'],
  true
);

-- Vérifier
SELECT * FROM public.registry_component_stats;
```

## Rollback (Si Nécessaire)

### Rollback Local

```bash
# Revenir à l'état précédent
supabase db reset --version <previous-version>
```

### Rollback Production

```bash
# 1. Identifier la version précédente
supabase migration list

# 2. Restaurer depuis backup
psql -h <db-host> -U postgres -d postgres -f backup_YYYYMMDD_HHMMSS.sql

# 3. Ou créer migration de rollback manuelle
supabase migration new rollback_registry_schema
```

## Monitoring Post-Migration

### 1. Dashboard Supabase

- Vérifier les métriques de performance
- Surveiller les erreurs
- Vérifier l'utilisation du storage

### 2. Logs

```bash
# Logs temps réel
supabase logs -f

# Logs spécifiques
supabase logs --type postgres
```

### 3. Métriques

```sql
-- Taille des tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Stats des indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Optimisations Post-Migration

### 1. VACUUM & ANALYZE

```sql
-- Optimiser toutes les tables
VACUUM ANALYZE;

-- Ou table par table
VACUUM ANALYZE public.goals;
VACUUM ANALYZE public.candidates;
```

### 2. Refresh Materialized Views

```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_organization_metrics;

-- Ou via fonction
SELECT public.refresh_materialized_views();
```

### 3. Setup pg_cron (Production)

```sql
-- Activer l'extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Scheduler refresh MV toutes les heures
SELECT cron.schedule(
  'refresh-org-metrics',
  '0 * * * *',
  'SELECT public.refresh_materialized_views();'
);

-- Vérifier les jobs
SELECT * FROM cron.job;
```

## Troubleshooting

### Erreur: RLS Policy Denies Query

**Cause**: L'utilisateur n'a pas les permissions ou n'appartient pas à l'organization

**Solution**:
```sql
-- Vérifier l'organization de l'user
SELECT id, organization_id, role
FROM public.profiles
WHERE id = auth.uid();

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'goals';
```

### Erreur: Function Does Not Exist

**Cause**: Migration des fonctions pas appliquée

**Solution**:
```bash
# Réappliquer la migration
supabase db reset
```

### Erreur: View Already Exists

**Cause**: Vue créée manuellement avant migration

**Solution**:
```sql
-- Supprimer la vue existante
DROP VIEW IF EXISTS public.goals_with_progress CASCADE;

-- Réappliquer migration
```

## Checklist de Migration

- [ ] Backup de la base de données créé
- [ ] Migrations testées en local
- [ ] Tests unitaires passent
- [ ] RLS vérifié sur toutes les tables
- [ ] Politiques testées avec différents rôles
- [ ] Views retournent des données
- [ ] Functions exécutent correctement
- [ ] Indexes créés et utilisés
- [ ] Types TypeScript générés
- [ ] Tests d'intégration passent
- [ ] Performance acceptable
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

## Commandes Utiles

```bash
# Status Supabase
supabase status

# Lister migrations
supabase migration list

# Créer nouvelle migration
supabase migration new <name>

# Push vers production
supabase db push

# Générer types
npm run supabase:types

# Reset local DB
npm run supabase:reset

# Tester RLS policies
npm run supabase:test
```

## Support

- **Documentation Supabase**: https://supabase.com/docs
- **Issues GitHub**: https://github.com/targetym/targetym/issues
- **CLAUDE.md**: Voir le guide complet du projet

---

**Version**: 1.0.0
**Date**: 2025-01-09
**Auteur**: Targetym Team
