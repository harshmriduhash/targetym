# Analyse Détaillée des Services Non Testés

**Date:** 2025-11-17
**Objectif:** Analyser en profondeur les 3 services sans tests unitaires pour créer des templates de tests automatisés
**Status:** ✅ **ANALYSE COMPLÈTE**

---

## 📊 Vue d'Ensemble

### Services Analysés

| Service | Lignes | Méthodes | Complexité | Priorité Tests |
|---------|--------|----------|------------|----------------|
| **PerformanceService** | 283 | 10 | 🟡 Moyenne | **MOYENNE** |
| **RecruitmentService** | 512 | 13 | 🟠 Moyenne-Élevée | **HAUTE** |
| **AIService** | 598 | 12 | 🔴 Très Élevée | **TRÈS HAUTE** |

**Total:** 1,393 lignes | 35 méthodes à tester

---

## 1️⃣ PerformanceService - Analyse Détaillée

### 📁 Fichier
`src/lib/services/performance.service.ts` (283 lignes)

### 🎯 Fonctionnalités

| Méthode | Type | Complexité | Description |
|---------|------|------------|-------------|
| `createPerformanceReview()` | CRUD Create | 🟢 Simple | Création review avec données validées |
| `getPerformanceReviews()` | CRUD Read | 🟡 Moyenne | Lecture avec filtres multiples |
| `getPerformanceReviewById()` | CRUD Read | 🟢 Simple | Lecture single avec NotFoundError |
| `getEmployeeReviews()` | Query | 🟢 Simple | Reviews par employé |
| `updatePerformanceReview()` | CRUD Update | 🟢 Simple | Update avec auto-timestamp |
| `getPerformanceReviewSummary()` | Vue DB | 🟡 Moyenne | Requête sur vue `performance_review_summary` |
| `createFeedback()` | CRUD Create | 🟢 Simple | Création peer feedback |
| `getEmployeeFeedback()` | Query | 🟢 Simple | Feedback par employé |
| `getFeedbackByReview()` | Query | 🟢 Simple | Feedback par review |
| `getAveragePerformanceRating()` | RPC | 🟠 Complexe | Appel fonction Supabase RPC |

### 🧪 Points de Test Critiques

#### 1. **CRUD Operations** (7 tests)
```typescript
// ✅ CREATE
- createPerformanceReview: données valides
- createPerformanceReview: données minimales
- createFeedback: feedback complet

// ✅ READ
- getPerformanceReviews: tous les filtres
- getPerformanceReviews: sans filtre
- getPerformanceReviewById: review existante
- getPerformanceReviewById: NotFoundError si inexistante

// ✅ UPDATE
- updatePerformanceReview: update partiel
- updatePerformanceReview: update complet
```

#### 2. **Filtres Dynamiques** (3 tests)
```typescript
- Filter par reviewee_id
- Filter par reviewer_id
- Filter par status + review_period (combinés)
```

#### 3. **Vue Database** (2 tests)
```typescript
- getPerformanceReviewSummary: retourne données enrichies
- getPerformanceReviewSummary: gère organization vide
```

#### 4. **RPC Function** (2 tests)
```typescript
- getAveragePerformanceRating: avec période
- getAveragePerformanceRating: sans période (tous temps)
- getAveragePerformanceRating: gère erreur RPC
```

### 🚨 Risques Identifiés

| Risque | Niveau | Description |
|--------|--------|-------------|
| **Types Supabase** | 🟡 Moyen | `@ts-expect-error` sur RPC (ligne 268) |
| **Soft Delete** | 🟢 Faible | `.is('deleted_at', null)` requis partout |
| **NotFoundError** | 🟡 Moyen | Non testé actuellement |
| **Vue DB** | 🟠 Élevé | Dépendance sur vue externe non testée |

### 📝 Template de Test

