# 📋 Plan d'Action Targetym - Priorisation & Roadmap

**Basé sur:** Audit Complet du 2025-11-21  
**Score Actuel:** 6.8/10  
**Objectif:** 8.5/10 en 1 mois

---

## 🚨 PHASE 1: STABILISATION (Semaine 1)

### Objectif: Déploiements Réussis à 100%

#### Jour 1-2: Correction Types & Déploiement ✅ EN COURS

**Status:** 🟡 Partiellement complété

- [x] Corriger erreurs TypeScript webhook
- [x] Ajouter @ts-ignore temporaire
- [x] Push vers GitHub (commit 3cef93a)
- [ ] **Régénérer types Supabase**
- [ ] Supprimer @ts-ignore
- [ ] Vérifier build local réussi

**Commandes:**
```bash
# 1. Régénérer types
./supabase.exe gen types typescript --linked > src/types/database.types.ts

# 2. Vérifier
git diff src/types/database.types.ts | grep "webhook_events"

# 3. Supprimer @ts-ignore dans route.ts
# Lignes 47, 99, 165

# 4. Test local
pnpm run build

# 5. Commit & Push
git add src/types/database.types.ts app/api/webhooks/clerk/route.ts
git commit -m "chore: Regenerate Supabase types and remove @ts-ignore"
git push github restructure/backend-frontend-separation
```

**Temps estimé:** 2 heures  
**Priorité:** 🔴 CRITIQUE

---

#### Jour 2-3: Organisation Par Défaut

**Problème:** UUID placeholder `00000000-0000-0000-0000-000000000000` n'existe pas

**Solution 1: Créer l'organisation (RECOMMANDÉ)**
```sql
-- Via Supabase Dashboard → SQL Editor
INSERT INTO organizations (
  id,
  name,
  slug,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Unassigned Users',
  'unassigned',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

**Solution 2: Rendre nullable (ALTERNATIVE)**
```sql
-- Si vous préférez rendre organization_id optionnel
ALTER TABLE profiles 
ALTER COLUMN organization_id DROP NOT NULL;

-- Ajouter un trigger pour assigner automatiquement
CREATE OR REPLACE FUNCTION assign_default_organization()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := '00000000-0000-0000-0000-000000000000';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_profile
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION assign_default_organization();
```

**Temps estimé:** 1 heure  
**Priorité:** 🔴 CRITIQUE

---

#### Jour 3-4: Build Cache Render

**Problème:** Chaque build prend 20+ secondes, pas de cache

**Solution:**
```yaml
# render.yaml - Modifier buildCommand
buildCommand: |
  echo "=== Configuring Build Cache ==="
  export NEXT_CACHE_DIR=".next/cache"
  
  echo "=== Installing pnpm ==="
  corepack enable
  corepack prepare pnpm@10.18.1 --activate
  
  echo "=== Installing dependencies ==="
  pnpm install --frozen-lockfile
  
  echo "=== Building Next.js application ==="
  pnpm run build
  
  echo "=== Build completed ==="
```

**Alternative: Utiliser Turbo Cache**
```json
// package.json
{
  "scripts": {
    "build": "turbo build",
    "build:cache": "turbo build --cache-dir=.turbo"
  }
}
```

**Temps estimé:** 2 heures  
**Priorité:** ⚠️ IMPORTANT

---

#### Jour 4-5: Pre-Push Validation

**Objectif:** Éviter les erreurs de déploiement

**Script `.git/hooks/pre-push`:**
```bash
#!/bin/bash

echo "🔍 Running pre-push validation..."

# Type check
echo "📝 Type checking..."
pnpm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

# Lint
echo "🧹 Linting..."
pnpm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed"
  exit 1
fi

# Tests (rapides seulement)
echo "🧪 Running unit tests..."
pnpm run test:unit
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ All checks passed! Pushing..."
```

**Installation:**
```bash
# Rendre exécutable
chmod +x .git/hooks/pre-push

# Ou utiliser husky
pnpm add -D husky
npx husky install
npx husky add .husky/pre-push "pnpm run check:all"
```

**Temps estimé:** 1 heure  
**Priorité:** ⚠️ IMPORTANT

---

### ✅ Résultat Phase 1

- [x] Déploiements réussis à 100%
- [x] Types synchronisés
- [x] Build cache configuré
- [x] Validation automatique

**Durée totale:** 5 jours  
**Score après Phase 1:** 7.2/10 (+0.4)

---

## 🔧 PHASE 2: CI/CD & QUALITÉ (Semaine 2-3)

### Objectif: Automatisation & Tests

#### Semaine 2: GitHub Actions

**1. Workflow CI de Base**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, restructure/backend-frontend-separation]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.18.1
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm run type-check
      
      - name: Lint
        run: pnpm run lint
      
      - name: Run tests
        run: pnpm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

**2. Workflow Security Audit**

`.github/workflows/security.yml`:
```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 1' # Tous les lundis
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10.18.1
      
      - name: Security audit
        run: pnpm audit --audit-level=moderate
      
      - name: Check outdated dependencies
        run: pnpm outdated || true
