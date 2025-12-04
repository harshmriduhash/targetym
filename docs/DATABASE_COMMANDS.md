# 🗄️ Database Commands Guide - Targetym Phase 2

## Vue d'Ensemble

Guide complet des commandes `claude-code db` et Supabase pour gérer la base de données.

---

## 📊 État Actuel de la Base de Données

### Migrations Existantes (7)

```
✅ 20250101000001_create_organizations.sql       - Tables organisations
✅ 20250101000002_update_profiles_with_org.sql   - Profils multi-tenant
✅ 20250101000003_create_goals_okrs.sql          - Goals et Key Results
✅ 20250101000004_create_recruitment.sql         - Recrutement
✅ 20250101000005_create_performance.sql         - Performance
✅ 20250101000006_rls_policies.sql               - Politiques RLS
✅ 20250101000007_storage_and_functions.sql      - Storage et fonctions
```

### Nouvelles Migrations (3)

```
🆕 20250102000001_add_ai_fields_candidates.sql   - Champs AI pour CV
🆕 20250102000002_add_performance_indexes.sql    - Index de performance
🆕 20250102000003_rls_ai_features.sql            - RLS pour AI
```

---

## 🚀 Commandes Claude Code DB

### 1. Générer une Migration

```bash
# Ajouter une colonne
claude-code db migrate --table="candidates" \
  --add-column="ai_score:integer,ai_summary:text"

# Créer une nouvelle table
claude-code db migrate --create-table="notifications" \
  --columns="id:uuid,user_id:uuid,message:text,read:boolean"

# Ajouter un index
claude-code db migrate --table="goals" \
  --add-index="owner_id,status"

# Ajouter une contrainte
claude-code db migrate --table="key_results" \
  --add-constraint="check:target_value > 0"
```

**Équivalent Supabase:**
```bash
# Créer migration vide
supabase migration new add_ai_fields

# Éditer le fichier dans supabase/migrations/
# Puis appliquer:
supabase db push
```

### 2. Créer des Politiques RLS

```bash
# Policy basée sur l'organisation
claude-code db rls --table="goals" \
  --policy="user_organization" \
  --operations="select,update"

# Policy basée sur les rôles
claude-code db rls --table="candidates" \
  --policy="role_based:admin,manager" \
  --operations="all"

# Policy personnalisée
claude-code db rls --table="performance_reviews" \
  --policy="employee_or_reviewer" \
  --check="employee_id = auth.uid() OR reviewer_id = auth.uid()"

# Policy avec fonction helper
claude-code db rls --table="feedback" \
  --policy="can_view_feedback" \
  --using-function="public.can_view_feedback(id)"
```

**Équivalent SQL:**
```sql
-- Policy organisation
CREATE POLICY "Users can view their org goals"
  ON public.goals FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Policy rôles
CREATE POLICY "Managers can manage candidates"
  ON public.candidates FOR ALL
  USING (public.has_any_role(ARRAY['admin', 'manager']));
```

### 3. Générer les Types TypeScript

```bash
# Générer tous les types
claude-code db types --output="src/types/database.ts"

# Avec schema spécifique
claude-code db types --schema="public" \
  --output="src/types/database.types.ts"

# Inclure les views et fonctions
claude-code db types --include="views,functions" \
  --output="src/types/supabase.ts"

# Format personnalisé
claude-code db types --format="interface" \
  --naming="camelCase" \
  --output="src/types/db.ts"
```

**Équivalent Supabase:**
```bash
# Local
supabase gen types typescript --local > src/types/database.types.ts

# Production (avec project ref)
supabase gen types typescript --project-id jwedydljuhagoeuylmrn > src/types/database.types.ts

# Avec schema
supabase gen types typescript --schema public,auth > src/types/database.types.ts
```

---

## 🔧 Commandes Supabase Locales

### Démarrer le Dev Environment

```bash
# Démarrer Supabase local
supabase start

# Vérifier le status
supabase status

# Arrêter
supabase stop

# Reset (⚠️ efface toutes les données)
supabase db reset
```

### Gestion des Migrations

```bash
# Créer nouvelle migration
supabase migration new add_notifications_table

# Lister les migrations
supabase migration list

# Appliquer les migrations localement
supabase db push

# Voir le diff entre local et remote
supabase db diff

# Appliquer sur production
supabase db push --project-ref jwedydljuhagoeuylmrn
```

### Seed Data (Données de Test)

```bash
# Créer seed file
touch supabase/seed.sql

# Appliquer le seed
supabase db reset --seed

# Seed spécifique
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

### Backup & Restore

```bash
# Backup local
pg_dump -h localhost -p 54322 -U postgres -d postgres > backup.sql

# Restore local
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql

