# PLAN D'IMPLÉMENTATION AVEC AGENTS SPÉCIALISÉS
**Projet**: Targetym - Corrections CRUD & Sécurité
**Date**: 17 Novembre 2025
**Référence**: AUDIT_COMPLET_TARGETYM_2025.md
**Durée totale estimée**: 38-42 heures
**Équipe**: 4 agents spécialisés + 1 chef de projet

---

## STRUCTURE DES AGENTS

### Agent 1: Backend Security Specialist
**Responsabilité**: Sécurité RLS, Rate Limiting, Authentication
**Compétences**: Supabase RLS, PostgreSQL, Security Best Practices
**Charge**: 10 heures

### Agent 2: Backend Validation Specialist
**Responsabilité**: Schémas Zod, Type Safety, Data Validation
**Compétences**: Zod, TypeScript, Database Schema Design
**Charge**: 8 heures

### Agent 3: Backend Performance Engineer
**Responsabilité**: Cache Invalidation, Performance Optimization
**Compétences**: Redis, Caching Strategies, Query Optimization
**Charge**: 12 heures

### Agent 4: Frontend Developer
**Responsabilité**: UI/UX, Component Integration, User Flows
**Compétences**: React, Next.js, Form Handling
**Charge**: 4 heures

### Agent 5: QA & Integration Tester
**Responsabilité**: Testing, Validation, Integration Tests
**Compétences**: Jest, Integration Testing, Security Testing
**Charge**: 4 heures

---

## PHASE 1: CRITIQUES & SÉCURITÉ (Semaine 1 - 16-18h)

### JOUR 1 - Sécurité RLS (2h)

#### 🔴 TÂCHE 1.1: Fix RLS Policy - Goals Table
**Agent**: Backend Security Specialist
**Priorité**: P0 - CRITIQUE
**Durée**: 30 minutes
**Fichier**: `supabase/migrations/20251117000000_fix_rls_goals.sql`

**Instructions détaillées**:
```sql
-- Créer nouvelle migration
-- Fichier: supabase/migrations/20251117000000_fix_rls_goals.sql

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can view goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can insert goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can update goals" ON goals;
DROP POLICY IF EXISTS "Authenticated users can delete goals" ON goals;

-- 2. Create secure policies with organization_id filter
CREATE POLICY "Users can view own organization goals"
  ON goals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create goals in own organization"
  ON goals FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own goals or if manager"
  ON goals FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Users can delete own goals or if admin"
  ON goals FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profiles
      WHERE id = auth.uid()
    )
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  );
```

**Tests de validation**:
1. Créer 2 organisations test: org_a, org_b
2. Créer user_a (org_a), user_b (org_b)
3. user_a crée un goal
4. Vérifier que user_b ne peut PAS voir le goal de user_a
5. Vérifier que user_a peut voir/modifier son propre goal

**Commandes**:
```bash
# Créer la migration
npx supabase migration new fix_rls_goals

# Appliquer localement
npm run supabase:reset

# Tester
npm run supabase:test
```

**Critères d'acceptation**:
- ✅ User ne peut voir que les goals de son organisation
- ✅ User ne peut modifier que ses propres goals (ou si manager/admin)
- ✅ User ne peut supprimer que ses propres goals (ou si admin)
- ✅ Tous les tests RLS passent

---

#### 🔴 TÂCHE 1.2: Fix RLS Policy - Job Postings Table
**Agent**: Backend Security Specialist
**Priorité**: P0 - CRITIQUE
**Durée**: 30 minutes
**Fichier**: `supabase/migrations/20251117000001_fix_rls_recruitment.sql`

**Instructions**:
```sql
-- Similar pattern for job_postings, candidates, interviews
-- File: supabase/migrations/20251117000001_fix_rls_recruitment.sql

-- job_postings
DROP POLICY IF EXISTS "Authenticated users can view job_postings" ON job_postings;
CREATE POLICY "Users can view own organization job postings"
  ON job_postings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only HR/Admin can create job postings
CREATE POLICY "HR and Admin can create job postings"
  ON job_postings FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

-- candidates
CREATE POLICY "Users can view own organization candidates"
  ON candidates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- interviews
CREATE POLICY "Users can view own organization interviews"
  ON interviews FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM candidates
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
```

**Tests**:
- Vérifier isolation org sur toutes les tables recruitment
- Tester permissions role-based (HR peut créer jobs, employee non)

---

#### 🔴 TÂCHE 1.3: Fix RLS Policy - Performance Tables
**Agent**: Backend Security Specialist
**Priorité**: P0 - CRITIQUE
**Durée**: 30 minutes
**Fichier**: `supabase/migrations/20251117000002_fix_rls_performance.sql`