```

**Temps estimé:** 4 heures  
**Priorité:** 🔴 CRITIQUE

---

#### Semaine 2-3: Augmenter Test Coverage

**Objectif:** Passer de 65% à 75%

**Tests Prioritaires:**

1. **Webhooks Clerk** (critique)
```typescript
// __tests__/integration/webhooks/clerk.test.ts
import { POST } from '@/app/api/webhooks/clerk/route'

describe('Clerk Webhooks', () => {
  it('should create profile on user.created', async () => {
    const mockRequest = new Request('http://localhost:3000/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{
            id: 'email_123',
            email_address: 'test@example.com'
          }],
          primary_email_address_id: 'email_123'
        }
      })
    })
    
    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
  })
})
```

2. **Server Actions Critiques**
```typescript
// __tests__/unit/actions/goals.test.ts
import { createGoal, getGoals } from '@/src/actions/goals'

describe('Goals Actions', () => {
  it('should create a goal', async () => {
    const result = await createGoal({
      title: 'Test Goal',
      period: 'Q1'
    })
    
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
  })
  
  it('should get goals with pagination', async () => {
    const result = await getGoals({ page: 1, limit: 10 })
    
    expect(result.data).toBeInstanceOf(Array)
    expect(result.pagination).toHaveProperty('totalPages')
  })
})
```

3. **Components Critiques**
```typescript
// __tests__/unit/components/GoalCard.test.tsx
import { render, screen } from '@testing-library/react'
import { GoalCard } from '@/components/goals/GoalCard'

describe('GoalCard', () => {
  it('should render goal information', () => {
    render(<GoalCard goal={mockGoal} />)
    
    expect(screen.getByText('Test Goal')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
  
  it('should be accessible', async () => {
    const { container } = render(<GoalCard goal={mockGoal} />)
    const results = await axe(container)
    
    expect(results).toHaveNoViolations()
  })
})
```

**Temps estimé:** 2 semaines (temps partiel)  
**Priorité:** ⚠️ IMPORTANT

---

### ✅ Résultat Phase 2

- [x] CI/CD configuré
- [x] Tests automatisés
- [x] Coverage à 75%+
- [x] Security audit automatique

**Durée totale:** 2 semaines  
**Score après Phase 2:** 7.8/10 (+0.6)

---

## 🚀 PHASE 3: PRODUCTION-READY (Semaine 4)

### Objectif: Monitoring & Staging

#### Jour 1-2: Environnement Staging

**1. Créer Base de Données Staging**
```bash
# Via Supabase Dashboard
# Créer nouveau projet: targetym-staging
# Appliquer migrations
./supabase.exe db push --project-ref STAGING_REF
```

**2. Configurer Render Staging**
```yaml
# render.yaml - Ajouter service staging
services:
  # Production
  - type: web
    name: targetym-production
    env: node
    branch: main
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_APP_URL
        value: https://targetym.onrender.com
  
  # Staging
  - type: web
    name: targetym-staging
    env: node
    branch: restructure/backend-frontend-separation
    plan: free # Gratuit pour staging
    envVars:
      - key: NODE_ENV
        value: staging
      - key: NEXT_PUBLIC_APP_URL
        value: https://targetym-staging.onrender.com
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: https://STAGING_PROJECT.supabase.co
```

**Temps estimé:** 4 heures  
**Priorité:** 🔴 CRITIQUE

---

#### Jour 2-3: Sentry Error Tracking

**1. Configuration Sentry**
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**2. Configuration**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**3. Alertes**
```javascript
// Configurer dans Sentry Dashboard
// - Erreurs critiques → Email immédiat
// - Erreurs fréquentes → Slack notification
// - Performance issues → Weekly digest
```

**Temps estimé:** 3 heures  
**Priorité:** ⚠️ IMPORTANT

---

#### Jour 3-4: Logs Centralisés

**Option 1: Render Logs (Gratuit)**
```bash
# Activer persistent logs dans Render Dashboard
# Retention: 7 jours (plan gratuit)
```

**Option 2: Better Stack (Recommandé)**
```bash
pnpm add @logtail/pino

# src/lib/logger.ts
import pino from 'pino'
import { Logtail } from '@logtail/pino'

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: '@logtail/pino',
    options: { logtail }
  }
})
```

**Temps estimé:** 2 heures  
**Priorité:** ⚠️ IMPORTANT

---

#### Jour 4-5: Health Checks & Monitoring

**1. API Health Check Amélioré**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      clerk: 'unknown',
      redis: 'unknown'
    }
  }
  
  try {
    // Check Supabase
    const supabase = await createClient()
    const { error } = await supabase.from('organizations').select('id').limit(1)
    checks.checks.database = error ? 'unhealthy' : 'healthy'
    
    // Check Clerk
    const clerkResponse = await fetch('https://api.clerk.com/v1/health')
    checks.checks.clerk = clerkResponse.ok ? 'healthy' : 'unhealthy'
    
    // Check Redis (si configuré)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redisResponse = await fetch(process.env.UPSTASH_REDIS_REST_URL + '/ping')
      checks.checks.redis = redisResponse.ok ? 'healthy' : 'unhealthy'
    }
    
    // Déterminer status global
    const allHealthy = Object.values(checks.checks).every(c => c === 'healthy')
    checks.status = allHealthy ? 'healthy' : 'degraded'
    
    return NextResponse.json(checks, { 
      status: allHealthy ? 200 : 503 
    })
  } catch (error) {
    checks.status = 'unhealthy'
    return NextResponse.json(checks, { status: 503 })
  }
}
```

