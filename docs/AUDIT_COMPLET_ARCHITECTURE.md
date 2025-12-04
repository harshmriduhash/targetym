# 🔍 AUDIT COMPLET - Architecture Targetym

**Date:** 2025-11-17
**Objectif:** Cartographie complète du projet pour automatisation des tests et harmonisation backend/frontend

---

## 📊 Vue d'Ensemble

### Statistiques Globales
- **Server Actions:** 58 actions réparties en 9 modules
- **Services:** 14 services métier
- **Schémas Zod:** 10 schémas de validation
- **Tests Existants:** 26 fichiers de test
- **Architecture:** Next.js 15.5.4 + Supabase + Clerk

---

## 1️⃣ INVENTAIRE DES SERVER ACTIONS

### Module: Goals (7 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `create-goal.ts` | goalsService | createGoalSchema | ✅ | ✅ |
| `update-goal.ts` | goalsService | updateGoalSchema | ✅ | ⚠️ |
| `delete-goal.ts` | goalsService | N/A | ✅ | ⚠️ |
| `get-goal-by-id.ts` | goalsService | N/A | ✅ | ⚠️ |
| `get-goals.ts` | goalsService | N/A | ✅ | ⚠️ |
| `create-key-result.ts` | goalsService | createKeyResultSchema | ✅ | ⚠️ |
| `update-key-result-progress.ts` | goalsService | updateKeyResultProgressSchema | ✅ | ⚠️ |

**Tests existants:**
- ✅ Integration test: `__tests__/integration/actions/goals.test.ts`
- ❌ Tests unitaires manquants pour chaque action

---

### Module: KPIs (7 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `create-kpi.ts` | kpisService | createKpiSchema | ⚠️ | ⚠️ |
| `update-kpi.ts` | kpisService | updateKpiSchema | ⚠️ | ⚠️ |
| `delete-kpi.ts` | kpisService | N/A | ⚠️ | ⚠️ |
| `get-kpi-by-id.ts` | kpisService | N/A | ⚠️ | ⚠️ |
| `get-kpis.ts` | kpisService | N/A | ⚠️ | ⚠️ |
| `add-kpi-measurement.ts` | kpisService | addKpiMeasurementSchema | ⚠️ | ⚠️ |
| `create-kpi-alert.ts` | kpisService | createKpiAlertSchema | ⚠️ | ⚠️ |

**Tests existants:**
- ❌ Aucun test (module critique !)

---

### Module: Performance (6 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `create-review.ts` | performanceService | createReviewSchema | ⚠️ | ⚠️ |
| `update-review.ts` | performanceService | updateReviewSchema | ⚠️ | ⚠️ |
| `delete-review.ts` | performanceService | N/A | ⚠️ | ⚠️ |
| `get-review-by-id.ts` | performanceService | N/A | ⚠️ | ⚠️ |
| `get-performance-reviews.ts` | performanceService | N/A | ⚠️ | ⚠️ |
| `create-feedback.ts` | performanceService | createFeedbackSchema | ⚠️ | ⚠️ |

**Tests existants:**
- ❌ Aucun test d'action
- ✅ Service test: `__tests__/unit/lib/services/performance.service.test.ts`

---

