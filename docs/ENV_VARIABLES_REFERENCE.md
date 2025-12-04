# 📋 Variables d'Environnement - Référence Complète

Ce document liste toutes les variables d'environnement nécessaires pour le déploiement de Targetym.

---

## 🔑 Variables Obligatoires

### Clerk Authentication

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk (exposée au client) | Clerk Dashboard → API Keys → Publishable Key |
| `CLERK_SECRET_KEY` | Clé secrète Clerk (serveur uniquement) | Clerk Dashboard → API Keys → Secret Key |
| `CLERK_WEBHOOK_SECRET` | Secret pour valider les webhooks Clerk | Clerk Dashboard → Webhooks → Endpoint Secret |

### Supabase Database

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase (exposée au client) | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (serveur uniquement) ⚠️ SECRET | Supabase Dashboard → Settings → API → service_role |

### Application

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_APP_URL` | URL de votre application en production | Render Dashboard → Service URL |
| `NODE_ENV` | Environnement (production/development/test) | Défini automatiquement ou manuellement |

---

## ⚙️ Variables Optionnelles

### Database Connection

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `DATABASE_URL` | Connection string PostgreSQL directe | Supabase Dashboard → Settings → Database → Connection String |

**Note:** Utilisé uniquement pour les migrations directes. Non nécessaire si vous utilisez `supabase db push`.

### AI Features

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `OPENAI_API_KEY` | Clé API OpenAI | OpenAI Dashboard → API Keys |
| `ANTHROPIC_API_KEY` | Clé API Anthropic | Anthropic Dashboard → API Keys |

### Rate Limiting (Upstash Redis)

| Variable | Description | Où la Trouver |
|----------|-------------|---------------|
| `UPSTASH_REDIS_REST_URL` | URL REST de votre Redis Upstash | Upstash Dashboard → Redis → REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST pour Upstash Redis | Upstash Dashboard → Redis → REST Token |

---

## 📝 Template Complet

```bash
# ============================================================================
# Application Configuration
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com

# ============================================================================
# Clerk Authentication
# ============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================================================
# Supabase Database
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# Database Connection (Optional)
# ============================================================================
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# ============================================================================
# AI Features (Optional)
# ============================================================================
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# ============================================================================
# Rate Limiting (Optional but Recommended)
# ============================================================================
# UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=...

# ============================================================================
# Package Manager
# ============================================================================
PNPM_VERSION=10.18.1
NODE_VERSION=24.9.0
```

---

## 🔒 Sécurité

### Variables Publiques vs Privées

**Variables Publiques** (préfixe `NEXT_PUBLIC_`):
- ✅ Exposées au navigateur
- ✅ Peuvent être vues dans le code source
- ✅ Utilisées côté client

**Variables Privées** (sans préfixe):
- ⚠️ Secrets serveur uniquement
- ⚠️ Ne jamais exposer au client
- ⚠️ Utilisées uniquement dans Server Actions et API Routes

### Bonnes Pratiques

1. ✅ **Ne jamais commiter** les fichiers `.env` dans Git
2. ✅ **Utiliser des secrets différents** pour dev/staging/prod
3. ✅ **Rotater les secrets** régulièrement
4. ✅ **Valider les variables** avant le déploiement avec `npm run validate:production`

---

## ✅ Validation

Utilisez le script de validation pour vérifier vos variables :

```bash
npm run validate:production
```

Ce script vérifie :
- ✅ Présence de toutes les variables obligatoires
- ✅ Format correct des clés (préfixes, longueurs)
- ✅ URLs valides
- ⚠️ Variables optionnelles manquantes (avertissements)

---

## 📚 Ressources

- [Guide de Déploiement Complet](./DEPLOYMENT_RENDER_CLERK_SUPABASE.md)
- [Clerk Environment Variables](https://clerk.com/docs/references/backend-api/overview)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