# Backup production
supabase db dump --project-ref jwedydljuhagoeuylmrn > production_backup.sql
```

---

## 📝 Exemples Pratiques - Phase 2

### Exemple 1: Ajouter AI Scoring aux Candidates

**Étape 1: Créer la migration**
```bash
supabase migration new add_ai_scoring_to_candidates
```

**Étape 2: Éditer le fichier SQL**
```sql
-- supabase/migrations/TIMESTAMP_add_ai_scoring_to_candidates.sql
ALTER TABLE public.candidates
ADD COLUMN ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
ADD COLUMN ai_summary TEXT,
ADD COLUMN ai_analyzed_at TIMESTAMPTZ;

CREATE INDEX idx_candidates_ai_score ON public.candidates(ai_score DESC);
```

**Étape 3: Appliquer**
```bash
supabase db push
```

**Étape 4: Régénérer les types**
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

**Étape 5: Mettre à jour le code**
```typescript
// src/lib/services/recruitment.service.ts
async updateCandidateAIScore(id: string, score: number, summary: string) {
  const { data, error } = await supabase
    .from('candidates')
    .update({
      ai_score: score,
      ai_summary: summary,
      ai_analyzed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Exemple 2: Ajouter Table pour Notifications

**Migration:**
```sql
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('goal', 'recruitment', 'performance', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- RLS Policy
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
```

### Exemple 3: Améliorer Performance avec Indexes

**Migration:**
```sql
-- Goals performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_owner_status
  ON public.goals(owner_id, status)
  WHERE status IN ('active', 'draft');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_org_period
  ON public.goals(organization_id, period, start_date);

-- Candidates pipeline optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candidates_job_status
  ON public.candidates(job_posting_id, status);

-- Performance reviews optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_employee_cycle
  ON public.performance_reviews(employee_id, review_cycle_id);

-- Analyze tables for query planner
ANALYZE public.goals;
ANALYZE public.candidates;
ANALYZE public.performance_reviews;
```

---

## 🔍 Requêtes Utiles

### Vérifier l'État des Tables

```sql
-- Lister toutes les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Voir la structure d'une table
\d+ public.goals

-- Compter les lignes
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Voir les indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Vérifier les Policies RLS

```sql
-- Lister toutes les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Policies pour une table spécifique
SELECT * FROM pg_policies
WHERE tablename = 'goals';

-- Vérifier si RLS est activé
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Performance Monitoring

```sql
-- Slow queries
SELECT
  query,
  calls,
  total_time / 1000 as total_seconds,
  mean_time / 1000 as mean_seconds
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🧪 Testing des Migrations

### Script de Test

Créer `supabase/tests/test_migrations.sql`:

```sql
-- Test migrations script
BEGIN;

-- Test 1: AI fields exist
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name IN ('ai_score', 'ai_summary', 'ai_analyzed_at');

-- Test 2: Indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'candidates'
AND indexname LIKE 'idx_candidates_ai%';

-- Test 3: RLS policies exist
SELECT policyname
FROM pg_policies
WHERE tablename = 'candidates';

-- Test 4: Functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'can_%';

ROLLBACK; -- Don't commit test queries
```

### Exécuter les Tests

```bash
# Test local
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/tests/test_migrations.sql

# Ou avec Supabase CLI
supabase test db
```

---

## 🔒 Sécurité

### Checklist Migrations

- [ ] ✅ Toutes les tables ont RLS activé
- [ ] ✅ Policies testées pour tous les rôles
- [ ] ✅ Indexes créés pour queries fréquentes
- [ ] ✅ Contraintes CHECK pour validation
- [ ] ✅ Foreign keys avec ON DELETE
- [ ] ✅ Timestamps (created_at, updated_at)
- [ ] ✅ Commentaires SQL pour documentation

### Commandes Sécurité

```sql
-- Activer RLS sur toutes les tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || r.tablename || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- Vérifier les permissions
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public';
```

---

## 📚 Ressources

### Documentation

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

### Commandes Rapides

```bash
# Quick start
supabase start && supabase db reset

# Status check
supabase status | grep "DB URL"

# Generate types
supabase gen types typescript --local > src/types/database.types.ts

# Apply new migration
supabase db push

# Deploy to production
supabase link --project-ref jwedydljuhagoeuylmrn
supabase db push
```

---

## ✅ Prochaines Étapes

1. **Appliquer les nouvelles migrations:**
   ```bash
   supabase db push
   ```

2. **Régénérer les types:**
   ```bash
   supabase gen types typescript --local > src/types/database.types.ts
   ```

3. **Tester les nouvelles fonctionnalités AI**

4. **Vérifier les performances avec les nouveaux indexes**

5. **Documenter les changements dans CHANGELOG.md**
