# 🚀 Guide de Déploiement Render - Next.js + Supabase + Clerk

**Version:** 1.0.0  
**Date:** 2025-11-17  
**Stack:** Next.js 15 + Supabase + Clerk + Render

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Préparation du Projet](#préparation-du-projet)
3. [Configuration Supabase](#configuration-supabase)
4. [Configuration Clerk](#configuration-clerk)
5. [Configuration Render](#configuration-render)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Déploiement](#déploiement)
8. [Vérification Post-Déploiement](#vérification-post-déploiement)
9. [Résolution de Problèmes](#résolution-de-problèmes)
10. [Sécurité et Best Practices](#sécurité-et-best-practices)

---

## 📦 Prérequis

### Comptes Requis

- ✅ **GitHub** : Dépôt avec votre code
- ✅ **Supabase** : Projet créé et configuré
- ✅ **Clerk** : Compte et application créée
- ✅ **Render** : Compte créé (gratuit disponible)

### Outils Locaux

- Node.js 24+ installé
- pnpm 10+ installé
- Git configuré
- Accès SSH à GitHub

---

## 🔧 Préparation du Projet

### 1. Vérifier la Configuration Next.js

Vérifiez que `next.config.ts` est correctement configuré :

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ... votre configuration existante
};

export default nextConfig;
```

### 2. Créer un Fichier `.env.example`

Créez un fichier `.env.example` pour documenter toutes les variables nécessaires :

```bash
# .env.example

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Optionnel - pour migrations directes)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# AI Features (Optionnel)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting - Upstash Redis (Optionnel)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Package Manager
PNPM_VERSION=10.18.1
NODE_VERSION=24.9.0
```

### 3. Mettre à Jour `render.yaml`

Assurez-vous que `render.yaml` inclut toutes les variables Clerk :

```yaml
# render.yaml
services:
  - type: web
    name: targetym-app
    env: node
    region: frankfurt
    plan: starter

    buildCommand: |
      corepack enable
      corepack prepare pnpm@10.18.1 --activate
      pnpm install --frozen-lockfile
      pnpm run build

    startCommand: pnpm run start

    healthCheckPath: /api/health

    envVars:
      # Node Environment
      - key: NODE_ENV
        value: production

      # Application URL
      - key: NEXT_PUBLIC_APP_URL
        sync: false

      # Clerk Configuration
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false

      - key: CLERK_SECRET_KEY
        sync: false

      - key: CLERK_WEBHOOK_SECRET
        sync: false

      # Supabase Configuration
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false

      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false

      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false

      # Database Connection
      - key: DATABASE_URL
        sync: false

      # Package Manager
      - key: PNPM_VERSION
        value: "10.18.1"

      - key: NODE_VERSION
        value: "24.9.0"
```

---

## 🗄️ Configuration Supabase

### 1. Récupérer les Clés Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET)

### 2. Configurer les RLS Policies

Assurez-vous que toutes les migrations sont appliquées :

```bash
# Localement, vérifiez les migrations
npx supabase migration list

# Poussez les migrations vers Supabase Cloud
npx supabase db push
```

### 3. Configurer l'Authentification Supabase pour Clerk

Supabase doit accepter les JWT de Clerk. Créez une fonction SQL dans Supabase :

```sql
-- Créer une fonction pour vérifier les JWT Clerk
CREATE OR REPLACE FUNCTION auth.clerk_jwt()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
  payload jsonb;
BEGIN
  -- Récupérer le token depuis les headers
  token := current_setting('request.headers', true)::json->>'authorization';
  
  -- Vérifier que le token est un JWT Clerk
  -- Note: Clerk utilise des JWT signés avec leur clé publique
  -- Vous devrez peut-être adapter cette logique selon votre configuration
  
  RETURN payload;
END;
$$;
```

**Alternative :** Utilisez Supabase Auth avec Clerk via webhooks (recommandé).

### 4. Configurer les Webhooks Supabase (Optionnel)

Si vous utilisez des webhooks Supabase, configurez-les dans le Dashboard :
- **Settings** → **Database** → **Webhooks**

---

## 🔐 Configuration Clerk

### 1. Créer une Application Clerk

1. Allez sur [Clerk Dashboard](https://dashboard.clerk.com)
2. Créez une nouvelle application ou sélectionnez-en une existante
3. Notez :
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

### 2. Configurer les URLs Allowed

Dans Clerk Dashboard → **Settings** → **Paths** :

- **Frontend API**: `https://your-app.onrender.com`
- **Sign-in URL**: `https://your-app.onrender.com/auth/sign-in`
- **Sign-up URL**: `https://your-app.onrender.com/auth/sign-up`
- **After sign-in URL**: `https://your-app.onrender.com/dashboard`
- **After sign-up URL**: `https://your-app.onrender.com/dashboard`

### 3. Configurer le Webhook Clerk

1. Dans Clerk Dashboard → **Webhooks**
2. Cliquez sur **Add Endpoint**
3. URL : `https://your-app.onrender.com/api/webhooks/clerk`
4. Sélectionnez les événements :
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copiez le **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### 4. Configurer JWT Templates (Intégration Supabase)

Pour que Supabase accepte les JWT de Clerk :

1. Clerk Dashboard → **JWT Templates**
2. Créez un nouveau template :
   - **Name**: `supabase`
   - **Token Lifetime**: `3600` (1 heure)
   - **Claims**: 
   ```json
   {
     "aud": "authenticated",
     "role": "authenticated",
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}"
   }
   ```
3. Copiez le **Signing Key** (vous en aurez besoin pour Supabase)

### 5. Configurer Supabase pour Accepter Clerk JWT

Dans Supabase Dashboard → **Settings** → **API** → **JWT Settings** :

1. Ajoutez la clé publique Clerk dans **JWT Secret**
2. Ou utilisez une fonction personnalisée pour valider les JWT Clerk

**Note:** La méthode recommandée est d'utiliser les webhooks Clerk pour synchroniser les utilisateurs avec Supabase (comme dans votre code actuel).

---

## 🚀 Configuration Render

### 1. Connecter GitHub à Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **New** → **Web Service**
3. Connectez votre dépôt GitHub
4. Sélectionnez le dépôt `targetym`
5. Choisissez la branche (ex: `main` ou `restructure/backend-frontend-separation`)

### 2. Configuration du Service

**Settings de Base :**
- **Name**: `targetym-app`
- **Region**: `Frankfurt` (ou votre préférence)
- **Branch**: `main`
- **Root Directory**: `/` (racine du projet)
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  corepack enable && corepack prepare pnpm@10.18.1 --activate && pnpm install --frozen-lockfile && pnpm run build
  ```
- **Start Command**: `pnpm run start`

### 3. Variables d'Environnement Render

Dans Render Dashboard → **Environment** :

#### Variables Obligatoires

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://targetym-app.onrender.com

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Package Manager
PNPM_VERSION=10.18.1
NODE_VERSION=24.9.0
```

#### Variables Optionnelles

```bash
# Database (si vous utilisez des migrations directes)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# AI Features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Configuration Avancée

**Health Check:**
- **Health Check Path**: `/api/health`

**Auto-Deploy:**
- ✅ **Auto-Deploy**: Activé
- **Branch**: `main` (ou votre branche de production)

**Scaling:**
- **Instance Type**: `Starter` (gratuit) ou `Standard` (payant)
- **Auto-Scaling**: Désactivé (pour le plan gratuit)

---

## 🔑 Variables d'Environnement - Guide Complet

### Checklist des Variables

| Variable | Source | Où la Trouver | Obligatoire |
|----------|--------|---------------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | Settings → API Keys | ✅ Oui |
| `CLERK_SECRET_KEY` | Clerk Dashboard | Settings → API Keys | ✅ Oui |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard | Webhooks → Endpoint Secret | ✅ Oui |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Settings → API → Project URL | ✅ Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Settings → API → anon public | ✅ Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Settings → API → service_role | ✅ Oui |
| `NEXT_PUBLIC_APP_URL` | Render Dashboard | Service URL | ✅ Oui |
| `DATABASE_URL` | Supabase Dashboard | Settings → Database → Connection String | ⚠️ Optionnel |
| `OPENAI_API_KEY` | OpenAI Dashboard | API Keys | ❌ Non |
| `ANTHROPIC_API_KEY` | Anthropic Dashboard | API Keys | ❌ Non |
| `UPSTASH_REDIS_REST_URL` | Upstash Dashboard | Redis → REST URL | ❌ Non |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Dashboard | Redis → REST Token | ❌ Non |

### Script de Vérification

Créez un script pour vérifier les variables :

```typescript
// scripts/validate-env-production.ts
import { z } from 'zod'

const envSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  CLERK_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(100),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['production', 'development', 'test']),
})

export function validateProductionEnv() {
  try {
    envSchema.parse(process.env)
    console.log('✅ All environment variables are valid')
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Missing or invalid environment variables:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    }
    return false
  }
}

if (require.main === module) {
  validateProductionEnv()
}
```

---

## 🚢 Déploiement

### Méthode 1 : Déploiement Automatique (Recommandé)

1. **Poussez votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Render détectera automatiquement le push** et lancera le build

3. **Surveillez les logs** dans Render Dashboard → **Logs**

### Méthode 2 : Déploiement Manuel

1. Dans Render Dashboard → **Manual Deploy**
2. Sélectionnez la branche/commit
3. Cliquez sur **Deploy**

### Méthode 3 : Via Blueprint (render.yaml)

Si vous avez un fichier `render.yaml` :

1. Render Dashboard → **New** → **Blueprint**
2. Connectez votre dépôt GitHub
3. Render créera automatiquement le service depuis le blueprint

---

## ✅ Vérification Post-Déploiement

### 1. Vérifier le Build

Dans Render Dashboard → **Logs**, vérifiez :
- ✅ `pnpm install` réussi
- ✅ `pnpm run build` réussi
- ✅ Pas d'erreurs TypeScript
- ✅ Service démarré sur le port 10000

### 2. Tester l'Application

1. **Visitez l'URL Render** : `https://your-app.onrender.com`
2. **Vérifiez la page d'accueil** charge correctement
3. **Testez l'authentification** :
   - Cliquez sur "Sign In"
   - Créez un compte ou connectez-vous
   - Vérifiez la redirection vers `/dashboard`

### 3. Vérifier les Webhooks Clerk

1. **Dans Clerk Dashboard** → **Webhooks** → **Logs**
2. Vérifiez que les événements sont reçus :
   - `user.created` → Création de profil dans Supabase
   - `user.updated` → Mise à jour du profil
   - `user.deleted` → Soft-delete du profil

3. **Dans Supabase Dashboard** → **Table Editor** → `profiles`
4. Vérifiez qu'un nouveau profil a été créé après l'inscription

### 4. Tester les Requêtes Supabase

1. **Connectez-vous à l'application**
2. **Ouvrez la Console du navigateur** (F12)
3. **Vérifiez qu'il n'y a pas d'erreurs** :
   - Pas d'erreurs CORS
   - Pas d'erreurs d'authentification
   - Les requêtes Supabase fonctionnent

### 5. Vérifier les Headers de Sécurité

Utilisez [SecurityHeaders.com](https://securityheaders.com) ou :

```bash
curl -I https://your-app.onrender.com
```

Vérifiez la présence de :
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: ...`

### 6. Tester les API Routes

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Devrait retourner: {"status":"ok"}
```

---

## 🔧 Résolution de Problèmes

### Problème 1 : Build Échoue

**Symptômes :**
```
Error: Cannot find module '@clerk/nextjs'
```

**Solutions :**
1. Vérifiez que `package.json` inclut `@clerk/nextjs`
2. Vérifiez que `pnpm-lock.yaml` est commité
3. Vérifiez la version de Node.js (doit être 24+)

**Commande de debug :**
```bash
# Dans Render Logs, vérifiez:
node --version  # Doit être 24.x
pnpm --version  # Doit être 10.x
```

### Problème 2 : Erreur d'Authentification Clerk

**Symptômes :**
```
Error: Clerk: Missing publishableKey
```

**Solutions :**
1. Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` est défini dans Render
2. Vérifiez que la clé commence par `pk_`
3. Redéployez après avoir ajouté la variable

### Problème 3 : Erreur de Connexion Supabase

**Symptômes :**
```
Error: Invalid API key
```

**Solutions :**
1. Vérifiez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Vérifiez que les URLs sont correctes (pas d'espaces)
3. Vérifiez que les clés sont complètes (pas tronquées)

### Problème 4 : Webhooks Clerk Ne Fonctionnent Pas

**Symptômes :**
- Les utilisateurs sont créés dans Clerk mais pas dans Supabase

**Solutions :**
1. Vérifiez l'URL du webhook dans Clerk : `https://your-app.onrender.com/api/webhooks/clerk`
2. Vérifiez `CLERK_WEBHOOK_SECRET` dans Render
3. Vérifiez les logs Render pour les erreurs
4. Testez manuellement le webhook :
   ```bash
   curl -X POST https://your-app.onrender.com/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -H "svix-id: test" \
     -H "svix-timestamp: $(date +%s)" \
     -H "svix-signature: test" \
     -d '{"type":"user.created","data":{"id":"test"}}'
   ```

### Problème 5 : Erreur CORS

**Symptômes :**
```
Access to fetch at 'https://xxxxx.supabase.co' from origin 'https://your-app.onrender.com' has been blocked by CORS policy
```

**Solutions :**
1. Vérifiez `NEXT_PUBLIC_APP_URL` dans Render
2. Vérifiez la configuration CORS dans `middleware.ts`
3. Vérifiez que Supabase autorise votre domaine

### Problème 6 : Application Ne Démarre Pas

**Symptômes :**
- Build réussi mais service ne démarre pas

**Solutions :**
1. Vérifiez les logs Render pour les erreurs de démarrage
2. Vérifiez que `startCommand` est correct : `pnpm run start`
3. Vérifiez que le port est correct (Render utilise le port 10000 automatiquement)
4. Vérifiez que toutes les variables d'environnement sont définies

---

## 🔒 Sécurité et Best Practices

### 1. Secrets Management

- ✅ **Ne jamais commiter** les secrets dans Git
- ✅ Utiliser les **Environment Variables** de Render
- ✅ Marquer les secrets comme **synchronized: false** dans `render.yaml`
- ✅ Utiliser des **secrets différents** pour dev/staging/prod

### 2. Variables Publiques vs Privées

**Variables Publiques** (préfixe `NEXT_PUBLIC_`):
- Exposées au client (navigateur)
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`

**Variables Privées** (sans préfixe):
- Secrets serveur uniquement
- ✅ `CLERK_SECRET_KEY`
- ✅ `CLERK_WEBHOOK_SECRET`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `DATABASE_URL`

### 3. RLS (Row Level Security)

Assurez-vous que RLS est activé sur toutes les tables Supabase :
- ✅ `profiles` - Isolation par `organization_id`
- ✅ `goals` - Isolation par `organization_id`
- ✅ `candidates` - Isolation par `organization_id`
- ✅ Toutes les autres tables

### 4. Rate Limiting

Configurez le rate limiting pour protéger vos API :
- Utilisez Upstash Redis (optionnel mais recommandé)
- Configurez les limites dans `src/lib/middleware/rate-limiter.ts`

### 5. Monitoring

Configurez le monitoring :
- **Render Logs** : Surveillez les erreurs
- **Clerk Dashboard** : Surveillez les événements d'authentification
- **Supabase Dashboard** : Surveillez les requêtes et erreurs

### 6. Backup

- ✅ Configurez les backups automatiques dans Supabase
- ✅ Versionnez votre code sur GitHub
- ✅ Documentez vos migrations

---

## 📚 Ressources

### Documentation Officielle

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Render Documentation](https://render.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Guides Utiles

- [Clerk + Supabase Integration](https://clerk.com/blog/how-clerk-integrates-nextjs-supabase)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Déploiement

### Avant le Déploiement

- [ ] Code poussé sur GitHub
- [ ] Toutes les migrations Supabase appliquées
- [ ] Application Clerk créée et configurée
- [ ] Webhook Clerk configuré
- [ ] Variables d'environnement documentées dans `.env.example`

### Configuration Render

- [ ] Service créé sur Render
- [ ] Dépôt GitHub connecté
- [ ] Toutes les variables d'environnement définies
- [ ] Health check configuré
- [ ] Build command correct
- [ ] Start command correct

### Post-Déploiement

- [ ] Build réussi
- [ ] Application accessible
- [ ] Authentification Clerk fonctionne
- [ ] Webhooks Clerk fonctionnent
- [ ] Requêtes Supabase fonctionnent
- [ ] Headers de sécurité présents
- [ ] Pas d'erreurs dans les logs

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Render avec Clerk et Supabase ! 🚀

**Prochaines Étapes :**
1. Configurez un domaine personnalisé (optionnel)
2. Configurez le monitoring et les alertes
3. Optimisez les performances
4. Configurez les backups automatiques

---

**Besoin d'aide ?** Consultez les logs Render ou ouvrez une issue sur GitHub.