### Module: Recruitment (12 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `create-job-posting.ts` | recruitmentService | createJobPostingSchema | ⚠️ | ⚠️ |
| `update-job-posting.ts` | recruitmentService | updateJobPostingSchema | ⚠️ | ⚠️ |
| `delete-job-posting.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `get-job-posting-by-id.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `get-job-postings.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `create-candidate.ts` | recruitmentService | createCandidateSchema | ⚠️ | ⚠️ |
| `update-candidate-status.ts` | recruitmentService | updateCandidateStatusSchema | ⚠️ | ⚠️ |
| `delete-candidate.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `get-candidate-by-id.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `get-candidates.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `schedule-interview.ts` | recruitmentService | scheduleInterviewSchema | ⚠️ | ⚠️ |
| `update-interview-feedback.ts` | recruitmentService | updateInterviewFeedbackSchema | ⚠️ | ⚠️ |
| `upload-cv.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |
| `get-cv-url.ts` | recruitmentService | N/A | ⚠️ | ⚠️ |

**Tests existants:**
- ✅ Integration test: `__tests__/integration/actions/recruitment.test.ts`
- ✅ Service test: `__tests__/unit/lib/services/recruitment.service.test.ts`
- ❌ Tests unitaires d'actions manquants

---

### Module: AI (3 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `score-cv.ts` | aiService | N/A | ⚠️ | ⚠️ |
| `synthesize-performance.ts` | aiService | N/A | ⚠️ | ⚠️ |
| `recommend-career.ts` | aiService | N/A | ⚠️ | ⚠️ |

**Tests existants:**
- ❌ Aucun test (fonctionnalités critiques !)

---

### Module: Integrations (4 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `connect-integration.ts` | integrationsService | connectIntegrationSchema | ✅ | ✅ |
| `disconnect-integration.ts` | integrationsService | N/A | ✅ | ✅ |
| `handle-oauth-callback.ts` | integrationsService | N/A | ✅ | ✅ |
| `list-integrations.ts` | integrationsService | N/A | ✅ | ✅ |

**Tests existants:**
- ✅ Unit tests pour toutes les actions
- ✅ Service test complet
- ✅ Integration test OAuth flow

---

### Module: Admin - Experiments (4 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `list-experiments.ts` | ? | N/A | ⚠️ | ⚠️ |
| `get-experiment-stats.ts` | ? | N/A | ⚠️ | ⚠️ |
| `toggle-experiment.ts` | ? | N/A | ⚠️ | ⚠️ |
| `export-experiment-results.ts` | ? | N/A | ⚠️ | ⚠️ |

**Tests existants:**
- ✅ AB testing tests
- ❌ Tests d'actions manquants

---

### Module: Admin - Feature Flags (6 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `list-flags.ts` | ? | N/A | ⚠️ | ⚠️ |
| `update-flag.ts` | ? | N/A | ⚠️ | ⚠️ |
| `toggle-flag.ts` | ? | N/A | ⚠️ | ⚠️ |
| `add-override.ts` | ? | N/A | ⚠️ | ⚠️ |
| `remove-override.ts` | ? | N/A | ⚠️ | ⚠️ |
| `list-overrides.ts` | ? | N/A | ⚠️ | ⚠️ |

**Tests existants:**
- ❌ Aucun test

---

### Module: Auth (3 actions)
| Action | Service | Validation | Auth | Status |
|--------|---------|------------|------|--------|
| `sign-in.ts` | Clerk | N/A | N/A | ⚠️ |
| `sign-up.ts` | Clerk | N/A | N/A | ⚠️ |
| `sign-out.ts` | Clerk | N/A | N/A | ⚠️ |

**Tests existants:**
- ✅ Unit test: `__tests__/unit/lib/auth/server-auth.test.ts`
- ❌ Tests d'actions manquants

---

## 2️⃣ INVENTAIRE DES SERVICES

### Services Métier Principaux

#### 1. **goalsService**
```typescript
Fichier: src/lib/services/goals.service.ts
Pattern: Singleton

Méthodes:
- createGoal()
- updateGoal()
- deleteGoal()
- getGoalById()
- getGoals()
- createKeyResult()
- updateKeyResultProgress()
- deleteKeyResult()
- addCollaborator()
- removeCollaborator()

Tables accédées:
- goals
- key_results
- goal_collaborators

Tests:
- ✅ Unit test complet
```

#### 2. **kpisService**
```typescript
Fichier: src/lib/services/kpis.service.ts
Pattern: Singleton

Méthodes: À ANALYSER
Tables accédées: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 3. **performanceService**
```typescript
Fichier: src/lib/services/performance.service.ts
Pattern: Singleton

Méthodes:
- createReview()
- updateReview()
- deleteReview()
- getReviewById()
- getReviews()
- createFeedback()
- updateFeedback()
- deleteFeedback()

Tables accédées:
- performance_reviews
- performance_ratings
- peer_feedback

Tests:
- ✅ Unit test complet
```

#### 4. **recruitmentService**
```typescript
Fichier: src/lib/services/recruitment.service.ts
Pattern: Singleton

Méthodes:
- createJobPosting()
- updateJobPosting()
- deleteJobPosting()
- getJobPostingById()
- getJobPostings()
- createCandidate()
- updateCandidateStatus()
- deleteCandidate()
- getCandidateById()
- getCandidates()
- scheduleInterview()
- updateInterviewFeedback()
- uploadCV()
- getCVUrl()

Tables accédées:
- job_postings
- candidates
- interviews

Tests:
- ✅ Unit test complet
```

