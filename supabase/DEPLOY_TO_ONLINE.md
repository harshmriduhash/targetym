# Déploiement des Migrations Supabase en Ligne

Ce guide vous explique comment déployer toutes les migrations de votre base de données Targetym vers votre instance Supabase en ligne.

## Fichier de Migration

**Fichier à utiliser :** `supabase/consolidated_migration.sql`

- **Taille :** 146 KB
- **Lignes :** 3,538 lignes
- **Contenu :** Toutes les migrations consolidées dans l'ordre chronologique

## Instructions de Déploiement

### Étape 1 : Ouvrir le SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **juuekovwshynwgjkqkbu**
3. Dans le menu latéral, cliquez sur **"SQL Editor"**

### Étape 2 : Créer une Nouvelle Query

1. Cliquez sur **"New query"** (bouton en haut à droite)
2. Donnez un nom à votre query : `Targetym - Initial Migration`

### Étape 3 : Copier et Exécuter le Script

**Option A : Via l'éditeur (Recommandé)**
1. Ouvrez le fichier `supabase/consolidated_migration.sql` dans votre éditeur de code
2. Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)
3. Collez dans le SQL Editor de Supabase (Ctrl+V)
4. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)

**Option B : Via Upload (Alternative)**
1. Dans le SQL Editor, cherchez l'option d'upload de fichier
2. Uploadez le fichier `supabase/consolidated_migration.sql`
3. Cliquez sur **"Run"**

### Étape 4 : Vérifier l'Exécution

Le script va prendre quelques secondes à s'exécuter (2-5 secondes normalement).

Vous devriez voir :
- ✅ Message de succès
- ✅ Nombre de lignes affectées
- ✅ Temps d'exécution

Si vous voyez des erreurs, notez-les et nous les résoudrons.

### Étape 5 : Vérifier les Tables Créées

1. Dans le menu latéral, cliquez sur **"Table Editor"**
2. Vous devriez voir toutes les tables suivantes :

**Tables Principales :**
- `organizations` - Organisations (multi-tenant)
- `profiles` - Profils utilisateurs
- `goals` - Objectifs
- `key_results` - Résultats clés (OKRs)
- `goal_collaborators` - Collaborateurs d'objectifs
- `job_postings` - Offres d'emploi
- `candidates` - Candidats
- `interviews` - Entretiens
- `performance_reviews` - Évaluations de performance
- `performance_ratings` - Notes de performance
- `peer_feedback` - Feedback entre pairs
- `kpis` - Indicateurs de performance
- `user_settings` - Paramètres utilisateurs
- `organization_settings` - Paramètres organisation
- `notifications` - Notifications

**Storage Buckets :**
- `cvs` - Bucket pour les CV

### Étape 6 : Vérifier les RLS Policies

1. Sélectionnez une table (ex: `goals`)
2. Cliquez sur l'onglet **"Policies"**
3. Vous devriez voir plusieurs RLS policies activées

## Ce que le Script Configure

### 1. Extensions PostgreSQL
- `uuid-ossp` - Génération d'UUIDs
- `pg_stat_statements` - Statistiques de performance

### 2. Schéma de Base de Données
- 15+ tables avec relations
- Indexes pour optimisation
- Contraintes de clés étrangères
- Champs avec valeurs par défaut

### 3. Fonctions Helper
- `get_user_organization_id()` - Récupère l'organisation de l'utilisateur
- `has_role()` - Vérifie les rôles utilisateurs
- `is_manager_of()` - Vérifie la hiérarchie managériale

### 4. Row Level Security (RLS)
- Isolation multi-tenant par `organization_id`
- Policies basées sur les rôles (admin, hr, manager, employee)
- Protection de toutes les tables

### 5. Views et Agrégations
- `goals_with_progress` - Objectifs avec progression calculée
- `job_postings_with_stats` - Offres avec statistiques
- `performance_review_summary` - Résumé des évaluations

### 6. Storage
- Bucket `cvs` pour les fichiers CV
- RLS policies pour le storage

### 7. Realtime
- Activation sur tables sélectionnées
- Notifications en temps réel

## Dépannage

### Erreur : "extension already exists"
**Solution :** Ignorez cette erreur, elle est normale si les extensions sont déjà installées.

### Erreur : "table already exists"
**Solution :** Cela signifie que certaines tables existent déjà. Deux options :
1. Supprimer les tables existantes (⚠️ ATTENTION : perte de données)
2. Exécuter les migrations une par une en sautant celles déjà appliquées

### Erreur : "permission denied"
**Solution :** Assurez-vous d'être connecté avec le compte propriétaire du projet.

### Erreur de syntaxe SQL
**Solution :** Copiez l'erreur et nous la résoudrons ensemble.

## Migrations Incluses

Le script consolide ces migrations (dans l'ordre) :

1. `20250109000000_create_complete_schema.sql` - Schéma complet
2. `20250109000000_5_create_helper_functions.sql` - Fonctions helper
3. `20250109000001_rls_policies_complete.sql` - Policies RLS
4. `20250109000002_views_and_functions.sql` - Views et fonctions
5. `20250109000003_enable_realtime.sql` - Realtime
6. `20250109000004_add_ai_fields_candidates.sql` - Champs AI
7. `20250109000005_add_performance_indexes.sql` - Indexes performance
8. `20250109000006_rls_ai_features.sql` - RLS features AI
9. `20250109000007_enable_rls_all_tables.sql` - RLS toutes tables
10. `20251010000001_create_cvs_storage_bucket.sql` - Storage CVs
11. `20251011000000_add_kpis_table.sql` - Table KPIs
12. `20251011000001_kpis_rls_policies.sql` - RLS KPIs
13. `20251012105148_add_settings_tables.sql` - Tables settings
14. `20251012120000_create_notifications_system.sql` - Système notifications

## Après le Déploiement

Une fois les migrations appliquées avec succès :

### 1. Tester la Connexion
Exécutez votre application en local :
```bash
npm run dev
```

### 2. Créer une Organisation de Test
Dans le SQL Editor, exécutez :
```sql
INSERT INTO organizations (name, slug)
VALUES ('Test Company', 'test-company')
RETURNING *;
```

### 3. Créer un Profil Utilisateur de Test
```sql
INSERT INTO profiles (id, email, full_name, organization_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'Test User',
  (SELECT id FROM organizations WHERE slug = 'test-company'),
  'admin'
)
RETURNING *;
```

### 4. Vérifier les RLS Policies
```sql
-- Doit retourner des policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Support

Si vous rencontrez des problèmes :
1. Notez le message d'erreur exact
2. Notez à quelle étape l'erreur se produit
3. Vérifiez les logs dans le Dashboard Supabase
4. Contactez le support ou consultez la documentation

---

**Date de création :** 2025-10-23
**Projet :** Targetym
**Environnement :** Production Supabase Online
