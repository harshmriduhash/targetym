# 🗄️ Guide de Migration Supabase - Targetym

Guide complet pour appliquer les migrations de base de données Supabase et maintenir le schéma à jour.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Structure des migrations](#structure-des-migrations)
4. [Application des migrations](#application-des-migrations)
5. [Génération des types TypeScript](#génération-des-types-typescript)
6. [Vérification et validation](#vérification-et-validation)
7. [Rollback et récupération](#rollback-et-récupération)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Le projet Targetym utilise **Supabase (PostgreSQL)** comme base de données avec :

- ✅ **15 tables** principales (profiles, organizations, goals, candidates, etc.)
- ✅ **RLS (Row-Level Security)** activé sur toutes les tables
- ✅ **58+ policies** pour l'isolation multi-tenant
- ✅ **5 fonctions helper** pour les vérifications de sécurité
- ✅ **Clerk + Supabase** synchronisation via webhooks

---

## ⚙️ Prérequis

### Variables d'environnement requises

Dans votre fichier `.env.local` :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Outils installés

```bash
npm install  # Installe toutes les dépendances nécessaires
```

---

## 📁 Structure des migrations

Les migrations sont stockées dans `supabase/migrations/` :

```
supabase/
├── migrations/
│   ├── 20250102000001_add_ai_fields_candidates.sql
│   ├── 20250102000002_add_performance_indexes.sql
│   ├── 20250102000003_rls_ai_features.sql
│   ├── 20250109000000_create_complete_schema.sql
│   ├── 20250109000001_rls_policies_complete.sql
│   ├── 20250109000002_views_and_functions.sql
│   ├── 20250109000003_enable_realtime.sql
│   ├── 20251009135324_enable_rls_all_tables.sql
│   └── 20251010000000_add_clerk_sync.sql
└── consolidated-migration.sql  # ← Généré automatiquement
```

### Convention de nommage

```
YYYYMMDDHHMMSS_description_de_la_migration.sql
```

- **YYYYMMDD** : Date de création
- **HHMMSS** : Heure (optionnel)
- **description** : Description courte en snake_case

---

## 🚀 Application des migrations

### Méthode 1 : Script automatique (Recommandé)

#### Étape 1 : Générer le script consolidé

```bash
npm run supabase:migrate
```

Ce script :
- ✅ Lit toutes les migrations dans l'ordre
- ✅ Les combine en un seul fichier SQL
- ✅ Ajoute des vérifications pour éviter les doublons
- ✅ Génère `supabase/consolidated-migration.sql`

**Sortie attendue :**

```
🚀 Génération du script de migration consolidé

📁 9 migration(s) trouvée(s):
   1. 20250102000001_add_ai_fields_candidates.sql
   2. 20250102000002_add_performance_indexes.sql
   ...
   9. 20251010000000_add_clerk_sync.sql

✅ Script consolidé généré avec succès!
📄 Fichier: D:\targetym\supabase\consolidated-migration.sql
```

#### Étape 2 : Appliquer dans Supabase

1. **Ouvrir le SQL Editor de Supabase :**
   ```
   https://supabase.com/dashboard/project/<your-project-id>/sql
   ```

2. **Créer une nouvelle requête :**
   - Cliquer sur **"New Query"**

3. **Copier-coller le contenu :**
   - Ouvrir `supabase/consolidated-migration.sql`
   - Copier tout le contenu (2100+ lignes)
   - Coller dans l'éditeur SQL

4. **Exécuter :**
   - Cliquer sur **"RUN"** (ou `Ctrl+Enter`)
   - Attendre la fin de l'exécution (~10-30 secondes)

5. **Vérifier les résultats :**
   - La console affichera les migrations appliquées
   - Vérifier qu'il n'y a pas d'erreurs critiques

**Exemple de sortie attendue :**

```sql
-- Résultats :
version                                    | applied_at
-------------------------------------------+-------------------------
20251010000000_add_clerk_sync              | 2025-10-09 18:30:42.123
20251009135324_enable_rls_all_tables       | 2025-10-09 18:30:38.456
...

-- RLS activé sur 15 tables
schemaname | tablename              | rowsecurity
-----------+------------------------+-------------
public     | organizations          | t
public     | profiles               | t
public     | goals                  | t
...

-- 58 policies RLS créées
total_policies
----------------
58
```

---

### Méthode 2 : Migration manuelle (Migration par migration)

Si vous préférez appliquer les migrations une par une :

```bash
# 1. Ouvrir Supabase SQL Editor
# 2. Pour chaque fichier dans supabase/migrations/ :
#    - Copier le contenu du fichier .sql
#    - Coller dans l'éditeur
#    - Exécuter
#    - Vérifier les résultats avant de passer à la suivante
```

**⚠️ Important :** Respecter l'ordre chronologique (par nom de fichier).

---

## 📝 Génération des types TypeScript

Après avoir appliqué les migrations, générez les types TypeScript pour avoir l'autocomplétion et la vérification de types.

### Méthode automatique

```bash
npm run supabase:types:remote
```

Ce script :
- ✅ Se connecte à votre instance Supabase
- ✅ Récupère le schéma actuel de la base de données
- ✅ Génère les types TypeScript
- ✅ Sauvegarde dans `src/types/database.types.ts`

**Sortie attendue :**

```
🚀 Génération des types TypeScript depuis Supabase

📦 Instance: https://your-project.supabase.co
🆔 Project ID: your-project-id

🔄 Récupération du schéma depuis Supabase...
✅ Types générés avec succès!

📄 Fichier: D:\targetym\src\types\database.types.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Vous pouvez maintenant utiliser les types dans votre code!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Méthode manuelle

Si le script automatique ne fonctionne pas :

1. **Aller sur le dashboard Supabase :**
   ```
   https://supabase.com/dashboard/project/<your-project-id>/api/types
   ```

2. **Copier les types générés**

3. **Coller dans :** `src/types/database.types.ts`

---

## ✅ Vérification et validation

### 1. Vérifier les migrations appliquées

```sql
-- Dans Supabase SQL Editor
SELECT version, applied_at
FROM public.schema_migrations
ORDER BY applied_at DESC;
```

**Attendu :** 9 migrations listées.

---

### 2. Vérifier RLS activé

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;
```

**Attendu :** Toutes les tables avec `rowsecurity = t` (true).

---

### 3. Compter les policies RLS

```sql
SELECT COUNT(*) as total_policies,
       schemaname,
       tablename
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Attendu :** 58+ policies réparties sur 15 tables.

---

### 4. Vérifier les fonctions helper

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%' OR routine_name LIKE '%role%'
ORDER BY routine_name;
```

**Attendu :**
- `get_user_organization_id()`
- `has_role(text)`
- `has_any_role(text[])`
- `is_manager_of(uuid, uuid)`
- `can_access_candidate(uuid)`

---

### 5. Test d'isolation multi-tenant

```sql
-- Créer un utilisateur test
INSERT INTO public.profiles (id, email, full_name, organization_id, role)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  gen_random_uuid(),
  'employee'
);

-- Vérifier que les policies fonctionnent
-- (Utilisez l'ID de l'utilisateur créé ci-dessus avec auth.uid())
```

---

## 🔙 Rollback et récupération

### En cas d'erreur lors de la migration

#### Option 1 : Rollback manuel

```sql
-- Identifier la migration problématique
SELECT * FROM public.schema_migrations ORDER BY applied_at DESC;

-- Supprimer l'entrée de la migration
DELETE FROM public.schema_migrations WHERE version = 'problematic_migration_version';

-- Annuler manuellement les changements (DROP TABLE, DROP FUNCTION, etc.)
```

#### Option 2 : Restaurer depuis un backup

Si vous avez un backup Supabase :

1. Aller sur : `https://supabase.com/dashboard/project/<your-project-id>/settings/backups`
2. Sélectionner un backup antérieur à la migration
3. Cliquer sur **"Restore"**

⚠️ **Attention :** Cela écrasera toutes les données depuis le backup.

---

## 🔧 Troubleshooting

### Erreur : "relation 'schema_migrations' does not exist"

**Solution :**

```sql
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Erreur : "permission denied for table..."

**Cause :** Vous n'utilisez pas le `service_role_key`.

**Solution :**
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est dans `.env.local`
- Utiliser le SQL Editor de Supabase (qui a les permissions admin)

---

### Erreur : "function already exists"

**Cause :** La migration a déjà été partiellement appliquée.

**Solution :**

```sql
-- Utiliser CREATE OR REPLACE au lieu de CREATE
CREATE OR REPLACE FUNCTION public.your_function() ...
```

Ou ignorer l'erreur si la fonction existe déjà avec le même code.

---

### Les types TypeScript ne correspondent pas

**Solution :**

```bash
# Regénérer les types
npm run supabase:types:remote

# Vérifier qu'il n'y a pas d'erreurs TypeScript
npm run type-check
```

---

### Les policies RLS ne fonctionnent pas

**Vérifications :**

1. **RLS est-il activé ?**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

2. **Les policies existent-elles ?**
   ```sql
   SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
   ```

3. **Les fonctions helper fonctionnent-elles ?**
   ```sql
   SELECT public.get_user_organization_id();
   -- Si erreur : vérifier que l'utilisateur est authentifié
   ```

---

## 📚 Ressources supplémentaires

- **Supabase Documentation :** https://supabase.com/docs
- **RLS Guide :** https://supabase.com/docs/guides/auth/row-level-security
- **Clerk + Supabase :** Voir `CLERK_SUPABASE_INTEGRATION.md`
- **Déploiement complet :** Voir `DEPLOYMENT_READY_REPORT.md`

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs dans Supabase SQL Editor
2. Consulter la section [Troubleshooting](#troubleshooting)
3. Vérifier que toutes les variables d'environnement sont correctes
4. Créer une issue GitHub avec les logs d'erreur

---

**Dernière mise à jour :** 2025-10-09
**Version :** 2.0
**Status :** ✅ Production Ready
