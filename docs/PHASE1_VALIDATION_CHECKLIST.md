# ✅ PHASE 1: PRÉPARATION IMMÉDIATE - CHECKLIST DE VALIDATION

**Date de Début:** 2025-01-XX  
**Agent Responsable:** DevOps CI/CD Render  
**Statut:** 🟡 **EN COURS**

---

## 📋 TÂCHES DE LA PHASE 1

### Tâche 1.1: Vérifier Configuration Render ✅

#### 1.1.1 Vérifier `render.yaml`

**Fichier:** `render.yaml`

**Points à Vérifier:**

- [x] **Fichier présent:** ✅ `render.yaml` existe
- [ ] **Branch:** Actuellement `restructure/backend-frontend-separation` 
  - ⚠️ **ACTION REQUISE:** Vérifier si c'est la bonne branch ou changer pour `main`
- [x] **Build Command:** ✅ Présent et correct
  ```yaml
  buildCommand: |
    corepack enable
    corepack prepare pnpm@10.18.1 --activate
    pnpm install --frozen-lockfile
    pnpm run build
  ```
- [x] **Start Command:** ✅ `pnpm run start`
- [x] **Health Check Path:** ✅ `/api/health`
- [x] **Variables d'Environnement:** ✅ Documentées dans render.yaml
- [x] **Auto-deploy:** ✅ Activé

**Problèmes Identifiés:**
- ⚠️ **Branch:** `restructure/backend-frontend-separation` - À vérifier si c'est la branch de production

**Actions Requises:**
1. Vérifier quelle branch est utilisée pour la production
2. Mettre à jour `render.yaml` si nécessaire

---

### Tâche 1.2: Préparer Checklist Variables d'Environnement

#### Variables Requises (CRITIQUES)

| Variable | Source | Où Obtenir | Statut |
|----------|--------|------------|--------|
| `NODE_ENV` | Render | `production` (automatique) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Render | Fourni après création service | ⏸️ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Dashboard → Settings → API → Project URL | ⏸️ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Dashboard → Settings → API → `anon public` key | ⏸️ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Dashboard → Settings → API → `service_role` key ⚠️ SECRET | ⏸️ |
| `DATABASE_URL` | Supabase | Dashboard → Settings → Database → Connection string (Transaction mode) | ⏸️ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Dashboard → API Keys → Publishable key | ⏸️ |
| `CLERK_SECRET_KEY` | Clerk | Dashboard → API Keys → Secret key ⚠️ SECRET | ⏸️ |
| `CLERK_WEBHOOK_SECRET` | Clerk | Dashboard → Webhooks → Signing secret ⚠️ SECRET | ⏸️ |

#### Variables Optionnelles

| Variable | Source | Où Obtenir | Statut |
|----------|--------|------------|--------|
| `OPENAI_API_KEY` | OpenAI | platform.openai.com → API Keys | ⏸️ Optionnel |
| `ANTHROPIC_API_KEY` | Anthropic | console.anthropic.com → API Keys | ⏸️ Optionnel |
| `UPSTASH_REDIS_REST_URL` | Upstash | Dashboard → Redis → REST URL | ⏸️ Optionnel |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Dashboard → Redis → REST Token | ⏸️ Optionnel |

**Template pour Render Dashboard:**
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://targetym-app.onrender.com

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://juuekovwshynwgjkqkbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.juuekovwshynwgjkqkbu:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI (Optionnel)
OPENAI_API_KEY=sk-...
# OU
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting (Optionnel)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Actions Requises:**
- [ ] Collecter toutes les valeurs des variables
- [ ] Documenter dans ce fichier (sans exposer les secrets)
- [ ] Préparer pour copier-coller dans Render Dashboard

---

### Tâche 1.3: Tester Build Local

**Commandes à Exécuter:**

```bash
# 1. Nettoyer les builds précédents
pnpm run clean

# 2. Installer les dépendances (si nécessaire)
pnpm install

# 3. Build de production
pnpm run build

# 4. Vérifier qu'il n'y a pas d'erreurs
```

**Résultats Attendus:**
- ✅ Build réussit sans erreurs
- ✅ Pas d'erreurs TypeScript
- ✅ Pas d'erreurs de linting critiques
- ✅ Dossier `.next` créé avec succès

**Statut:** ⏸️ **À TESTER**

---

### Tâche 1.4: Tester Health Check Local

**Commandes à Exécuter:**

```bash
# 1. Démarrer le serveur de production
pnpm run start

# 2. Dans un autre terminal, tester le health check
curl http://localhost:3000/api/health
# OU
# Ouvrir dans le navigateur: http://localhost:3000/api/health
```

**Résultat Attendu:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-01-XX...",
  "version": "local",
  "checks": {
    "database": { "status": "up" | "down" },
    "redis": { "status": "up" | "down" },
    "ai": { "status": "up" | "down" }
  },
  "uptime": 123
}
```

**Statut:** ⏸️ **À TESTER**

---

### Tâche 1.5: Vérifier Migrations Supabase

**Commandes à Exécuter:**

```bash
# 1. Vérifier les migrations locales
ls supabase/migrations/

# 2. Vérifier la connexion Supabase production
# (Nécessite d'être connecté à Supabase CLI)
supabase link --project-ref juuekovwshynwgjkqkbu

# 3. Vérifier les migrations appliquées
supabase db diff

# 4. Générer les types TypeScript depuis production
pnpm run supabase:types:remote
```

**Résultats Attendus:**
- ✅ Toutes les migrations sont listées
- ✅ Connexion Supabase production réussie
- ✅ Pas de migrations en attente (ou migration planifiée)
- ✅ Types TypeScript générés

**Statut:** ⏸️ **À TESTER**

---

## 📊 RÉSUMÉ DE VALIDATION

### Éléments Validés ✅

- [x] Configuration `render.yaml` présente
- [x] Build command correct
- [x] Start command correct
- [x] Health check path configuré
- [x] Variables d'environnement documentées

### Éléments à Valider ⏸️

- [ ] Branch dans render.yaml (vérifier si `restructure/backend-frontend-separation` est correct)
- [ ] Build local réussi
- [ ] Health check local fonctionne
- [ ] Migrations Supabase vérifiées
- [ ] Variables d'environnement collectées

### Problèmes Identifiés ⚠️

1. **Branch dans render.yaml:** `restructure/backend-frontend-separation`
   - **Question:** Est-ce la branch de production ou faut-il utiliser `main`?
   - **Action:** À valider avec l'utilisateur

---

## 🎯 PROCHAINES ÉTAPES

Une fois toutes les tâches validées:

1. **Corriger render.yaml** si nécessaire (branch)
2. **Créer le service Render** sur dashboard.render.com
3. **Configurer les variables d'environnement** dans Render Dashboard
4. **Lancer le premier déploiement**
5. **Valider le déploiement** (health check, application accessible)

---

**Dernière mise à jour:** 2025-01-XX  
**Statut Global:** 🟡 **EN COURS**


