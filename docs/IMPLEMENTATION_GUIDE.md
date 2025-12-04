# 🚀 Guide d'Implémentation MVP Smart

Guide pratique pour implémenter les optimisations du MVP Smart Audit.

---

## Phase 1 : Quick Wins (1 semaine)

### Jour 1 : Activer TypeScript Checks

#### 1. Modifier next.config.ts

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... autres configs

  // ❌ AVANT
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ APRÈS
  typescript: {
    ignoreBuildErrors: false,  // Activer les checks
  },
}
```

#### 2. Fixer les erreurs TypeScript

```bash
# Identifier toutes les erreurs
pnpm type-check

# Fixer progressivement par dossier
pnpm type-check --incremental
```

#### 3. Valider le build

```bash
# Build complet
pnpm build

# Si succès, push les changements
git add next.config.ts
git commit -m "chore: enable TypeScript build checks"
git push
```

---

### Jours 2-3 : Setup Caching Strategy

#### 1. Créer compte Upstash Redis

1. Allez sur https://upstash.com
2. Créez un nouveau database Redis
3. Copiez les credentials :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

#### 2. Ajouter les variables d'environnement

**Local (.env.local) :**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**Render Dashboard :**
- Environment → Add Environment Variable
- Ajoutez les deux variables ci-dessus
- Redéployez

#### 3. Utiliser le cache dans vos services

```typescript
// src/lib/services/goals.service.ts
import { getCached, CacheKeys, invalidateCache } from '@/src/lib/cache'

export class GoalsService {
  async getGoalsByOrg(orgId: string) {
    return getCached(
      CacheKeys.goals.byOrg(orgId),
      async () => {
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('organization_id', orgId)

        return data || []
      },
      300  // 5 minutes TTL
    )
  }

  async createGoal(data: CreateGoalData) {
    const goal = await this.insertGoal(data)

    // Invalider le cache après création
    await invalidateCache(CacheKeys.goals.byOrg(data.organization_id))

    return goal
  }
}
```

#### 4. Tester le caching

```bash
# Dev local
pnpm dev

# Tester une requête 2 fois (devrait être plus rapide la 2ème fois)
curl http://localhost:3000/api/goals

# Vérifier les logs de cache
# [Cache] MISS: goals:org:xxx
# [Cache] HIT: goals:org:xxx  ✅
```

---

### Jours 4-5 : Bundle Size Optimization

#### 1. Ajouter Dynamic Imports

```typescript
// app/dashboard/analytics/page.tsx
import dynamic from 'next/dynamic'

// ❌ AVANT
import { AnalyticsCharts } from '@/components/analytics/charts'

// ✅ APRÈS
const AnalyticsCharts = dynamic(
  () => import('@/components/analytics/charts'),
  {
    loading: () => <Skeleton className="h-96" />,
    ssr: false,  // Si pas besoin de SSR
  }
)

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <AnalyticsCharts />
    </div>
  )
}
```

#### 2. Analyser le bundle

```bash
# Ajouter dans package.json
"scripts": {
  "analyze": "ANALYZE=true pnpm build"
}

# Exécuter l'analyse
pnpm analyze

# Ouvrir .next/analyze/client.html dans le navigateur
```

#### 3. Optimiser next.config.ts

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... autres configs

  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react'],
    optimizeCss: true,          // ✅ Nouveau
    webpackBuildWorker: true,   // ✅ Nouveau
  },
}
```

#### 4. Rebuild et comparer

```bash
# Build avant optimisation
pnpm build
# Notez la taille : First Load JS shared by all

# Build après optimisation
pnpm build
# Devrait être ~20-30% plus petit
```

---

## Phase 2 : Fondations Solides (2 semaines)

### Semaine 1 : Monitoring

#### 1. Setup Sentry (Jour 1)

```bash
# Installer Sentry
pnpm add @sentry/nextjs

# Wizard d'installation
npx @sentry/wizard@latest -i nextjs
```