```typescript
// __tests__/unit/lib/services/performance.service.test.ts
import { performanceService } from '@/src/lib/services/performance.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError } from '@/src/lib/utils/errors'

jest.mock('@/src/lib/supabase/server')

describe('PerformanceService', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      rpc: jest.fn(),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPerformanceReview', () => {
    it('should create performance review with valid data', async () => {
      const mockData = {
        reviewee_id: 'user-1',
        reviewer_id: 'user-2',
        review_period: 'Q1-2024',
        review_period_start: '2024-01-01',
        review_period_end: '2024-03-31',
        review_type: 'quarterly',
        organization_id: 'org-1',
      }

      const mockReview = { id: 'review-1', ...mockData, status: 'draft' }
      mockSupabase.single.mockResolvedValue({ data: mockReview, error: null })

      const result = await performanceService.createPerformanceReview(mockData)

      expect(result).toEqual(mockReview)
      expect(mockSupabase.from).toHaveBeenCalledWith('performance_reviews')
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewee_id: 'user-1',
          status: 'draft',
        })
      )
    })

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      })

      await expect(
        performanceService.createPerformanceReview({} as any)
      ).rejects.toThrow('Failed to create performance review')
    })
  })

  describe('getPerformanceReviewById', () => {
    it('should throw NotFoundError if review does not exist', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null })

      await expect(
        performanceService.getPerformanceReviewById('non-existent')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('getAveragePerformanceRating', () => {
    it('should calculate average rating with period', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 4.5, error: null })

      const result = await performanceService.getAveragePerformanceRating(
        'profile-1',
        'Q1-2024'
      )

      expect(result).toBe(4.5)
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'calculate_avg_performance_rating',
        {
          profile_id_param: 'profile-1',
          period_param: 'Q1-2024',
        }
      )
    })

    it('should return 0 if no data', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      const result = await performanceService.getAveragePerformanceRating('profile-1')

      expect(result).toBe(0)
    })
  })
})
```

### 📊 Estimation Tests

- **Nombre de tests:** 14-16 tests unitaires
- **Temps développement:** 2-3 heures
- **Coverage cible:** 85-90%

---

## 2️⃣ RecruitmentService - Analyse Détaillée

### 📁 Fichier
`src/lib/services/recruitment.service.ts` (512 lignes)

### 🎯 Fonctionnalités

| Méthode | Type | Complexité | Description |
|---------|------|------------|-------------|
| `createJobPosting()` | CRUD Create | 🟢 Simple | Création job posting |
| `getJobPostings()` | CRUD Read | 🔴 **Très Complexe** | **Pagination + Filtres + Joins + N+1 fix** |
| `getJobPostingById()` | CRUD Read | 🟠 Complexe | Joins multiples (hiring_manager, candidates) |
| `updateJobPosting()` | CRUD Update | 🟢 Simple | Update avec auto-timestamp |
| `getJobPostingsWithStats()` | Vue DB | 🟡 Moyenne | Vue `job_postings_with_stats` |
| `createCandidate()` | CRUD Create | 🟢 Simple | Création candidat |
| `getCandidates()` | CRUD Read | 🔴 **Très Complexe** | **Pagination + Filtres + Joins** |
| `getCandidateById()` | CRUD Read | 🔴 Très Complexe | Joins profonds (job, interviews, interviewers) |
| `updateCandidate()` | CRUD Update | 🟢 Simple | Update générique |
| `updateCandidateStatus()` | CRUD Update | 🟡 Moyenne | Update spécialisé status + stage |
| `scheduleInterview()` | CRUD Create | 🟢 Simple | Création interview |
| `updateInterviewFeedback()` | CRUD Update | 🟢 Simple | Update feedback interview |

### 🔥 Points Complexes Critiques

#### 1. **Pagination Utility** (TRÈS IMPORTANT)
```typescript
// Utilise des helpers custom:
import {
  type PaginationParams,
  type PaginatedResponse,
  normalizePagination,    // { page: 1, pageSize: 10 }
  getPaginationOffset,    // offset = (page - 1) * pageSize
  createPaginatedResponse, // { data, page, pageSize, total, ... }
} from '@/src/lib/utils/pagination'

// Exemple getJobPostings():
const { page, pageSize } = normalizePagination(pagination)
const offset = getPaginationOffset(page, pageSize)

// Query 1: COUNT total
const { count } = await baseQuery

// Query 2: SELECT avec .range()
const { data } = await dataQuery.range(offset, offset + pageSize - 1)

return createPaginatedResponse(jobs || [], page, pageSize, count || 0)
```

