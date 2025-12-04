# Guide de Test - Targetym HR SaaS

## 📊 État Actuel des Tests

### Tests Créés ✅
- **Backend Services:**
  - `goals.service.test.ts` - Service Goals avec cache
  - `recruitment.service.test.ts` - Service Recruitment complet
  - `performance.service.test.ts` - Service Performance

- **Utilities:**
  - `pagination.test.ts` - 25/25 tests ✅ (100% coverage)
  - `errors.test.ts` - Classes d'erreurs et gestion
  - `response.test.ts` - Helpers de réponse API

- **Middleware:**
  - `action-rate-limit.test.ts` - Rate limiting complet

- **Authentication:**
  - `server-auth.test.ts` - Authentification unifiée Clerk/Supabase

- **React Hooks:**
  - `use-goals.test.tsx` - Hooks React Query pour Goals

- **Integration:**
  - `goals.test.ts` - Tests d'intégration Server Actions Goals
  - `recruitment.test.ts` - Tests d'intégration Recruitment

### Couverture Actuelle
- **Target:** 80%+
- **Actuel:** ~7% → En progression vers 40%+ avec nouveaux tests

---

## 🚀 Commandes de Test

### Exécuter Tous les Tests
```bash
npm test
```

### Tests avec Couverture
```bash
npm run test:coverage
```

### Tests en Mode Watch
```bash
npm run test:watch
```

### Tests Spécifiques

#### Backend Services
```bash
npm test -- __tests__/unit/lib/services/
```

#### Utilities
```bash
npm test -- __tests__/unit/lib/utils/
```

#### Middleware
```bash
npm test -- __tests__/unit/lib/middleware/
```

#### React Hooks
```bash
npm test -- __tests__/unit/lib/react-query/
```

#### Integration Tests
```bash
npm test -- __tests__/integration/
```

#### Test d'un Fichier Spécifique
```bash
npm test -- __tests__/unit/lib/utils/pagination.test.ts
```

#### Tests par Pattern
```bash
npm test -- --testNamePattern="should create goal"
```

---

## 📝 Tests à Créer (Prochaines Étapes)

### Backend - Haute Priorité

#### 1. Services Manquants
- [ ] `organization.service.test.ts`
- [ ] `ai.service.test.ts`

#### 2. Repositories
- [ ] `base.repository.test.ts`
- [ ] `goals.repository.test.ts`

#### 3. Cache Layer
- [ ] `redis.test.ts`
- [ ] `service-cache.test.ts`

#### 4. Middleware Manquant
- [ ] `rate-limit.test.ts` (core)
- [ ] `error-handler.test.ts`

#### 5. Server Actions (17 fichiers)
**Goals:**
- [x] `create-goal.test.ts` (via integration)
- [ ] `update-goal.test.ts`
- [ ] `delete-goal.test.ts`
- [ ] `get-goals.test.ts`
- [ ] `get-goal.test.ts`

**Recruitment:**
- [x] Tests de base créés
- [ ] `update-job-posting.test.ts`
- [ ] `update-interview-feedback.test.ts`

**Performance:**
- [ ] `create-review.test.ts`
- [ ] `update-review.test.ts`
- [ ] `create-feedback.test.ts`

**AI:**
- [ ] `score-cv.test.ts`
- [ ] `synthesize-performance.test.ts`
- [ ] `recommend-career.test.ts`

### Frontend - Haute Priorité

#### 1. React Query Hooks
- [x] `use-goals.test.tsx`
- [ ] `use-recruitment.test.tsx`
- [ ] `use-performance.test.tsx`

#### 2. Real-time Hooks
- [ ] `use-realtime-goals.test.tsx`
- [ ] `use-optimistic-goals.test.tsx`

#### 3. Components UI
- [ ] `GoalForm.test.tsx`
- [ ] `GoalsList.test.tsx`
- [ ] `JobPostingForm.test.tsx`
- [ ] `CandidateCard.test.tsx`

---

## 🔧 Patterns de Test

### 1. Test d'un Service Backend