**Instructions**:
```sql
-- performance_reviews
CREATE POLICY "Users can view reviews in own organization"
  ON performance_reviews FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (
      reviewee_id = auth.uid()
      OR reviewer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hr', 'manager')
      )
    )
  );

-- peer_feedback
CREATE POLICY "Users can view feedback in own organization"
  ON peer_feedback FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**Tests**:
- User can only see own reviews (as reviewee or reviewer)
- Admin/HR/Manager can see all reviews in org

---

#### 🔴 TÂCHE 1.4: Fix RLS Policy - Profiles Table
**Agent**: Backend Security Specialist
**Priorité**: P0 - CRITIQUE
**Durée**: 30 minutes
**Fichier**: `supabase/migrations/20251117000003_fix_rls_profiles.sql`

**Instructions**:
```sql
-- profiles
CREATE POLICY "Users can view profiles in own organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());
```

**Tests**:
- User can see colleagues in same org
- User CANNOT see users from other orgs
- User can update own profile only

---

### JOUR 2 - Validation Schemas (3h)

#### 🔴 TÂCHE 2.1: Fix Performance Schema - Add Missing Fields
**Agent**: Backend Validation Specialist
**Priorité**: P0 - DATA LOSS
**Durée**: 30 minutes
**Fichier**: `src/lib/validations/performance.schemas.ts`

**Instructions**:
```typescript
// File: src/lib/validations/performance.schemas.ts

// Locate updatePerformanceReviewSchema (around line 45)
export const updatePerformanceReviewSchema = z.object({
  // ... existing fields ...

  // ADD THESE MISSING FIELDS:
  goals_next_period: z.string().max(2000).optional(),
  reviewer_comments: z.string().max(2000).optional(),

  // ... rest of schema
})

// Export type
export type UpdatePerformanceReviewInput = z.infer<typeof updatePerformanceReviewSchema>
```

**Vérifications**:
1. Ouvrir `src/components/performance/ReviewForm.tsx`
2. Vérifier lignes 43-44 référencent bien ces champs
3. Tester la soumission du formulaire
4. Vérifier que les données sont persistées en DB

**Tests**:
```bash
npm test -- performance.schemas.test.ts
```

---

#### 🔴 TÂCHE 2.2: Fix Interview Type Enum Mismatch
**Agent**: Backend Validation Specialist
**Priorité**: P0 - FUNCTIONAL BLOCKER
**Durée**: 1 heure
**Fichiers**:
- `src/lib/validations/recruitment.schemas.ts`
- `supabase/migrations/[find interview table creation]`

**Instructions**:

**Étape 1**: Identifier la contrainte DB actuelle
```bash
# Chercher la migration qui crée la table interviews
grep -r "CREATE TABLE interviews" supabase/migrations/
grep -r "interview_type" supabase/migrations/
```

**Étape 2**: Aligner le schéma Zod
```typescript
// File: src/lib/validations/recruitment.schemas.ts (line 41)

// BEFORE (WRONG):
interview_type: z.enum(['phone', 'video', 'onsite', 'technical', 'behavioral', 'panel'])

// AFTER (CORRECT - align with DB):
interview_type: z.enum(['phone_screen', 'technical', 'behavioral', 'cultural', 'final', 'other'])
```

**Étape 3**: Mettre à jour les composants UI
```bash
# Trouver les composants qui utilisent interview_type
grep -r "interview_type" src/components/recruitment/
```

**Étape 4**: Ajuster les options du select dans `interview-scheduler.tsx`
```typescript
// File: src/components/recruitment/interview-scheduler.tsx

const interviewTypeOptions = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'cultural', label: 'Cultural Fit' },
  { value: 'final', label: 'Final Interview' },
  { value: 'other', label: 'Other' },
]
```

**Tests**:
1. Créer un interview avec chaque type
2. Vérifier que la validation passe
3. Vérifier que les données sont bien insérées en DB

---

#### 🔴 TÂCHE 2.3: Fix Requirements/Responsibilities Array Type
**Agent**: Backend Validation Specialist
**Priorité**: P0 - DATA CORRUPTION
**Durée**: 1 heure
**Fichiers**:
- `src/lib/validations/recruitment.schemas.ts`
- `src/components/recruitment/job-posting-form.tsx`

**Instructions**:

**Étape 1**: Corriger le schéma Zod
```typescript
// File: src/lib/validations/recruitment.schemas.ts (lines 6-7)

// BEFORE (WRONG):
requirements: z.string().optional(),
responsibilities: z.string().optional(),

// AFTER (CORRECT):
requirements: z.array(z.string()).optional(),
responsibilities: z.array(z.string()).optional(),
```

**Étape 2**: Vérifier le composant UI utilise bien un array
```typescript
// File: src/components/recruitment/job-posting-form.tsx

// Should have something like:
const [requirements, setRequirements] = useState<string[]>([])
const [responsibilities, setResponsibilities] = useState<string[]>([])

// Or with React Hook Form:
const form = useForm<CreateJobPostingInput>({
  defaultValues: {
    requirements: [],
    responsibilities: [],
  }
})
```

**Étape 3**: Si le form utilise un textarea (string), convertir en array avant submit
```typescript
// Option A: Use tag input component (recommended)
import { TagsInput } from '@/components/ui/tags-input'

<TagsInput
  value={requirements}
  onChange={setRequirements}
  placeholder="Add requirement"
/>