**Tests requis:**
- ✅ Sans pagination (défaut: page=1, pageSize=10)
- ✅ Avec page=2, pageSize=20
- ✅ Range calculation correct
- ✅ Total count vs data.length

#### 2. **Joins Complexes avec N+1 Prevention**
```typescript
// Exemple: getJobPostingById() (lignes 178-194)
.select(`
  *,
  hiring_manager:profiles!hiring_manager_id(id, email, full_name, avatar_url, phone),
  created_by_user:profiles!created_by(id, email, full_name),
  candidates(
    id,
    name,
    email,
    status,
    current_stage,
    created_at
  )
`)
```

**Tests requis:**
- ✅ Structure de données enrichie correcte
- ✅ Hiring manager présent
- ✅ Candidates array présent
- ✅ Pas de N+1 (1 seule requête)

#### 3. **Filtres Dynamiques Multiples**
```typescript
// getJobPostings() - 4 filtres possibles:
if (filters?.status) query = query.eq('status', filters.status)
if (filters?.department) query = query.eq('department', filters.department)
if (filters?.location) query = query.eq('location', filters.location)
if (filters?.hiring_manager_id) query = query.eq('hiring_manager_id', filters.hiring_manager_id)
```

**Tests requis:**
- ✅ Aucun filtre
- ✅ 1 filtre seul
- ✅ Combinaison de 2-3 filtres
- ✅ Tous les filtres

### 🧪 Points de Test Critiques

#### **Job Postings** (8 tests)
```typescript
1. createJobPosting: données complètes
2. createJobPosting: données minimales (status='draft' par défaut)
3. getJobPostings: sans pagination ni filtres
4. getJobPostings: avec pagination (page=2, pageSize=5)
5. getJobPostings: avec filtres (status + department)
6. getJobPostingById: job avec hiring_manager + candidates
7. getJobPostingById: NotFoundError si inexistant
8. updateJobPosting: update avec auto-timestamp
```

#### **Candidates** (7 tests)
```typescript
9. createCandidate: données complètes
10. getCandidates: avec pagination
11. getCandidates: avec filtres (job_posting_id + status)
12. getCandidateById: candidat avec job + interviews + interviewers
13. updateCandidate: update partiel
14. updateCandidateStatus: status + current_stage
15. updateCandidateStatus: status seul (stage optionnel)
```

#### **Interviews** (3 tests)
```typescript
16. scheduleInterview: données complètes
17. scheduleInterview: status='scheduled' par défaut
18. updateInterviewFeedback: update feedback + rating + decision
```

### 🚨 Risques Identifiés

| Risque | Niveau | Description |
|--------|--------|-------------|
| **Pagination Logic** | 🔴 Très Élevé | Complex offset calculation, count vs data |
| **N+1 Queries** | 🟠 Élevé | Joins multiples doivent être testés |
| **Filtres Combinés** | 🟡 Moyen | Tous les if() doivent être couverts |
| **Joins Profonds** | 🔴 Très Élevé | `getCandidateById()` 3 niveaux de profondeur |
| **Vue DB** | 🟡 Moyen | `job_postings_with_stats` non testée |

### 📝 Template de Test (Extrait)