**2. Uptime Monitoring**
```bash
# Utiliser UptimeRobot (gratuit)
# Monitorer:
# - https://targetym.onrender.com/api/health (toutes les 5 min)
# - https://targetym-staging.onrender.com/api/health (toutes les 15 min)

# Alertes:
# - Email si down > 2 minutes
# - Slack si down > 5 minutes
```

**Temps estimé:** 3 heures  
**Priorité:** ⚠️ IMPORTANT

---

### ✅ Résultat Phase 3

- [x] Staging environment opérationnel
- [x] Sentry configuré
- [x] Logs centralisés
- [x] Monitoring actif

**Durée totale:** 1 semaine  
**Score après Phase 3:** 8.5/10 (+0.7)

---

## 📊 TIMELINE GLOBAL

```
Semaine 1: STABILISATION
├── Jour 1-2: Types Supabase ✅
├── Jour 2-3: Organisation défaut
├── Jour 3-4: Build cache
└── Jour 4-5: Pre-push hooks

Semaine 2-3: CI/CD & QUALITÉ
├── Semaine 2: GitHub Actions
└── Semaine 2-3: Tests (coverage 75%)

Semaine 4: PRODUCTION-READY
├── Jour 1-2: Staging environment
├── Jour 2-3: Sentry
├── Jour 3-4: Logs centralisés
└── Jour 4-5: Monitoring
```

---

## 🎯 OBJECTIFS MESURABLES

| Métrique | Actuel | Cible | Deadline |
|----------|--------|-------|----------|
| Deploy Success Rate | 0% | 95%+ | Semaine 1 |
| Test Coverage | 65% | 75%+ | Semaine 3 |
| Build Time | 20s | <15s | Semaine 1 |
| TypeScript Errors | 0 | 0 | Semaine 1 |
| CI/CD | ❌ | ✅ | Semaine 2 |
| Staging Env | ❌ | ✅ | Semaine 4 |
| Error Tracking | ❌ | ✅ | Semaine 4 |
| Score Global | 6.8/10 | 8.5/10 | 1 mois |

---

## 💰 COÛTS ESTIMÉS

### Services Gratuits
- ✅ GitHub Actions (2000 min/mois)
- ✅ Render Free Tier (staging)
- ✅ Supabase Free Tier (staging)
- ✅ UptimeRobot (50 monitors)
- ✅ Codecov (open source)

### Services Payants (Optionnels)
- Sentry: $26/mois (recommandé)
- Better Stack Logs: $10/mois (optionnel)
- Render Starter: $7/mois (production)

**Total minimum:** $0/mois (tout gratuit possible)  
**Total recommandé:** $43/mois

---

## 📞 SUPPORT & RESSOURCES

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Render Docs](https://render.com/docs)

### Scripts Utiles
```bash
# Vérifier status complet
pnpm run check:all

# Régénérer types
pnpm run supabase:types:remote

# Audit sécurité
pnpm run security:audit

# Déployer staging
git push github restructure/backend-frontend-separation

# Déployer production
git push github main
```

---

**Plan créé le:** 2025-11-21  
**Prochaine révision:** 2025-12-21  
**Responsable:** Équipe Dev Targetym