```typescript
/**
 * @jest-environment node
 */

import { myService } from '@/src/lib/services/my.service'
import { createClient } from '@/src/lib/supabase/server'

jest.mock('@/src/lib/supabase/server')

describe('MyService', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      // ... autres méthodes
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('should perform operation', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: '1' },
      error: null,
    })

    const result = await myService.myMethod()

    expect(result).toEqual({ id: '1' })
  })
})
```

### 2. Test d'un React Hook

```typescript
/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMyHook } from '@/src/lib/react-query/hooks/use-my-hook'

describe('useMyHook', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('should fetch data', async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

### 3. Test de Server Action

```typescript
import { myAction } from '@/src/actions/my-action'
import { myService } from '@/src/lib/services/my.service'
import { getAuthContext } from '@/src/lib/auth/server-auth'

jest.mock('@/src/lib/services/my.service')
jest.mock('@/src/lib/auth/server-auth')

describe('myAction', () => {
  beforeEach(() => {
    (getAuthContext as jest.Mock).mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
    })
  })

  it('should validate and execute', async () => {
    ;(myService.myMethod as jest.Mock).mockResolvedValue({ id: '1' })

    const result = await myAction({ data: 'test' })

    expect(result.success).toBe(true)
  })
})
```

---

## 🎯 Stratégie pour Atteindre 80%

### Phase 1: Services Core (Priorité Immédiate)
1. Compléter tests services (organization, ai)
2. Créer tests repositories
3. Tests cache layer

**Estimation:** +15% coverage | 2-3 heures

### Phase 2: Server Actions
1. Tests actions Goals restantes (4 fichiers)
2. Tests actions Recruitment restantes (3 fichiers)
3. Tests actions Performance (3 fichiers)
4. Tests actions AI (3 fichiers)

**Estimation:** +20% coverage | 3-4 heures

### Phase 3: Frontend Hooks
1. use-recruitment.test.tsx
2. use-performance.test.tsx
3. use-realtime-goals.test.tsx
4. use-optimistic-goals.test.tsx

**Estimation:** +10% coverage | 2-3 heures

### Phase 4: Components UI
1. Forms (GoalForm, JobPostingForm)
2. Lists (GoalsList, CandidateList)
3. Dashboards

**Estimation:** +15% coverage | 3-4 heures

### Phase 5: Integration & E2E
1. Full user flows
2. Real-time sync scenarios
3. Auth flows complets

**Estimation:** +10% coverage | 2-3 heures

**Total estimé:** 70%+ coverage | 12-17 heures

---

## 🔍 Vérification de la Couverture

### Voir le Rapport HTML
```bash
npm run test:coverage
# Ouvrir: coverage/lcov-report/index.html
```

### Vérifier les Seuils
```bash
npm run test:ci
```

### Fichiers Non Couverts
```bash
npm run test:coverage | grep "0 %"
```

---

## 🐛 Debugging des Tests

### Verbose Mode
```bash
npm test -- --verbose
```

### Tests qui Échouent Seulement
```bash
npm test -- --onlyFailures
```

### Avec Logs de Console
```bash
npm test -- --silent=false
```

### Debug Spécifique
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## ✅ Checklist Avant Commit

- [ ] Tous les tests passent: `npm test`
- [ ] Couverture ≥ 80%: `npm run test:coverage`
- [ ] Pas de tests skippés (`it.skip`, `describe.skip`)
- [ ] Type-check OK: `npm run type-check`
- [ ] Lint OK: `npm run lint`

---

## 📚 Ressources

### Documentation
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)

### Patterns Avancés
- **Mocking Supabase Realtime:** Voir `use-realtime-goals.test.tsx`
- **Optimistic Updates:** Voir `use-optimistic-goals.test.tsx`
- **Rate Limiting:** Voir `action-rate-limit.test.ts`
- **Auth Flow:** Voir `server-auth.test.ts`

---

## 🎓 Prochaines Actions

1. **Exécuter les tests existants:**
   ```bash
   npm test
   ```

2. **Vérifier la couverture actuelle:**
   ```bash
   npm run test:coverage
   ```

3. **Créer les tests manquants prioritaires:**
   - organization.service.test.ts
   - ai.service.test.ts
   - Repositories tests

4. **Itérer jusqu'à 80%+ coverage**

---

**Note:** Ce guide sera mis à jour au fur et à mesure de la progression.