```typescript
// __tests__/unit/lib/services/recruitment.service.test.ts
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError } from '@/src/lib/utils/errors'

jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/utils/pagination', () => ({
  normalizePagination: jest.fn((params) => ({
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
  })),
  getPaginationOffset: jest.fn((page, pageSize) => (page - 1) * pageSize),
  createPaginatedResponse: jest.fn((data, page, pageSize, total) => ({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    },
  })),
}))

describe('RecruitmentService', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getJobPostings with Pagination', () => {
    it('should return paginated job postings with correct offset', async () => {
      const mockJobs = [
        { id: 'job-1', title: 'Job 1' },
        { id: 'job-2', title: 'Job 2' },
      ]

      // Mock COUNT query
      mockSupabase.single.mockResolvedValueOnce({ count: 25, error: null })

      // Mock SELECT query with range
      mockSupabase.single.mockResolvedValueOnce({ data: mockJobs, error: null })

      const result = await recruitmentService.getJobPostings(
        'org-1',
        {},
        { page: 2, pageSize: 10 } // offset should be 10
      )

      expect(mockSupabase.range).toHaveBeenCalledWith(10, 19) // offset 10, offset + pageSize - 1
      expect(result.data).toEqual(mockJobs)
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.total).toBe(25)
    })
  })

  describe('getJobPostingById with Joins', () => {
    it('should return job with hiring_manager and candidates', async () => {
      const mockJob = {
        id: 'job-1',
        title: 'Software Engineer',
        hiring_manager: {
          id: 'manager-1',
          full_name: 'John Doe',
          email: 'john@example.com',
        },
        candidates: [
          { id: 'candidate-1', name: 'Alice' },
          { id: 'candidate-2', name: 'Bob' },
        ],
      }

      mockSupabase.maybeSingle.mockResolvedValue({ data: mockJob, error: null })

      const result = await recruitmentService.getJobPostingById('job-1')

      expect(result).toEqual(mockJob)
      expect(result.hiring_manager).toBeDefined()
      expect(result.candidates).toHaveLength(2)
      expect(mockSupabase.select).toHaveBeenCalledWith(
        expect.stringContaining('hiring_manager:profiles')
      )
    })
  })

  describe('getCandidateById with Deep Joins', () => {
    it('should return candidate with job, interviews, and interviewers', async () => {
      const mockCandidate = {
        id: 'candidate-1',
        name: 'Alice Smith',
        job_posting: {
          id: 'job-1',
          title: 'Software Engineer',
          hiring_manager: {
            id: 'manager-1',
            full_name: 'John Doe',
          },
        },
        interviews: [
          {
            id: 'interview-1',
            interview_type: 'technical',
            interviewer: {
              id: 'interviewer-1',
              full_name: 'Jane Doe',
            },
          },
        ],
      }

      mockSupabase.maybeSingle.mockResolvedValue({ data: mockCandidate, error: null })

      const result = await recruitmentService.getCandidateById('candidate-1')

      expect(result.job_posting).toBeDefined()
      expect(result.job_posting.hiring_manager).toBeDefined()
      expect(result.interviews[0].interviewer).toBeDefined()
    })
  })
})
```

### 📊 Estimation Tests

- **Nombre de tests:** 20-24 tests unitaires
- **Temps développement:** 4-5 heures
- **Coverage cible:** 90-95%
- **Fichiers à mocker:** `pagination.ts`, `supabase/server.ts`

---

## 3️⃣ AIService - Analyse Détaillée

### 📁 Fichier
`src/lib/services/ai.service.ts` (598 lignes)

### 🎯 Fonctionnalités

| Méthode | Type | Complexité | Description |
|---------|------|------------|-------------|
| `getModel()` | Config | 🟡 Moyenne | Sélection provider (Anthropic/OpenAI) |
| `createError()` | Helper | 🟢 Simple | Création AIServiceError |
| `isAIAvailable()` | Helper | 🟢 Simple | Check API keys |
| `scoreCandidateCV()` | **AI Core** | 🔴 **Très Complexe** | **Vercel AI SDK + JSON Parse** |
| `getFallbackCVScore()` | Fallback | 🟢 Simple | Score par défaut |
| `synthesizePerformance()` | **AI Core** | 🔴 **Très Complexe** | **Vercel AI SDK + JSON Parse** |
| `getFallbackPerformanceSynthesis()` | Fallback | 🟢 Simple | Synthèse par défaut |
| `recommendCareerPath()` | **AI Core** | 🔴 **Très Complexe** | **Vercel AI SDK + JSON Parse** |
| `getFallbackCareerRecommendation()` | Fallback | 🟢 Simple | Recommandations par défaut |
| `streamChat()` | **AI Streaming** | 🔴 Très Complexe | **Streaming AI responses** |
| `saveCVScore()` | DB | 🟡 Moyenne | Save AI results to DB |
| `generateInsights()` | Analytics | 🟢 Simple | Stub pour insights |

### 🔥 Complexité Extrême

#### 1. **Vercel AI SDK Integration**
```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { generateText, streamText, type CoreMessage } from 'ai'

// Dans scoreCandidateCV():
const { text } = await generateText({
  model,              // anthropic('claude-3-5-sonnet-20241022') OU openai('gpt-4o')
  prompt,             // Prompt complexe multi-sections
  temperature: 0.3,   // Paramètre AI
  maxTokens: 2000,    // Limite tokens
})
```