Suivez le wizard qui va :
- Créer `sentry.client.config.ts`
- Créer `sentry.server.config.ts`
- Créer `sentry.edge.config.ts`
- Ajouter `instrumentation.ts`

#### 2. Variables Sentry dans Render

```bash
# Render Dashboard → Environment
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...  # Pour uploads de source maps
```

#### 3. Tester Sentry

```typescript
// Ajouter dans une page test
import * as Sentry from '@sentry/nextjs'

export default function TestPage() {
  return (
    <button onClick={() => {
      Sentry.captureMessage('Test de Sentry!')
    }}>
      Test Sentry
    </button>
  )
}
```

Vérifiez dans Sentry Dashboard que l'événement apparaît.

#### 4. Utiliser le Logger (Jours 2-3)

```typescript
// Dans vos API routes
import { log, logRequest } from '@/src/lib/logger'

export async function GET(req: Request) {
  const endLog = logRequest(req)

  try {
    const data = await fetchData()

    log.info('Data fetched successfully', { count: data.length })

    endLog()  // Log la requête
    return Response.json(data)
  } catch (error) {
    log.error('Failed to fetch data', error)
    endLog()
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

### Semaine 2 : Database Optimizations

#### 1. Créer Database Views (Jours 1-2)

```sql
-- supabase/migrations/20251107_create_dashboard_view.sql
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  o.id,
  o.name,
  o.subscription_tier,
  COUNT(DISTINCT g.id) as total_goals,
  COUNT(DISTINCT c.id) as total_candidates,
  AVG(pr.overall_rating) as avg_performance_rating,
  COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END) as completed_goals
FROM organizations o
LEFT JOIN goals g ON g.organization_id = o.id
LEFT JOIN candidates c ON c.organization_id = o.id
LEFT JOIN performance_reviews pr ON pr.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_tier;

