# 📦 Guide de Déploiement Production - Targetym

**Version**: 1.0.0
**Date**: 2025-11-09
**Plateforme Recommandée**: Vercel + Supabase

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase Production](#configuration-supabase-production)
3. [Configuration OAuth Providers](#configuration-oauth-providers)
4. [Configuration Vercel](#configuration-vercel)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Déploiement Initial](#déploiement-initial)
7. [Vérifications Post-Déploiement](#vérifications-post-déploiement)
8. [Monitoring](#monitoring)
9. [Rollback](#rollback)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Comptes Requis

- [x] **Compte Supabase** (https://supabase.com)
- [x] **Compte Vercel** (https://vercel.com)
- [x] **Compte GitHub** (repository connecté)
- [ ] **Compte Sentry** (optionnel - monitoring)
- [ ] **Compte Slack** (pour intégrations)
- [ ] **Compte Google Cloud** (pour intégrations)

### Outils Locaux

```bash
# Node.js v18+
node --version  # doit être >= 18.17.0

# npm ou pnpm
npm --version

# Supabase CLI
npx supabase --version

# Git
git --version
```

### Checklist Avant Déploiement

```bash
# 1. Build local réussit
npm run build

# 2. Tests passent
npm run test:ci

# 3. Type checking passe
npm run type-check

# 4. Linter passe
npm run lint

# 5. Migrations Supabase OK
npm run supabase:reset  # test local
```

---

## 🗄️ Configuration Supabase Production

### Étape 1: Créer Projet Supabase

1. Aller sur https://supabase.com/dashboard
2. Cliquer sur "New Project"
3. Remplir:
   - **Name**: targetym-production
   - **Database Password**: [Générer mot de passe fort]
   - **Region**: Europe (Central) - Frankfurt
   - **Pricing Plan**: Pro (recommandé pour production)

4. Attendre la création (2-3 minutes)

### Étape 2: Configurer Authentification

1. Dans le dashboard Supabase → **Authentication** → **Providers**
2. Activer:
   - ✅ Email (déjà activé)
   - ✅ Google OAuth (voir section OAuth ci-dessous)
   - ✅ Magic Link (optionnel)

3. Configuration Email:
   - **Settings** → **Email Templates**
   - Personnaliser templates (Confirmation, Reset Password, etc.)
   - Configurer SMTP custom (recommandé pour production)

### Étape 3: Configurer Database

```bash
# 1. Link projet local au projet production
npx supabase link --project-ref <YOUR_PROJECT_REF>
# Le project-ref se trouve dans Project Settings → General

# 2. Push toutes les migrations
npm run supabase:push

# 3. Vérifier les tables créées
npx supabase db pull
```

**Tables attendues** (48 tables):
- ✅ Core: organizations, profiles
- ✅ Goals: goals, key_results, goal_collaborators
- ✅ Recruitment: job_postings, candidates, interviews
- ✅ Performance: performance_reviews, performance_ratings, peer_feedback
- ✅ Integrations: integration_providers, integrations, integration_credentials, etc.
- ✅ KPIs, Attendance, Leaves, Support, etc.

### Étape 4: Vérifier RLS Policies

```sql
-- Dans SQL Editor de Supabase
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Doit retourner 100+ policies
-- Toutes les tables doivent avoir RLS activé
```

### Étape 5: Créer Premier Utilisateur Admin

```sql
-- 1. Créer compte dans Auth
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  'admin@targetym.com',
  crypt('STRONG_PASSWORD_HERE', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  false
);

-- 2. Créer Organization
INSERT INTO public.organizations (id, name, slug, settings)
VALUES (
  gen_random_uuid(),
  'Targetym HQ',
  'targetym-hq',
  '{"timezone":"Europe/Paris"}'::jsonb
) RETURNING id;

-- 3. Créer Profile (remplacer USER_ID et ORG_ID)
INSERT INTO public.profiles (
  id,
  organization_id,
  email,
  full_name,
  first_name,
  last_name,
  role,
  status
) VALUES (
  '<USER_ID>',
  '<ORG_ID>',
  'admin@targetym.com',
  'Admin User',
  'Admin',
  'User',
  'admin',
  'active'
);
```

### Étape 6: Récupérer Credentials

1. **Project Settings** → **API**
2. Noter:
   ```
   Project URL: https://xxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (⚠️ SECRET - ne jamais exposer)
   ```

3. **Project Settings** → **Database**
4. Noter:
   ```
   Connection Pooling (recommended):
   postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

---

## 🔐 Configuration OAuth Providers

### Slack Integration

1. **Créer App Slack**:
   - https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - **App Name**: Targetym Production
   - **Workspace**: [Votre workspace]

2. **OAuth & Permissions**:
   ```
   Redirect URLs:
   https://your-app.vercel.app/integrations/callback

   Scopes (Bot Token):
   - channels:read
   - chat:write
   - users:read
   - users:read.email
   ```

3. **Event Subscriptions** (optionnel):
   ```
   Request URL:
   https://your-app.vercel.app/api/webhooks/slack?webhook_id={uuid}

   Subscribe to bot events:
   - message.channels
   - channel_created
   - channel_deleted
   ```

4. **Noter Credentials**:
   ```bash
   SLACK_CLIENT_ID=123456789.123456789
   SLACK_CLIENT_SECRET=abc123...
   SLACK_SIGNING_SECRET=abc123...
   ```

### Google Workspace Integration

1. **Google Cloud Console**:
   - https://console.cloud.google.com
   - Créer nouveau projet: "Targetym Production"

2. **Enable APIs**:
   - Google Calendar API
   - Google Drive API
   - Gmail API
   - Google People API

3. **OAuth Consent Screen**:
   - User Type: External (ou Internal si Google Workspace)
   - App name: Targetym
   - User support email: support@targetym.com
   - Scopes:
     ```
     https://www.googleapis.com/auth/calendar
     https://www.googleapis.com/auth/drive.file
     https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/userinfo.profile
     https://www.googleapis.com/auth/userinfo.email
     ```

4. **Credentials**:
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-app.vercel.app/integrations/callback
     ```

5. **Noter Credentials**:
   ```bash
   GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   ```

---

## ☁️ Configuration Vercel

### Étape 1: Importer Projet

1. Aller sur https://vercel.com/new
2. Import Git Repository
3. Sélectionner votre repo GitHub
4. Configuration:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### Étape 2: Configurer Variables d'Environnement

#### Production Environment Variables

```bash
# ============================================================================
# APPLICATION
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# ============================================================================
# SUPABASE (REQUIS)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ⚠️ SECRET

# DATABASE (REQUIS)
DATABASE_URL=postgresql://postgres.xxx:[password]@...pooler.supabase.com:6543/postgres

# ============================================================================
# INTEGRATIONS (REQUIS pour features intégrations)
# ============================================================================
# Générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
INTEGRATION_ENCRYPTION_KEY=7d53641d30bb05be4e8f49dd015916ff08aa77158fc2d5dff40cf7174b15a242

# Slack
SLACK_CLIENT_ID=123456789.123456789
SLACK_CLIENT_SECRET=abc123...
SLACK_SIGNING_SECRET=abc123...

# Google
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# ============================================================================
# MONITORING (OPTIONNEL mais recommandé)
# ============================================================================
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# ============================================================================
# AI FEATURES (OPTIONNEL)
# ============================================================================
OPENAI_API_KEY=sk-...
# OU
ANTHROPIC_API_KEY=sk-ant-...
```

#### Comment Ajouter les Variables

1. Dans Vercel Dashboard → Project → Settings → Environment Variables
2. Ajouter chaque variable:
   - **Key**: Nom de la variable
   - **Value**: Valeur (marquée comme "Sensitive" pour secrets)
   - **Environment**: Production (et Preview si nécessaire)

3. **IMPORTANT**: Ne jamais commit ces valeurs dans Git!

### Étape 3: Configurer Domaine (Optionnel)

1. **Domains** → **Add Domain**
2. Entrer: `app.targetym.com` (ou votre domaine)
3. Configurer DNS:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
4. Attendre propagation DNS (5-30 minutes)

---

## 🚀 Déploiement Initial

### Méthode 1: Via Git Push (Recommandé)

```bash
# 1. Commit tous les changements
git add .
git commit -m "chore: prepare production deployment"

# 2. Push vers main/master
git push origin main

# Vercel détecte automatiquement et démarre le déploiement
```

### Méthode 2: Via Vercel CLI

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Déployer
vercel --prod

# 4. Suivre le déploiement
# URL fournie: https://targetym-xxx.vercel.app
```

### Étape Post-Déploiement Immédiate

```bash
# 1. Tester URL de santé
curl https://your-app.vercel.app/api/health

# Réponse attendue:
# {"status":"ok","timestamp":"2025-11-09T..."}

# 2. Tester connexion Supabase
curl https://your-app.vercel.app/api/health/db

# Réponse attendue:
# {"status":"ok","connected":true}

# 3. Vérifier logs Vercel
vercel logs --follow
```

---

## ✅ Vérifications Post-Déploiement

### Checklist Fonctionnelle

#### 1. Authentification

```bash
# Test Sign Up
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Test Sign In
curl -X POST https://your-app.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@targetym.com","password":"STRONG_PASSWORD"}'
```

#### 2. Pages Principales

- [ ] https://your-app.vercel.app/ (Homepage)
- [ ] https://your-app.vercel.app/auth/signin (Login)
- [ ] https://your-app.vercel.app/dashboard (Dashboard - authentifié)
- [ ] https://your-app.vercel.app/dashboard/goals (Goals module)
- [ ] https://your-app.vercel.app/dashboard/integrations (Integrations)

#### 3. APIs Critiques

```bash
# Health Check
curl https://your-app.vercel.app/api/health

# Goals API (avec auth token)
curl https://your-app.vercel.app/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Intégrations OAuth

- [ ] Flow OAuth Slack fonctionne
- [ ] Flow OAuth Google fonctionne
- [ ] Webhooks reçoivent events

#### 5. Base de Données

```sql
-- Dans Supabase SQL Editor

-- 1. Vérifier tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- Doit retourner ~48

-- 2. Vérifier RLS
SELECT COUNT(*) FROM pg_policies
WHERE schemaname = 'public';
-- Doit retourner >100

-- 3. Vérifier données seed
SELECT COUNT(*) FROM integration_providers;
-- Doit retourner 10
```

---

## 📊 Monitoring

### Configuration Sentry (Recommandé)

1. **Créer Projet Sentry**:
   - https://sentry.io/organizations/YOUR_ORG/projects/new/
   - Platform: Next.js
   - Alert Frequency: Real-time

2. **Configuration**:
   ```javascript
   // sentry.client.config.ts et sentry.server.config.ts déjà configurés
   // Juste ajouter DSN dans ENV variables
   ```

3. **Tester**:
   ```bash
   # Déclencher erreur de test
   curl https://your-app.vercel.app/api/sentry-test

   # Vérifier dans Sentry dashboard
   ```

### Métriques à Monitorer

#### Performance (Vercel Analytics)

- **TTFB** (Time To First Byte): < 200ms
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1

#### Availability

- **Uptime**: Target 99.9%
- **Error Rate**: < 0.1%
- **4xx Errors**: Monitor spike
- **5xx Errors**: Alert immediately

#### Base de Données (Supabase Dashboard)

- **Query Performance**: < 100ms (p95)
- **Connection Pool**: < 80% utilization
- **Database Size**: Monitor growth
- **WAL Size**: Monitor replication lag

### Alertes Critiques

Configuration dans Vercel → Integrations → Slack/Discord/Email:

```yaml
Alerts:
  - Error Rate > 1% (5 minutes)
  - Response Time p95 > 1000ms (10 minutes)
  - 5xx errors > 10 (1 minute)
  - Deployment failed
  - Database connection issues
```

---

## 🔄 Rollback

### Rollback Rapide (Vercel)

```bash
# Méthode 1: Via Dashboard
# 1. Vercel → Project → Deployments
# 2. Trouver dernière version stable
# 3. Click "Promote to Production"

# Méthode 2: Via CLI
vercel rollback
# Sélectionner deployment ID de la version stable

# Méthode 3: Via Git
git revert HEAD
git push origin main
# Vercel redéploie automatiquement
```

### Rollback Base de Données (CRITIQUE)

⚠️ **ATTENTION**: Les rollbacks DB sont complexes!

```bash
# 1. Identifier migration à rollback
npx supabase migration list

# 2. Créer migration de rollback
npx supabase migration new rollback_integration_feature

# 3. Écrire SQL de rollback manuellement
# (inverser toutes les opérations de la migration originale)

# 4. Tester localement
npm run supabase:reset

# 5. Push en production (avec précaution!)
npm run supabase:push
```

**Recommandation**: Faire backup DB avant migration critique:

```sql
-- Dans Supabase, faire backup manuel:
-- Project Settings → Database → Backups → Create Backup
```

---

## 🔍 Troubleshooting

### Problème 1: Build Failed

**Erreur**: TypeScript errors during build

**Solution**:
```bash
# 1. Vérifier localement
npm run type-check

# 2. Fixer erreurs
# 3. Commit et push

# 4. Si erreurs persistent, vérifier env vars Vercel
```

### Problème 2: 500 Errors

**Erreur**: Internal Server Error

**Solution**:
```bash
# 1. Vérifier logs Vercel
vercel logs --follow

# 2. Vérifier Sentry pour stack trace

# 3. Vérifier variables ENV (souvent la cause)
# - SUPABASE_SERVICE_ROLE_KEY correct?
# - DATABASE_URL correct?

# 4. Tester connexion DB
curl https://your-app.vercel.app/api/health/db
```

### Problème 3: Database Connection Refused

**Erreur**: `Error: Connection refused`

**Solution**:
```bash
# 1. Vérifier Supabase project est UP
# Dashboard → Project Settings → Status

# 2. Vérifier DATABASE_URL
# Doit utiliser pooler.supabase.com:6543 (pooling)
# PAS direct connection :5432

# 3. Vérifier IP whitelisting (si configuré)
# Supabase → Database → Settings → Network restrictions
# Ajouter Vercel IPs si nécessaire
```

### Problème 4: OAuth Redirect Failed

**Erreur**: `redirect_uri_mismatch`

**Solution**:
```bash
# 1. Vérifier redirect URIs configurés:

# Slack App:
https://your-app.vercel.app/integrations/callback

# Google Cloud Console:
https://your-app.vercel.app/integrations/callback

# 2. Must match EXACTLY (trailing slash, protocol, domain)

# 3. Si domaine custom, updater tous les OAuth providers
```

### Problème 5: Missing Environment Variable

**Erreur**: `process.env.XXX is undefined`

**Solution**:
```bash
# 1. Variables client-side doivent commencer par NEXT_PUBLIC_
# Bad:  SUPABASE_URL
# Good: NEXT_PUBLIC_SUPABASE_URL

# 2. Vérifier dans Vercel → Settings → Environment Variables

# 3. Redéployer après ajout variable
vercel --prod --force
```

---

## 📚 Ressources Supplémentaires

### Documentation

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Guide**: https://vercel.com/docs
- **Supabase Production**: https://supabase.com/docs/guides/platform/going-into-prod
- **Sentry Next.js**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

### Support

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **GitHub Issues**: https://github.com/YOUR_ORG/targetym/issues

### Maintenance

- **Weekly**: Vérifier logs d'erreurs Sentry
- **Monthly**: Review performance metrics
- **Quarterly**: Security audit & dependency updates
- **Annually**: Review RLS policies & database indexes

---

## 🎯 Checklist de Déploiement Finale

Avant de déclarer "Production Ready":

- [ ] ✅ Migration Supabase complète (48 tables)
- [ ] ✅ RLS policies activées (>100 policies)
- [ ] ✅ Premier utilisateur admin créé
- [ ] ✅ Variables ENV configurées Vercel
- [ ] ✅ OAuth Slack configuré
- [ ] ✅ OAuth Google configuré
- [ ] ✅ Build production réussit
- [ ] ✅ Tests passent (>80% coverage)
- [ ] ✅ Type-check passe (0 erreurs production)
- [ ] ✅ Health checks OK
- [ ] ✅ Sentry configuré (optionnel)
- [ ] ✅ Monitoring configuré
- [ ] ✅ Alertes configurées
- [ ] ✅ Documentation à jour
- [ ] ✅ Rollback plan testé
- [ ] ✅ Backup DB configuré

---

**Statut**: 📝 Guide v1.0.0 - Production Ready

**Dernière Mise à Jour**: 2025-11-09

**Auteur**: Équipe Targetym

---

**🚨 EN CAS D'URGENCE PRODUCTION**:

1. Rollback immédiat via Vercel Dashboard
2. Consulter logs Sentry
3. Contacter équipe DevOps
4. Documenter incident post-mortem

---

*Pour questions ou support: [support@targetym.com](mailto:support@targetym.com)*