**Tests requis:**
- ✅ Mock `generateText()` pour retourner JSON valide
- ✅ Mock `streamText()` pour tests streaming
- ✅ Test avec provider='anthropic'
- ✅ Test avec provider='openai'
- ✅ Test erreur API_KEY_MISSING
- ✅ Test fallback si generateText() échoue

#### 2. **JSON Parsing Complexe**
```typescript
// Ligne 162-168:
const jsonMatch = text.match(/\{[\s\S]*\}/)
if (!jsonMatch) {
  throw this.createError('Failed to parse AI response', 'API_ERROR')
}

const analysis = JSON.parse(jsonMatch[0])
```

**Risques:**
- ⚠️ Regex peut échouer si AI retourne texte invalide
- ⚠️ JSON.parse() peut throw si malformé
- ⚠️ Pas de validation du schéma JSON

**Tests requis:**
- ✅ AI retourne JSON valide complet
- ✅ AI retourne texte sans JSON → throw error
- ✅ AI retourne JSON malformé → throw error
- ✅ AI retourne JSON partiel → fallback

#### 3. **Multiples Providers (Anthropic + OpenAI)**
```typescript
private getModel() {
  const provider = process.env.AI_PROVIDER || 'anthropic'

  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw this.createError('ANTHROPIC_API_KEY is not configured', 'API_KEY_MISSING')
    }
    return anthropic('claude-3-5-sonnet-20241022')
  }

  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw this.createError('OPENAI_API_KEY is not configured', 'API_KEY_MISSING')
    }
    return openai('gpt-4o')
  }

  throw this.createError(`Invalid AI provider: ${provider}`, 'INVALID_INPUT')
}
```

**Tests requis:**
- ✅ ANTHROPIC_API_KEY présent → retourne anthropic model
- ✅ OPENAI_API_KEY présent → retourne openai model
- ✅ Aucune API key → throw API_KEY_MISSING
- ✅ Provider invalide → throw INVALID_INPUT

#### 4. **Fallback Strategy**
```typescript
// Toutes les méthodes AI ont un fallback:
try {
  const model = this.getModel()
  const { text } = await generateText({ ... })
  return parsedResult
} catch (error) {
  logger.error('Failed to score CV with AI', { error })
  return this.getFallbackCVScore(startTime) // ← FALLBACK
}
```

**Tests requis:**
- ✅ Fallback appelé si API échoue
- ✅ Fallback appelé si parsing échoue
- ✅ Fallback structure conforme au type de retour
- ✅ Logger appelé avec bon message

#### 5. **Streaming AI**
```typescript
async streamChat(messages: CoreMessage[]) {
  const result = await streamText({
    model,
    messages,
    temperature: 0.7,
    maxTokens: 2000,
  })

  return result.toDataStreamResponse() // ← Stream Response
}
```

**Tests requis:**
- ✅ Mock streamText() return value
- ✅ Vérifier toDataStreamResponse() appelé
- ✅ Test erreur streaming

### 🧪 Points de Test Critiques

#### **Configuration & Helpers** (6 tests)
```typescript
1. getModel: retourne anthropic si ANTHROPIC_API_KEY
2. getModel: retourne openai si OPENAI_API_KEY
3. getModel: throw si aucune API key
4. getModel: throw si provider invalide
5. isAIAvailable: true si au moins 1 key présente
6. createError: crée AIServiceError avec code + originalError
```

#### **CV Scoring** (8 tests)
```typescript
7. scoreCandidateCV: succès avec JSON valide
8. scoreCandidateCV: parsing JSON correct (strengths, concerns, score)
9. scoreCandidateCV: gère AI response sans JSON → fallback
10. scoreCandidateCV: gère generateText() error → fallback
11. scoreCandidateCV: AI unavailable → fallback immédiat
12. scoreCandidateCV: temperature=0.3 + maxTokens=2000
13. getFallbackCVScore: retourne structure valide
14. getFallbackCVScore: score=75, recommendation='maybe'
```

#### **Performance Synthesis** (6 tests)
```typescript
15. synthesizePerformance: succès avec JSON valide
16. synthesizePerformance: calcule trends correctement
17. synthesizePerformance: fallback si AI fail
18. getFallbackPerformanceSynthesis: calcule averageRating correct
19. synthesizePerformance: AI unavailable → fallback
20. synthesizePerformance: temperature=0.5
```