#### 5. **aiService**
```typescript
Fichier: src/lib/services/ai.service.ts
Pattern: Singleton

Méthodes:
- scoreCV()
- synthesizePerformance()
- recommendCareer()

APIs externes:
- OpenAI / Anthropic

Tests:
- ❌ Aucun test
```

#### 6. **integrationsService**
```typescript
Fichier: src/lib/services/integrations.service.ts
Pattern: Singleton

Méthodes:
- connectIntegration()
- disconnectIntegration()
- handleOAuthCallback()
- listIntegrations()
- getIntegrationConfig()

Tables accédées:
- integrations
- integration_configs

Tests:
- ✅ Unit test complet
```

#### 7. **employeesService**
```typescript
Fichier: src/lib/services/employees.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 8. **noticesService**
```typescript
Fichier: src/lib/services/notices.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 9. **portalService**
```typescript
Fichier: src/lib/services/portal.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 10. **settingsService**
```typescript
Fichier: src/lib/services/settings.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 11. **notificationsService**
```typescript
Fichier: src/lib/services/notifications.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

#### 12. **organizationService**
```typescript
Fichier: src/lib/services/organization.service.ts
Status: À ANALYSER

Tests:
- ❌ Aucun test
```

---

## 3️⃣ SCHÉMAS DE VALIDATION ZOD

### Inventaire des Schémas

| Schéma | Actions Utilisant | Couverture |
|--------|-------------------|------------|
| `goals.schemas.ts` | create-goal, update-goal, create-key-result, update-key-result-progress | ✅ |
| `kpis.schemas.ts` | create-kpi, update-kpi, add-kpi-measurement, create-kpi-alert | ⚠️ |
| `performance.schemas.ts` | create-review, update-review, create-feedback | ⚠️ |
| `recruitment.schemas.ts` | create-job-posting, update-job-posting, create-candidate, update-candidate-status, schedule-interview, update-interview-feedback | ⚠️ |
| `employees.schemas.ts` | ? | ❌ |
| `forms.schemas.ts` | ? | ❌ |
| `help.schemas.ts` | ? | ❌ |
| `notices.schemas.ts` | ? | ❌ |
| `portal.schemas.ts` | ? | ❌ |
| `settings.schemas.ts` | ? | ❌ |

---

## 4️⃣ TESTS EXISTANTS

### Couverture Actuelle

#### Tests Unitaires (18 fichiers)
✅ **Services:**
- goals.service.test.ts
- recruitment.service.test.ts
- performance.service.test.ts
- integrations.service.test.ts

✅ **Actions:**
- integrations/connect-integration.test.ts
- integrations/disconnect-integration.test.ts
- integrations/handle-oauth-callback.test.ts
- integrations/list-integrations.test.ts

✅ **Utils:**
- errors.test.ts
- response.test.ts
- pagination.test.ts
- crypto.test.ts
- pkce.test.ts

✅ **Auth:**
- server-auth.test.ts

✅ **Analytics:**
- ab-testing.test.ts
- integration-events.test.ts

✅ **React Query:**
- use-goals.test.tsx

✅ **Middleware:**
- action-rate-limit.test.ts

#### Tests d'Intégration (4 fichiers)
- goals.test.ts
- recruitment.test.ts
- oauth-flow.test.ts
- ab-testing-verification.test.ts

#### Tests Realtime (1 fichier)
- realtime.test.tsx

---

## 5️⃣ GAPS CRITIQUES IDENTIFIÉS

### 🔴 Tests Manquants (Priorité HAUTE)

#### Module KPIs - 0% de couverture
- ❌ create-kpi.ts
- ❌ update-kpi.ts
- ❌ delete-kpi.ts
- ❌ get-kpi-by-id.ts
- ❌ get-kpis.ts
- ❌ add-kpi-measurement.ts
- ❌ create-kpi-alert.ts
- ❌ kpisService (service complet)

#### Module AI - 0% de couverture
- ❌ score-cv.ts
- ❌ synthesize-performance.ts
- ❌ recommend-career.ts
- ❌ aiService (service complet)

#### Module Admin - 0% de couverture
- ❌ Tous les experiments actions (4)
- ❌ Tous les feature-flags actions (6)

#### Module Auth - Tests partiels
- ❌ sign-in.ts
- ❌ sign-up.ts
- ❌ sign-out.ts

#### Autres Services Non Testés
- ❌ employeesService
- ❌ noticesService
- ❌ portalService
- ❌ settingsService
- ❌ notificationsService
- ❌ organizationService

### 🟡 Tests Incomplets (Priorité MOYENNE)

#### Module Goals
- ✅ Integration test exists
- ❌ Unit tests pour chaque action manquants
- ❌ Tests edge cases

#### Module Performance
- ✅ Service test exists
- ❌ Action tests manquants
- ❌ Tests de workflow complet

#### Module Recruitment
- ✅ Service + Integration tests
- ❌ Unit tests pour chaque action
- ❌ Tests upload CV

---

## 6️⃣ ANALYSE DE SÉCURITÉ

### Pattern d'Authentification

**Attendu dans chaque action:**
```typescript
const { userId, organizationId } = await getAuthContext()
```

**Actions à auditer:**
- ⚠️ Toutes les actions KPIs
- ⚠️ Toutes les actions Performance
- ⚠️ Toutes les actions Recruitment (hors integrations)
- ⚠️ Toutes les actions AI
- ⚠️ Toutes les actions Admin

### RLS Policies (à vérifier dans Supabase)
- Toutes tables doivent filtrer par `organization_id`
- Helper function: `get_user_organization_id()`
- Politiques basées sur rôles: admin, hr, manager, employee

---

## 7️⃣ DÉPENDANCES FRONTEND → BACKEND

### Pages à Analyser
```
app/dashboard/
├── goals/
├── kpis/
├── performance/
├── recruitment/
├── employees/
├── forms/
├── help/
├── leaves/
├── notices/
├── portal/
├── security/
└── settings/
```

**À mapper pour chaque page:**
- Composants utilisés
- Server Actions appelées
- State management (React Query)
- Flux de données (create, read, update, delete)

---

## 8️⃣ PRIORITÉS D'ACTION

### Phase 1: Tests Critiques (Semaine 1)
1. **KPIs Module:** Créer tous les tests (service + actions)
2. **AI Module:** Créer tous les tests (service + actions)
3. **Performance Actions:** Ajouter tests unitaires manquants
4. **Recruitment Actions:** Compléter tests unitaires

### Phase 2: Services Non Testés (Semaine 2)
1. employeesService
2. noticesService
3. portalService
4. settingsService
5. notificationsService
6. organizationService

### Phase 3: Admin & Feature Flags (Semaine 3)
1. Experiments actions (4)
2. Feature flags actions (6)
3. Auth actions (3)

### Phase 4: Harmonisation Frontend/Backend (Semaine 4)
1. Mapper dépendances pages → actions
2. Auditer appels API
3. Vérifier cohérence des types
4. Optimiser React Query usage

---

## 9️⃣ MÉTRIQUES CIBLES

### Objectifs de Couverture
- **Tests Unitaires:** 80% minimum
- **Tests Intégration:** Tous les flux CRUD
- **Tests E2E:** Parcours utilisateur critiques

### Modules Prioritaires
1. **KPIs:** 0% → 80% ✅
2. **AI:** 0% → 80% ✅
3. **Performance:** 40% → 80% ✅
4. **Recruitment:** 60% → 85% ✅
5. **Goals:** 70% → 85% ✅

---

## 🔟 PROCHAINES ÉTAPES

### Audit Approfondi Requis
1. **Lire chaque service non testé** pour comprendre les méthodes
2. **Analyser les schémas Zod** non utilisés
3. **Mapper les pages frontend** vers actions backend
4. **Auditer getAuthContext()** dans toutes les actions
5. **Vérifier les RLS policies** dans Supabase migrations

### Génération Automatique de Tests
1. **Template pour tests d'actions** (pattern standardisé)
2. **Template pour tests de services** (pattern singleton)
3. **Mocks Supabase réutilisables**
4. **Fixtures de données** pour chaque module

---

**Statut:** 🟡 Audit initial complet - Analyse détaillée requise
**Prochaine étape:** Analyse approfondie de chaque module non testé