-- Grant access
GRANT SELECT ON dashboard_summary TO authenticated;
```

```bash
# Appliquer la migration
npx supabase db push
```

#### 2. Utiliser la View dans le Code

```typescript
// src/lib/services/dashboard.service.ts
async getDashboardSummary(orgId: string) {
  const { data } = await supabase
    .from('dashboard_summary')  // ✅ Utiliser la view
    .select('*')
    .eq('id', orgId)
    .single()

  return data
}
```

#### 3. Ajouter des Indexes (Jour 3)

```sql
-- supabase/migrations/20251107_add_indexes.sql
-- Index sur organization_id pour toutes les tables principales
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_org_id
  ON goals(organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candidates_org_id
  ON candidates(organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_reviews_org_id
  ON performance_reviews(organization_id);

-- Index composite pour queries fréquentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_org_status
  ON goals(organization_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_candidates_job_status
  ON candidates(job_posting_id, status);
```

```bash
# Appliquer
npx supabase db push
```

#### 4. Mesurer l'Impact

```sql
-- Avant et après, comparer les plans de requête
EXPLAIN ANALYZE
SELECT * FROM goals
WHERE organization_id = 'xxx';

-- Devrait montrer "Index Scan" au lieu de "Seq Scan"
```

---

### CI/CD Amélioré (Jours 4-5)

#### 1. GitHub Actions pour Tests

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, restructure/*]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10.18.1

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/coverage-final.json
```

#### 2. Tester le Workflow

```bash
# Créer une branche de test
git checkout -b test/ci-workflow

# Commit et push
git add .github/workflows/ci.yml
git commit -m "ci: add automated testing workflow"
git push

# Vérifier dans GitHub → Actions
```

---

## Phase 3 : Features Smart (1 semaine)

### Jours 1-2 : AI Caching

#### 1. Créer AI Cache Utility

```typescript
// src/lib/ai-cache.ts
import { getCached } from '@/src/lib/cache'
import crypto from 'crypto'

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16)
}

export async function getCachedAIResponse(
  prompt: string,
  generator: () => Promise<string>,
  ttl: number = 3600  // 1 heure
): Promise<string> {
  const hash = hashPrompt(prompt)
  const cacheKey = `ai:response:${hash}`

  return getCached(cacheKey, generator, ttl)
}
```

#### 2. Utiliser dans les AI Routes

```typescript
// app/api/ai/chat/route.ts
import { getCachedAIResponse } from '@/src/lib/ai-cache'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1].content

  // Pour les prompts répétitifs, utiliser le cache
  if (messages.length === 1) {
    const cached = await getCachedAIResponse(
      lastMessage,
      async () => {
        const result = await streamText({
          model: openai('gpt-4o'),
          prompt: lastMessage,
        })
        return result.text
      }
    )

    return Response.json({ response: cached })
  }

  // Sinon, stream normal
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  })

  return result.toTextStreamResponse()
}
```

---

### Jours 3-4 : Webhooks & Cron

#### 1. Setup Render Cron Job

```yaml
# render.yaml
services:
  # ... existing web service

  # ✅ Nouveau : Cron job
  - type: cron
    name: targetym-daily-reports
    schedule: "0 9 * * *"  # 9h chaque jour
    env: node
    buildCommand: pnpm install
    command: "pnpm tsx scripts/generate-daily-reports.ts"
    envVars:
      - fromGroup: targetym-app  # Partager les vars
```

#### 2. Créer le Script Cron

```typescript
// scripts/generate-daily-reports.ts
import { createClient } from '@/src/lib/supabase/server'
import { log } from '@/src/lib/logger'

async function generateDailyReports() {
  log.info('Starting daily reports generation')

  const supabase = await createClient()

  // Récupérer toutes les organisations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')

  for (const org of orgs || []) {
    // Générer rapport pour chaque org
    const report = await generateOrgReport(org.id)

    // Envoyer par email ou stocker
    await storeReport(org.id, report)

    log.info(`Report generated for ${org.name}`)
  }

  log.info('Daily reports completed')
}

generateDailyReports()
  .then(() => process.exit(0))
  .catch((error) => {
    log.error('Daily reports failed', error)
    process.exit(1)
  })
```

---

## ✅ Checklist Finale

### Phase 1
- [ ] TypeScript checks activés
- [ ] Build passe sans erreurs
- [ ] Upstash Redis configuré
- [ ] Cache utilisé dans 3+ services
- [ ] Bundle size réduit de 20%+

### Phase 2
- [ ] Sentry configuré et testé
- [ ] Logger utilisé dans tous les API routes
- [ ] 3+ database views créées
- [ ] Indexes ajoutés sur tables principales
- [ ] GitHub Actions CI/CD fonctionnel

### Phase 3
- [ ] AI caching implémenté
- [ ] Économies AI mesurées (target: -30%)
- [ ] Cron jobs configurés
- [ ] Webhooks testés

---

## 🎯 Validation des Optimisations

### Tester Performance

```bash
# 1. Lighthouse audit
npx lighthouse https://targetym-app.onrender.com --view

# Target: Score > 90

# 2. Bundle analysis
pnpm analyze

# Target: First Load JS < 150kB

# 3. API response time
curl -w "@curl-format.txt" -o /dev/null -s https://targetym-app.onrender.com/api/goals

# Target: < 200ms
```

### Tester Monitoring

```bash
# 1. Health check
curl https://targetym-app.onrender.com/api/health

# Devrait retourner: {"status":"healthy"}

# 2. Sentry
# Déclencher une erreur volontaire et vérifier dans Sentry Dashboard

# 3. Logs
# Vérifier logs dans Render Dashboard → Logs
```

### Tester Cache

```bash
# 1. Première requête (MISS)
curl https://targetym-app.onrender.com/api/goals
# Logs: [Cache] MISS: goals:org:xxx

# 2. Deuxième requête (HIT)
curl https://targetym-app.onrender.com/api/goals
# Logs: [Cache] HIT: goals:org:xxx
# Devrait être 5-10x plus rapide
```

---

**🎉 Félicitations !** Vous avez implémenté toutes les optimisations MVP Smart !

**Prochaines étapes :**
1. Monitorer les métriques pendant 1 semaine
2. Ajuster les TTL de cache selon l'usage
3. Identifier les prochaines optimisations