#### **Career Recommendations** (6 tests)
```typescript
21. recommendCareerPath: succès avec JSON valide
22. recommendCareerPath: retourne suggestedRoles array
23. recommendCareerPath: retourne developmentPlan
24. recommendCareerPath: fallback si AI fail
25. getFallbackCareerRecommendation: retourne role "Senior + currentRole"
26. recommendCareerPath: temperature=0.6 + maxTokens=3000
```

#### **Streaming Chat** (3 tests)
```typescript
27. streamChat: succès avec messages valides
28. streamChat: appelle toDataStreamResponse()
29. streamChat: throw si AI unavailable
```

#### **Database Integration** (2 tests)
```typescript
30. saveCVScore: update candidates table
31. saveCVScore: gère error DB
```

### 🚨 Risques Identifiés

| Risque | Niveau | Description |
|--------|--------|-------------|
| **API Externes** | 🔴 Critique | Dépendance Anthropic/OpenAI |
| **JSON Parsing** | 🔴 Critique | Regex + parse peuvent échouer |
| **Prompts Stability** | 🟠 Élevé | AI peut changer format réponse |
| **Rate Limiting** | 🟡 Moyen | Pas de gestion rate limits |
| **Fallbacks** | 🟡 Moyen | Doivent être testés |
| **Error Codes** | 🟢 Faible | Bien définis (API_KEY_MISSING, etc.) |

### 📝 Template de Test (Complet)

```typescript
// __tests__/unit/lib/services/ai.service.test.ts
import { aiService } from '@/src/lib/services/ai.service'
import { generateText, streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { logger } from '@/src/lib/utils/logger'
import { createClient } from '@/src/lib/supabase/server'

jest.mock('ai')
jest.mock('@ai-sdk/anthropic')
jest.mock('@ai-sdk/openai')
jest.mock('@/src/lib/utils/logger')
jest.mock('@/src/lib/supabase/server')

describe('AIService', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = process.env
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getModel - Provider Selection', () => {
    it('should return anthropic model when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      process.env.AI_PROVIDER = 'anthropic'

      const mockModel = { name: 'claude' }
      ;(anthropic as jest.Mock).mockReturnValue(mockModel)

      // Call private method via scoreCandidateCV (which calls getModel)
      // Or use reflection to test private method
      expect(anthropic).toHaveBeenCalledWith('claude-3-5-sonnet-20241022')
    })

    it('should throw error when no API key is configured', async () => {
      delete process.env.ANTHROPIC_API_KEY
      delete process.env.OPENAI_API_KEY

      await expect(
        aiService.scoreCandidateCV('cv text', 'job desc', ['req1'])
      ).rejects.toThrow('not configured')
    })
  })

  describe('scoreCandidateCV', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      process.env.AI_PROVIDER = 'anthropic'
    })

    it('should successfully score CV with valid AI response', async () => {
      const mockAIResponse = `