// Option B: Convert textarea to array on submit
const onSubmit = (data) => {
  const processed = {
    ...data,
    requirements: data.requirements?.split('\n').filter(Boolean) || [],
    responsibilities: data.responsibilities?.split('\n').filter(Boolean) || [],
  }
  // submit processed
}
```

**Tests**:
1. Créer job posting avec requirements array
2. Vérifier DB a bien TEXT[] stocké
3. Récupérer et afficher requirements
4. Tester update

---

#### 🔴 TÂCHE 2.4: Add Goal Period 'semi-annual'
**Agent**: Backend Validation Specialist
**Priorité**: P0 - VALIDATION BLOCKER
**Durée**: 5 minutes
**Fichier**: `src/lib/validations/goals.schemas.ts`

**Instructions**:
```typescript
// File: src/lib/validations/goals.schemas.ts (line 7)

// BEFORE:
period: z.enum(['quarterly', 'annual', 'custom'])

// AFTER:
period: z.enum(['quarterly', 'semi-annual', 'annual', 'custom'])
```

**Test rapide**:
```bash
# Vérifier que le composant goal-form.tsx utilise bien cette option
grep -A5 "period" src/components/goals/goal-form.tsx

# Tester la création d'un goal avec period = 'semi-annual'
```

---

#### 🔴 TÂCHE 2.5: Add Missing Goal Schema Fields
**Agent**: Backend Validation Specialist
**Priorité**: P1 - INCOMPLETE SCHEMA
**Durée**: 30 minutes
**Fichier**: `src/lib/validations/goals.schemas.ts`

**Instructions**:
```typescript
// File: src/lib/validations/goals.schemas.ts

export const createGoalSchema = z.object({
  // ... existing fields ...

  // ADD THESE MISSING FIELDS:
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .default('medium')
    .optional(),

  alignment_level: z.enum(['individual', 'team', 'department', 'company'])
    .optional(),

  tags: z.array(z.string()).optional(),

  // UPDATE status enum to include 'on_hold':
  status: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled'])
    .default('draft'),

  // UPDATE visibility enum to include 'public':
  visibility: z.enum(['private', 'team', 'organization', 'public'])
    .default('team'),
})
```

**Mise à jour du formulaire** (optionnel - peut être fait plus tard):
```typescript
// File: src/components/goals/goal-form.tsx

// Add priority field:
<Select name="priority" defaultValue="medium">
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
  <option value="critical">Critical</option>
</Select>

// Add alignment_level field:
<Select name="alignment_level">
  <option value="individual">Individual</option>
  <option value="team">Team</option>
  <option value="department">Department</option>
  <option value="company">Company-wide</option>
</Select>

// Add tags input:
<TagsInput name="tags" placeholder="Add tag" />
```

---

### JOUR 3 - Dead Button & Auth Pattern (3h)

#### 🟡 TÂCHE 3.1: Wire JobPostingForm to Action
**Agent**: Frontend Developer
**Priorité**: P1 - FAKE FUNCTIONALITY
**Durée**: 1 heure
**Fichiers**:
- `src/components/recruitment/job-posting-form.tsx`
- `src/actions/recruitment/create-job-posting.ts`

**Instructions**:

**Étape 1**: Examiner l'action backend existante
```bash
# Vérifier que l'action existe et fonctionne
cat src/actions/recruitment/create-job-posting.ts
```

**Étape 2**: Remplacer le fake toast par l'appel réel
```typescript
// File: src/components/recruitment/job-posting-form.tsx (line 50)

// BEFORE (DEAD CODE):
// TODO: Implement job posting creation
toast({
  title: 'Success',
  description: 'Job posting created successfully',
})

// AFTER (REAL IMPLEMENTATION):
import { createJobPosting } from '@/src/actions/recruitment/create-job-posting'
import { useTransition } from 'react'

export function JobPostingForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(data: CreateJobPostingInput) {
    startTransition(async () => {
      const result = await createJobPosting(data)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Job posting created successfully',
        })
        // Close modal or redirect
        router.push('/dashboard/recruitment')
      } else {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Job Posting'}
      </Button>
    </form>
  )
}
```

**Tests end-to-end**:
1. Ouvrir formulaire création job posting
2. Remplir tous les champs requis
3. Soumettre
4. Vérifier que le job est créé en DB
5. Vérifier redirection ou fermeture modal
6. Vérifier que le nouveau job apparaît dans la liste

---

#### 🟡 TÂCHE 3.2: Standardize Auth Pattern
**Agent**: Backend Validation Specialist
**Priorité**: P1 - CONSISTENCY
**Durée**: 30 minutes
**Fichier**: `src/actions/goals/update-goal.ts`

**Instructions**:
```typescript
// File: src/actions/goals/update-goal.ts

// BEFORE (inconsistent):
export async function updateGoal(id: string, input: UpdateGoalInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED')
  }
  // ...
}

// AFTER (standardized with getAuthContext):
import { getAuthContext } from '@/src/lib/auth/server-auth'