Here is the analysis:
{
  "score": 85,
  "summary": "Strong candidate with relevant experience",
  "strengths": ["React expertise", "5 years experience"],
  "concerns": ["No TypeScript experience"],
  "recommendation": "yes",
  "matchPercentage": 85,
  "detailedAnalysis": {
    "skillsMatch": 90,
    "experienceMatch": 85,
    "educationMatch": 80,
    "culturalFit": 85
  },
  "improvementSuggestions": ["Learn TypeScript"]
}
`

      ;(generateText as jest.Mock).mockResolvedValue({
        text: mockAIResponse,
      })

      const result = await aiService.scoreCandidateCV(
        'CV text here',
        'Software Engineer position',
        ['React', 'TypeScript', 'Node.js']
      )

      expect(result.score).toBe(85)
      expect(result.strengths).toContain('React expertise')
      expect(result.recommendation).toBe('yes')
      expect(result.aiModel).toMatch(/claude|gpt/)
      expect(result.processingTime).toBeGreaterThan(0)
    })

    it('should return fallback when AI response has no JSON', async () => {
      ;(generateText as jest.Mock).mockResolvedValue({
        text: 'This is just plain text without JSON',
      })

      const result = await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(result.score).toBe(75) // Fallback score
      expect(result.recommendation).toBe('maybe')
      expect(result.summary).toContain('unavailable')
      expect(logger.error).toHaveBeenCalled()
    })

    it('should return fallback when generateText throws error', async () => {
      ;(generateText as jest.Mock).mockRejectedValue(
        new Error('API rate limit exceeded')
      )

      const result = await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(result.score).toBe(75)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to score CV with AI',
        expect.any(Object)
      )
    })

    it('should use correct temperature and maxTokens', async () => {
      ;(generateText as jest.Mock).mockResolvedValue({
        text: '{"score": 80}',
      })

      await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
          maxTokens: 2000,
        })
      )
    })
  })

  describe('synthesizePerformance', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
    })

    it('should synthesize performance reviews successfully', async () => {
      const mockReviews = [
        {
          date: '2024-01-01',
          rating: 4,
          strengths: ['Leadership'],
          improvements: ['Communication'],
        },
        {
          date: '2024-06-01',
          rating: 5,
          strengths: ['Innovation'],
          improvements: [],
        },
      ]

      const mockAIResponse = `{
        "overallTrend": "improving",
        "averageRating": 4.5,
        "keyStrengths": ["Leadership", "Innovation"],
        "criticalImprovementAreas": ["Communication"],
        "recommendations": ["Focus on team communication"],
        "careerTrajectory": "On track for senior role",
        "nextSteps": ["Lead a project"],
        "aiInsights": "Employee shows strong growth trajectory."
      }`

      ;(generateText as jest.Mock).mockResolvedValue({
        text: mockAIResponse,
      })

      const result = await aiService.synthesizePerformance(mockReviews)

      expect(result.overallTrend).toBe('improving')
      expect(result.averageRating).toBe(4.5)
      expect(result.keyStrengths).toContain('Leadership')
    })

    it('should calculate fallback average rating correctly', async () => {
      delete process.env.ANTHROPIC_API_KEY

      const mockReviews = [
        { date: '2024-01-01', rating: 3, strengths: [], improvements: [] },
        { date: '2024-06-01', rating: 5, strengths: [], improvements: [] },
      ]

      const result = await aiService.synthesizePerformance(mockReviews)

      expect(result.averageRating).toBe(4) // (3 + 5) / 2
      expect(result.overallTrend).toBe('stable')
    })
  })

  describe('recommendCareerPath', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
    })

    it('should generate career recommendations successfully', async () => {
      const mockResponse = `{
        "suggestedRoles": [
          {
            "title": "Senior Software Engineer",
            "match": 90,
            "reasoning": "Strong technical skills",
            "requiredSkills": ["System Design"],
            "timeline": "6-12 months"
          }
        ],
        "skillGaps": [
          {
            "skill": "System Design",
            "currentLevel": "intermediate",
            "targetLevel": "advanced",
            "learningResources": ["Course A"]
          }
        ],
        "developmentPlan": {
          "shortTerm": ["Complete project X"],
          "mediumTerm": ["Lead a team"],
          "longTerm": ["Become architect"]
        },
        "mentorshipSuggestions": ["Find senior mentor"],
        "estimatedTimeToPromotion": "12 months",
        "aiInsights": "Strong growth potential."
      }`

      ;(generateText as jest.Mock).mockResolvedValue({
        text: mockResponse,
      })

      const result = await aiService.recommendCareerPath(
        'Software Engineer',
        ['React', 'Node.js'],
        'Consistently high performer',
        ['Architecture', 'Leadership']
      )

      expect(result.suggestedRoles).toHaveLength(1)
      expect(result.suggestedRoles[0].title).toBe('Senior Software Engineer')
      expect(result.developmentPlan.shortTerm).toContain('Complete project X')
    })

    it('should use higher temperature for creative recommendations', async () => {
      ;(generateText as jest.Mock).mockResolvedValue({
        text: '{"suggestedRoles": []}',
      })

      await aiService.recommendCareerPath('Dev', [], 'Good', [])

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.6, // Higher than CV scoring (0.3)
          maxTokens: 3000,
        })
      )
    })
  })

  describe('streamChat', () => {
    it('should stream chat responses', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      const mockStreamResult = {
        toDataStreamResponse: jest.fn().mockReturnValue('stream-response'),
      }

      ;(streamText as jest.Mock).mockResolvedValue(mockStreamResult)

      const messages = [
        { role: 'user' as const, content: 'Hello' },
      ]

      const result = await aiService.streamChat(messages)

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages,
          temperature: 0.7,
        })
      )
      expect(mockStreamResult.toDataStreamResponse).toHaveBeenCalled()
      expect(result).toBe('stream-response')
    })

    it('should throw error if AI not available', async () => {
      delete process.env.ANTHROPIC_API_KEY

      await expect(
        aiService.streamChat([{ role: 'user' as const, content: 'Hi' }])
      ).rejects.toThrow('not configured')
    })
  })

  describe('saveCVScore', () => {
    it('should save CV score to database', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      await aiService.saveCVScore({
        candidate_id: 'candidate-1',
        score: 85,
        summary: 'Great candidate',
        strengths: ['React'],
        concerns: [],
        recommendation: 'yes',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('candidates')
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_cv_score: 85,
          ai_cv_analysis: expect.objectContaining({
            summary: 'Great candidate',
          }),
        })
      )
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'candidate-1')
    })

    it('should throw error if database update fails', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      await expect(
        aiService.saveCVScore({
          candidate_id: 'candidate-1',
          score: 85,
          summary: '',
          strengths: [],
          concerns: [],
          recommendation: 'yes',
        })
      ).rejects.toThrow('Failed to update AI CV score')
    })
  })
})
```