export async function updateGoal(id: string, input: UpdateGoalInput) {
  try {
    // Use helper
    const { userId, organizationId } = await getAuthContext()

    // Validate input
    const validated = updateGoalSchema.parse(input)

    // Call service
    const updated = await goalsService.updateGoal(id, {
      ...validated,
      organization_id: organizationId,
    })

    return successResponse(updated)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
```

**Appliquer le même pattern à**:
- `delete-goal.ts`
- Toutes les actions qui utilisent encore le pattern direct

---

#### 🟡 TÂCHE 3.3: Add Rate Limiting to Update/Delete Goal
**Agent**: Backend Security Specialist
**Priorité**: P1 - SECURITY GAP
**Durée**: 1 heure
**Fichiers**:
- `src/actions/goals/update-goal.ts`
- `src/actions/goals/delete-goal.ts`

**Instructions**:
```typescript
// File: src/actions/goals/update-goal.ts

import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export const updateGoal = withActionRateLimit('update', async (
  id: string,
  input: UpdateGoalInput
): Promise<ActionResponse<Goal>> => {
  try {
    const { userId, organizationId } = await getAuthContext()
    const validated = updateGoalSchema.parse(input)

    const updated = await goalsService.updateGoal(id, {
      ...validated,
      organization_id: organizationId,
    })

    return successResponse(updated)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
})

// Same for delete-goal.ts with 'delete' rate limit
export const deleteGoal = withActionRateLimit('delete', async (
  id: string
): Promise<ActionResponse<void>> => {
  // implementation
})
```

**Vérifier le rate limit config**:
```typescript
// File: src/lib/middleware/action-rate-limit.ts

// Ensure limits are defined:
const RATE_LIMITS = {
  create: { max: 10, window: 60000 }, // 10 per minute
  update: { max: 20, window: 60000 }, // 20 per minute
  delete: { max: 5, window: 60000 },  // 5 per minute
  // ...
}
```

**Tests**:
1. Tenter 25 updates en 1 minute
2. Vérifier que la 21ème est bloquée (rate limit exceeded)
3. Attendre 1 minute
4. Vérifier que les updates fonctionnent à nouveau

---

### JOUR 4-5 - Cache Invalidation Phase 1 (8h)

#### 🔴 TÂCHE 4.1: Add Cache Invalidation to RecruitmentService
**Agent**: Backend Performance Engineer
**Priorité**: P0 - DATA FRESHNESS
**Durée**: 4 heures
**Fichier**: `src/lib/services/recruitment.service.ts`

**Instructions détaillées**:

**Étape 1**: Définir les cache keys
```typescript
// File: src/lib/utils/cache-keys.ts

export const CacheKeys = {
  // ... existing ...

  recruitment: {
    jobs: {
      all: (orgId: string) => `recruitment:jobs:org:${orgId}`,
      byId: (id: string) => `recruitment:jobs:id:${id}`,
      byStatus: (orgId: string, status: string) =>
        `recruitment:jobs:org:${orgId}:status:${status}`,
    },
    candidates: {
      all: (orgId: string) => `recruitment:candidates:org:${orgId}`,
      byJob: (jobId: string) => `recruitment:candidates:job:${jobId}`,
      byId: (id: string) => `recruitment:candidates:id:${id}`,
      byStatus: (jobId: string, status: string) =>
        `recruitment:candidates:job:${jobId}:status:${status}`,
    },
    interviews: {
      byCandidate: (candidateId: string) =>
        `recruitment:interviews:candidate:${candidateId}`,
      byJob: (jobId: string) => `recruitment:interviews:job:${jobId}`,
    },
  },
}
```

**Étape 2**: Ajouter cache invalidation aux mutations
```typescript
// File: src/lib/services/recruitment.service.ts

import { invalidateCache } from '@/src/lib/cache/redis-cache'
import { CacheKeys } from '@/src/lib/utils/cache-keys'

export class RecruitmentService {
  async createJobPosting(data: CreateJobPostingData): Promise<JobPosting> {
    const supabase = await this.getClient()

    // Insert logic...
    const inserted = await safeInsert(supabase, 'job_postings', jobData)

    // INVALIDATE CACHE
    await invalidateCache(CacheKeys.recruitment.jobs.all(data.organization_id))
    await invalidateCache(`recruitment:jobs:org:${data.organization_id}:*`) // wildcard

    return inserted
  }

  async updateJobPosting(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
    // Update logic...
    const updated = await safeUpdate(supabase, 'job_postings', id, data)

    // INVALIDATE CACHE
    const orgId = updated.organization_id
    await invalidateCache(CacheKeys.recruitment.jobs.byId(id))
    await invalidateCache(CacheKeys.recruitment.jobs.all(orgId))
    await invalidateCache(`recruitment:jobs:org:${orgId}:*`)

    return updated
  }

  async deleteJobPosting(id: string): Promise<void> {
    // Get org_id before delete
    const job = await this.getJobPostingById(id)

    // Delete logic...
    await safeSoftDelete(supabase, 'job_postings', id)

    // INVALIDATE CACHE
    await invalidateCache(CacheKeys.recruitment.jobs.byId(id))
    await invalidateCache(CacheKeys.recruitment.jobs.all(job.organization_id))
    await invalidateCache(`recruitment:jobs:org:${job.organization_id}:*`)
  }

  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    const inserted = await safeInsert(supabase, 'candidates', candidateData)

    // INVALIDATE CACHE
    const orgId = inserted.organization_id
    await invalidateCache(CacheKeys.recruitment.candidates.all(orgId))
    await invalidateCache(CacheKeys.recruitment.candidates.byJob(inserted.job_posting_id))
    await invalidateCache(`recruitment:candidates:org:${orgId}:*`)

    return inserted
  }

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const updated = await safeUpdate(supabase, 'candidates', id, data)

    // INVALIDATE CACHE
    await invalidateCache(CacheKeys.recruitment.candidates.byId(id))
    await invalidateCache(CacheKeys.recruitment.candidates.byJob(updated.job_posting_id))
    await invalidateCache(`recruitment:candidates:org:${updated.organization_id}:*`)

    return updated
  }

  async scheduleInterview(data: ScheduleInterviewData): Promise<Interview> {
    const inserted = await safeInsert(supabase, 'interviews', interviewData)

    // INVALIDATE CACHE
    await invalidateCache(CacheKeys.recruitment.interviews.byCandidate(inserted.candidate_id))
    await invalidateCache(CacheKeys.recruitment.interviews.byJob(data.job_posting_id))

    return inserted
  }
}
```

**Étape 3**: Tests de cache
```typescript
// File: __tests__/unit/services/recruitment.service.test.ts

describe('RecruitmentService Cache Invalidation', () => {
  it('should invalidate cache after creating job posting', async () => {
    const invalidateCacheSpy = jest.spyOn(cacheModule, 'invalidateCache')

    await recruitmentService.createJobPosting(mockJobData)

    expect(invalidateCacheSpy).toHaveBeenCalledWith(
      expect.stringContaining('recruitment:jobs:org:')
    )
  })

  it('should invalidate cache after updating candidate', async () => {
    const invalidateCacheSpy = jest.spyOn(cacheModule, 'invalidateCache')

    await recruitmentService.updateCandidate(candidateId, { status: 'interview' })

    expect(invalidateCacheSpy).toHaveBeenCalled()
  })
})
```

**Validation manuelle**:
1. Créer un job posting
2. Vérifier que la liste se rafraîchit immédiatement
3. Mettre à jour un candidat
4. Vérifier que le statut se met à jour sans refresh manuel

---

#### 🔴 TÂCHE 4.2: Add Cache Invalidation to PerformanceService
**Agent**: Backend Performance Engineer
**Priorité**: P0 - DATA FRESHNESS
**Durée**: 4 heures
**Fichier**: `src/lib/services/performance.service.ts`

**Instructions** (similaires à 4.1):

**Étape 1**: Définir cache keys
```typescript
// File: src/lib/utils/cache-keys.ts

export const CacheKeys = {
  // ... existing ...

  performance: {
    reviews: {
      all: (orgId: string) => `performance:reviews:org:${orgId}`,
      byId: (id: string) => `performance:reviews:id:${id}`,
      byEmployee: (employeeId: string) =>
        `performance:reviews:employee:${employeeId}`,
      byReviewer: (reviewerId: string) =>
        `performance:reviews:reviewer:${reviewerId}`,
    },
    feedback: {
      all: (orgId: string) => `performance:feedback:org:${orgId}`,
      byRecipient: (recipientId: string) =>
        `performance:feedback:recipient:${recipientId}`,
    },
  },
}
```

**Étape 2**: Ajouter invalidation
```typescript
// File: src/lib/services/performance.service.ts

export class PerformanceService {
  async createPerformanceReview(data: CreateReviewData): Promise<PerformanceReview> {
    const inserted = await safeInsert(supabase, 'performance_reviews', reviewData)

    // INVALIDATE
    await invalidateCache(CacheKeys.performance.reviews.all(data.organization_id))
    await invalidateCache(CacheKeys.performance.reviews.byEmployee(data.reviewee_id))
    await invalidateCache(CacheKeys.performance.reviews.byReviewer(data.reviewer_id))

    return inserted
  }

  async updatePerformanceReview(id: string, data: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const updated = await safeUpdate(supabase, 'performance_reviews', id, data)

    // INVALIDATE
    await invalidateCache(CacheKeys.performance.reviews.byId(id))
    await invalidateCache(CacheKeys.performance.reviews.byEmployee(updated.reviewee_id))
    await invalidateCache(`performance:reviews:org:${updated.organization_id}:*`)

    return updated
  }

  async createFeedback(data: CreateFeedbackData): Promise<PeerFeedback> {
    const inserted = await safeInsert(supabase, 'peer_feedback', feedbackData)

    // INVALIDATE
    await invalidateCache(CacheKeys.performance.feedback.all(data.organization_id))
    await invalidateCache(CacheKeys.performance.feedback.byRecipient(data.recipient_id))

    return inserted
  }
}
```

---

## PHASE 2: RATE LIMITING & CACHE (Semaine 2 - 14h)

### JOUR 1-2 - Rate Limiting Deployment (6h)

#### 🔴 TÂCHE 5.1: Add Rate Limiting to Recruitment Actions
**Agent**: Backend Security Specialist
**Priorité**: P0 - DDOS PROTECTION
**Durée**: 2 heures
**Fichiers**: `src/actions/recruitment/*.ts`

**Instructions**:

**Actions à protéger** (13 actions):
1. create-job-posting.ts
2. update-job-posting.ts
3. delete-job-posting.ts
4. create-candidate.ts
5. update-candidate-status.ts
6. delete-candidate.ts
7. schedule-interview.ts
8. update-interview-feedback.ts
9. upload-cv.ts

**Pattern à appliquer**:
```typescript
// File: src/actions/recruitment/update-job-posting.ts

import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export const updateJobPosting = withActionRateLimit('update', async (
  id: string,
  input: UpdateJobPostingInput
): Promise<ActionResponse<JobPosting>> => {
  try {
    const { userId, organizationId } = await getAuthContext()
    const validated = updateJobPostingSchema.parse(input)

    const updated = await recruitmentService.updateJobPosting(id, {
      ...validated,
      organization_id: organizationId,
    })

    return successResponse(updated)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
})
```

**Rate limit config recommandé**:
```typescript
// File: src/lib/middleware/action-rate-limit.ts

const RATE_LIMITS = {
  create: { max: 10, window: 60000 },    // 10/min for creates
  update: { max: 20, window: 60000 },    // 20/min for updates
  delete: { max: 5, window: 60000 },     // 5/min for deletes
  upload: { max: 5, window: 300000 },    // 5 uploads per 5 min
  interview: { max: 15, window: 60000 }, // 15 schedule/min
}
```

**Tests**:
- Tester chaque action rate limitée
- Vérifier rejection après dépassement seuil
- Vérifier reset après window

---

#### 🔴 TÂCHE 5.2: Add Rate Limiting to Performance Actions
**Agent**: Backend Security Specialist
**Priorité**: P0
**Durée**: 1 heure
**Fichiers**: `src/actions/performance/*.ts`

**Actions** (6):
1. create-review.ts → 'create'
2. update-review.ts → 'update'
3. delete-review.ts → 'delete'
4. create-feedback.ts → 'create'

(Même pattern que 5.1)

---

#### 🔴 TÂCHE 5.3: Add Rate Limiting to Notifications Actions
**Agent**: Backend Security Specialist
**Priorité**: P0
**Durée**: 2 heures
**Fichiers**: `src/actions/notifications/*.ts`

**Actions critiques** (11):
- markNotificationAsRead → 'read' limit (100/min)
- markAllNotificationsAsRead → 'bulk' limit (5/min)
- deleteNotification → 'delete' limit (10/min)
- archiveNotification → 'update' limit (20/min)

**Special rate limits for notifications**:
```typescript
const NOTIFICATION_LIMITS = {
  read: { max: 100, window: 60000 },     // High limit for reading
  bulk: { max: 5, window: 60000 },       // Low limit for bulk ops
  delete: { max: 10, window: 60000 },
}
```

---

#### 🔴 TÂCHE 5.4: Add Rate Limiting to Settings Actions
**Agent**: Backend Security Specialist
**Priorité**: P1
**Durée**: 1 heure
**Fichiers**: `src/actions/settings/*.ts`

**Actions** (13+):
- updateOrganizationSettings → 'org_update' (3/hour)
- updateAISettings → 'org_update' (3/hour)
- updateUserSettings → 'user_update' (20/min)

**Special org-level limits**:
```typescript
const ORG_LIMITS = {
  org_update: { max: 3, window: 3600000 }, // 3 per hour (sensitive)
  user_update: { max: 20, window: 60000 },
}
```

---

### JOUR 3-4 - Cache Invalidation Phase 2 (4h)

#### 🟡 TÂCHE 6.1: Add Cache Invalidation to NotificationsService
**Agent**: Backend Performance Engineer
**Priorité**: P1
**Durée**: 2 heures
**Fichier**: `src/lib/services/notifications.service.ts`

**Cache keys**:
```typescript
const CacheKeys = {
  notifications: {
    unread: (userId: string) => `notifications:unread:${userId}`,
    all: (userId: string) => `notifications:user:${userId}`,
    stats: (userId: string) => `notifications:stats:${userId}`,
  },
}
```

**Invalidation points**:
- createNotification → invalidate unread, all, stats
- markAsRead → invalidate unread, stats
- deleteNotification → invalidate all

---

#### 🟡 TÂCHE 6.2: Add Cache Invalidation to SettingsService
**Agent**: Backend Performance Engineer
**Priorité**: P1
**Durée**: 2 heures
**Fichier**: `src/lib/services/settings.service.ts`

**Cache keys**:
```typescript
const CacheKeys = {
  settings: {
    org: (orgId: string) => `settings:org:${orgId}`,
    user: (userId: string) => `settings:user:${userId}`,
    ai: (orgId: string) => `settings:ai:${orgId}`,
  },
}
```

---

### JOUR 5 - Missing Actions & Cleanup (4h)

#### 🟡 TÂCHE 7.1: Create deleteFeedback Action
**Agent**: Backend Validation Specialist
**Priorité**: P1
**Durée**: 1 heure
**Fichiers**:
- `src/actions/performance/delete-feedback.ts` (NEW)
- `src/lib/services/performance.service.ts`

**Instructions**:

**Étape 1**: Créer le fichier action
```typescript
// File: src/actions/performance/delete-feedback.ts (NEW)

'use server'

import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { performanceService } from '@/src/lib/services/performance.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { ActionResponse } from '@/src/types/modules.types'

export const deleteFeedback = withActionRateLimit('delete', async (
  feedbackId: string
): Promise<ActionResponse<void>> => {
  try {
    const { userId } = await getAuthContext()

    // Only allow deletion by:
    // 1. The person who submitted the feedback
    // 2. Admin/HR
    await performanceService.deleteFeedback(feedbackId, userId)

    return successResponse(undefined, 'Feedback deleted successfully')
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
})
```

**Étape 2**: Ajouter méthode au service
```typescript
// File: src/lib/services/performance.service.ts

async deleteFeedback(feedbackId: string, requesterId: string): Promise<void> {
  const supabase = await this.getClient()

  // Get feedback to verify ownership
  const { data: feedback, error: fetchError } = await supabase
    .from('peer_feedback')
    .select('*')
    .eq('id', feedbackId)
    .single()

  if (fetchError || !feedback) {
    throw new NotFoundError('Feedback not found')
  }

  // Check if requester is owner or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requesterId)
    .single()

  const isOwner = feedback.reviewer_id === requesterId
  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr'

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('You can only delete your own feedback')
  }

  // Soft delete
  await safeSoftDelete(supabase, 'peer_feedback', feedbackId)

  // Invalidate cache
  await invalidateCache(CacheKeys.performance.feedback.all(feedback.organization_id))
  await invalidateCache(CacheKeys.performance.feedback.byRecipient(feedback.recipient_id))
}
```

**Étape 3**: (Optionnel) Ajouter bouton UI
```typescript
// File: src/components/performance/FeedbackList.tsx

<Button
  variant="ghost"
  size="sm"
  onClick={() => handleDeleteFeedback(feedback.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>

async function handleDeleteFeedback(id: string) {
  const result = await deleteFeedback(id)
  if (result.success) {
    toast.success('Feedback deleted')
    // refresh list
  } else {
    toast.error(result.error.message)
  }
}
```

---

#### 🟡 TÂCHE 7.2-7.4: Minor Schema Fixes
**Agent**: Backend Validation Specialist
**Priorité**: P1
**Durée**: 1 heure total

**7.2**: Add 'temporary' to employment_type enum (15min)
**7.3**: Make candidate source required (15min)
**7.4**: Update RecruitmentService interfaces (30min)

---

#### 🟢 TÂCHE 7.5: Code Review & Testing
**Agent**: QA & Integration Tester
**Priorité**: P2
**Durée**: 2 heures

**Checklist**:
- [ ] Tous les fixes P0 appliqués
- [ ] Rate limiting fonctionne
- [ ] Cache invalidation testée
- [ ] RLS policies sécurisées
- [ ] Schémas Zod cohérents
- [ ] Actions wirées aux components
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent

**Tests manuels**:
1. Créer goal avec 'semi-annual' period ✅
2. Créer job posting via UI ✅
3. Schedule interview avec 'phone_screen' type ✅
4. Vérifier isolation multi-org (2 orgs test) ✅
5. Tester rate limiting (dépassement seuil) ✅
6. Vérifier cache refresh après mutation ✅

---

## PHASE 3: POLISH & OPTIMIZATION (Semaine 3 - 8-10h)

### 🟢 TÂCHE 8.1: API Routes for KPIs
**Agent**: Backend Developer
**Priorité**: P2
**Durée**: 4 heures

*Détails omis pour concision - pattern REST similaire aux autres modules*

---

### 🟢 TÂCHE 8.2: Type Safety Cleanup
**Agent**: Frontend Developer
**Priorité**: P2
**Durée**: 1 heure

**Trouver et remplacer `as any`**:
```bash
grep -r "as any" src/components/
```

---

### 🟢 TÂCHE 8.3: Standardize Error Handling
**Agent**: Backend Developer
**Priorité**: P2
**Durée**: 2 heures

**Pattern standard**:
```typescript
try {
  // operation
  return successResponse(result)
} catch (error) {
  const appError = handleServiceError(error)
  return errorResponse(appError.message, appError.code)
}
```

---

### 🟢 TÂCHE 8.4: Final Integration Testing
**Agent**: QA & Integration Tester
**Priorité**: P2
**Durée**: 2 heures

**Test suite complet**:
- Flows CRUD end-to-end pour chaque module
- Performance testing (response times)
- Security testing (RLS, rate limiting)
- Cache invalidation verification
- Browser testing (Chrome, Firefox, Safari)

---

## COORDINATION & REPORTING

### Daily Standup (15min)
**Tous les agents** - Chaque matin

**Format**:
1. Hier: Ce qui a été complété
2. Aujourd'hui: Tâches en cours
3. Blockers: Problèmes rencontrés

**Example**:
```
Agent 2 (Backend Validation):
- Hier: ✅ Complété TÂCHE 2.1, 2.2
- Aujourd'hui: 🚧 TÂCHE 2.3 (requirements array fix)
- Blockers: ❌ Besoin clarification sur UI component pour requirements
```

---

### Progress Tracking

**Après chaque tâche complétée**, l'agent doit:

1. **Update le fichier de suivi**:
```bash
# File: PROGRESS_TRACKING.md
## Semaine 1 - Jour 1
- [x] TÂCHE 1.1 - Fix RLS Goals (30min) ✅ DONE
- [x] TÂCHE 1.2 - Fix RLS Recruitment (30min) ✅ DONE
- [x] TÂCHE 1.3 - Fix RLS Performance (30min) ✅ DONE
- [x] TÂCHE 1.4 - Fix RLS Profiles (30min) ✅ DONE
```

2. **Créer un commit**:
```bash
git add .
git commit -m "fix(rls): secure goals table policies - organization isolation

- Drop permissive policies allowing cross-org access
- Add organization_id filter to all CRUD policies
- Implement role-based UPDATE/DELETE restrictions
- Add tests for multi-tenant isolation

Resolves: AUDIT-P0-1
Task: TÂCHE 1.1"
```

3. **Push changes**:
```bash
git push origin hotfix/security-rls
```

4. **Notifier le chef de projet**:
```
✅ TÂCHE 1.1 COMPLETED
Agent: Backend Security Specialist
Duration: 28 minutes (under estimate)
Status: PASSED ALL TESTS
Next: Starting TÂCHE 1.2
```

---

### Quality Gates

**Avant de marquer une tâche comme complétée**, vérifier:

✅ **Code Quality**:
- [ ] TypeScript compile sans erreur
- [ ] ESLint passe (no warnings)
- [ ] Prettier appliqué

✅ **Tests**:
- [ ] Unit tests passent
- [ ] Integration tests passent (si applicable)
- [ ] Manual testing réussi

✅ **Documentation**:
- [ ] Code commenté (si complexe)
- [ ] Types exportés (si nouvelles interfaces)
- [ ] CHANGELOG.md mis à jour

✅ **Security**:
- [ ] Pas de secrets hardcodés
- [ ] RLS policies vérifiées (si DB change)
- [ ] Rate limiting testé (si action exposée)

---

## RÉSUMÉ DES AGENTS & RESPONSABILITÉS

| Agent | Tâches Assignées | Durée Totale | Priorité |
|-------|-----------------|--------------|----------|
| **Backend Security Specialist** | 1.1-1.4, 3.3, 5.1-5.4 | 10h | 🔴 P0 |
| **Backend Validation Specialist** | 2.1-2.5, 3.2, 7.1-7.4 | 8h | 🔴 P0 |
| **Backend Performance Engineer** | 4.1-4.2, 6.1-6.2 | 12h | 🔴 P0 |
| **Frontend Developer** | 3.1, 8.2 | 4h | 🟡 P1 |
| **QA & Integration Tester** | 7.5, 8.4 | 4h | 🟢 P2 |

---

## PLAN DE DÉPLOIEMENT

### Hotfix Branch Strategy

```bash
# Semaine 1 - Critiques
git checkout -b hotfix/security-rls
# Deploy fixes 1.1-1.4
git push origin hotfix/security-rls
# Create PR → Review → Merge → Deploy ASAP

# Semaine 1 - Validation
git checkout -b hotfix/validation-schemas
# Deploy fixes 2.1-2.5
# Create PR → Review → Merge

# Semaine 2 - Rate Limiting & Cache
git checkout -b feature/rate-limiting-cache
# Deploy fixes 4.1-6.2
# Create PR → Review → Merge

# Semaine 3 - Polish
git checkout -b feature/polish-optimizations
# Deploy tasks 8.1-8.4
# Create PR → Review → Merge
```

### Deployment Checklist

**Avant chaque déploiement**:
- [ ] Tests passent (unit + integration)
- [ ] Type-check réussi: `npm run type-check`
- [ ] Build réussi: `npm run build`
- [ ] Migrations testées en local: `npm run supabase:reset`
- [ ] Code review approuvé (2 reviewers)
- [ ] CHANGELOG.md mis à jour

**Après déploiement**:
- [ ] Smoke tests en staging
- [ ] Monitoring actif (logs, errors)
- [ ] Performance metrics baseline
- [ ] Rollback plan prêt

---

## CONTACTS & ESCALATION

**Blockers critiques** → Escalate immédiatement au chef de projet

**Questions techniques** → Ping agent responsable dans Slack

**Changements de scope** → Discussion équipe + validation chef de projet

---

**Document généré le**: 17 Novembre 2025
**Version**: 1.0
**Statut**: ✅ PRÊT POUR EXÉCUTION

**Prochaine étape**: Lancer les agents sur leurs tâches respectives

---

## COMMANDES DE LANCEMENT DES AGENTS

Pour démarrer l'exécution, utiliser ces commandes:

```bash
# Agent 1 - Backend Security Specialist
claude-code --agent=backend-security --task=RLS-FIX --file=PLAN_IMPLEMENTATION_AGENTS.md --section="TÂCHE 1.1-1.4"

# Agent 2 - Backend Validation Specialist
claude-code --agent=backend-validation --task=SCHEMA-FIX --file=PLAN_IMPLEMENTATION_AGENTS.md --section="TÂCHE 2.1-2.5"

# Agent 3 - Backend Performance Engineer
claude-code --agent=backend-performance --task=CACHE-INVALIDATION --file=PLAN_IMPLEMENTATION_AGENTS.md --section="TÂCHE 4.1-4.2"

# Agent 4 - Frontend Developer
claude-code --agent=frontend-dev --task=UI-FIXES --file=PLAN_IMPLEMENTATION_AGENTS.md --section="TÂCHE 3.1"

# Agent 5 - QA Tester
claude-code --agent=qa-tester --task=INTEGRATION-TESTS --file=PLAN_IMPLEMENTATION_AGENTS.md --section="TÂCHE 7.5"
```

**Note**: Les agents doivent être lancés dans l'ordre des priorités (P0 d'abord)