### 📊 Estimation Tests

- **Nombre de tests:** 30-35 tests unitaires
- **Temps développement:** 6-8 heures (complexité AI + mocking)
- **Coverage cible:** 85-90%
- **Fichiers à mocker:**
  - `ai` (Vercel AI SDK)
  - `@ai-sdk/anthropic`
  - `@ai-sdk/openai`
  - `@/src/lib/utils/logger`
  - `@/src/lib/supabase/server`

---

## 📊 Résumé Global

### Priorisation des Tests

| Rang | Service | Tests Requis | Temps Estimé | Complexité | ROI |
|------|---------|--------------|--------------|------------|-----|
| **1** | **AIService** | 30-35 | 6-8h | 🔴 Très Élevée | **CRITICAL** |
| **2** | **RecruitmentService** | 20-24 | 4-5h | 🟠 Élevée | **HIGH** |
| **3** | **PerformanceService** | 14-16 | 2-3h | 🟡 Moyenne | **MEDIUM** |

### Total Effort

- **Tests totaux:** 64-75 tests unitaires
- **Temps total:** 12-16 heures
- **Coverage cible:** 85-92%
- **Fichiers de tests:** 3 fichiers principaux
- **Mocks requis:** 8-10 modules externes

### Dépendances Clés

**Tous les services:**
- `@/src/lib/supabase/server`
- Jest + Testing Library

**RecruitmentService uniquement:**
- `@/src/lib/utils/pagination`

**AIService uniquement:**
- `ai` (Vercel AI SDK)
- `@ai-sdk/anthropic`
- `@ai-sdk/openai`
- `@/src/lib/utils/logger`

---

## 🎯 Prochaines Étapes

### Phase 1: Créer Templates de Tests (NEXT)
1. ✅ Template PerformanceService
2. ✅ Template RecruitmentService (avec pagination)
3. ✅ Template AIService (avec AI mocks)

### Phase 2: Implémenter Tests Automatisés
1. Créer fichiers de tests complets
2. Ajouter tous les tests cases
3. Vérifier coverage 85%+

### Phase 3: Documentation
1. Guide de testing patterns
2. Best practices mocking Supabase
3. Guide testing AI services

---

## 📝 Commandes Utiles

```bash
# Run tests pour un service spécifique
npm test -- performance.service.test.ts
npm test -- recruitment.service.test.ts
npm test -- ai.service.test.ts

# Run tous les tests services
npm run test:unit -- --testPathPattern=services

# Coverage
npm run test:coverage

# Watch mode
npm test -- --watch performance.service.test.ts
```

---

**✅ ANALYSE TERMINÉE**
**Date:** 2025-11-17
**Prêt pour:** Création templates de tests automatisés
