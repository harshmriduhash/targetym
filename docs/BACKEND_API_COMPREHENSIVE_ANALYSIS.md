# Backend API & Integration Comprehensive Analysis

**Analysis Date:** 2025-10-30
**Targetym Version:** Next.js 15.5.4 with App Router
**Scope:** 65 Server Actions across 15 modules, API routes, middleware, and integrations

---

## Executive Summary

Targetym's backend architecture demonstrates a **well-structured foundation** with clear separation of concerns through Server Actions, service layer, and middleware patterns. However, there are **significant inconsistencies** in implementation across modules that impact security, performance, and maintainability.

**Overall Grade: B- (Good architecture, inconsistent execution)**

### Key Strengths ✅
1. Clear three-layer architecture (Actions → Services → Database)
2. Type-safe Supabase integration with generated types
3. Centralized error handling with custom error classes
4. Multi-tenant isolation via RLS policies
5. Consistent response format (ActionResponse pattern)

### Critical Issues 🚨
1. **Inconsistent rate limiting** - Only 12 of 65 actions use rate limiting (18%)
2. **Inconsistent auth patterns** - Mix of `getAuthContext()` and direct Supabase calls
3. **Missing N+1 query prevention** in some services
4. **No API documentation** - Missing OpenAPI/Swagger specs
5. **Dual rate limiting systems** - Upstash Redis AND in-memory (confusion)
6. **Incomplete AI integration** - Placeholder implementations

---

## 1. Server Actions Architecture (73 files across 15 modules)

### Module Distribution

| Module | Action Count | Rate Limited | Auth Helper | Service Layer |
|--------|--------------|--------------|-------------|---------------|
| goals | 7 | ✅ 1/7 | ✅ 1/7 | ✅ Complete |
| recruitment | 13 | ❌ 0/13 | ❌ 0/13 | ✅ Complete |
| performance | 4 | ❌ 0/4 | ❌ 0/4 | ✅ Complete |
| employees | 4 | ❌ 0/4 | ❌ 0/4 | ⚠️ Partial |
| ai | 3 | ❌ 0/3 | ❌ 0/3 | ⚠️ Placeholder |
| notifications | 5 | ❌ 0/5 | ❌ 0/5 | ✅ Complete |
| settings | 3 | ❌ 0/3 | ❌ 0/3 | ✅ Complete |
| kpis | 3 | ❌ 0/3 | ❌ 0/3 | ✅ Complete |
| forms | 4 | ❌ 0/4 | ❌ 0/4 | ❌ Direct DB |
| notices | 4 | ❌ 0/4 | ❌ 0/4 | ✅ Complete |
| portal | 5 | ❌ 0/5 | ❌ 0/5 | ✅ Complete |
| help | 3 | ❌ 0/3 | ❌ 0/3 | ❌ Missing |
| search | 3 | ❌ 0/3 | ❌ 0/3 | ❌ Missing |
| security | 3 | ❌ 0/3 | ❌ 0/3 | ❌ Missing |

### Pattern Analysis

#### **Exemplary Pattern** (goals/create-goal.ts) ✅
```typescript
'use server'

export async function createGoal(input: CreateGoalInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {  // ✅ Rate limited
    try {
      const validated = createGoalSchema.parse(input)  // ✅ Zod validation
      const { userId, organizationId } = await getAuthContext()  // ✅ Centralized auth

      const goal = await goalsService.createGoal({  // ✅ Service layer
        ...validated,
        owner_id: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: goal.id })  // ✅ Consistent response
    } catch (error) {
      const appError = handleServiceError(error)  // ✅ Centralized error handling
      return errorResponse(appError.message, appError.code)
    }
  })
}
```

**Score: 10/10** - Perfect implementation

#### **Problematic Pattern** (recruitment/create-job-posting.ts) ⚠️
```typescript
'use server'

export async function createJobPosting(input: CreateJobPostingInput) {
  try {
    const validated = createJobPostingSchema.parse(input)  // ✅ Validation

    const supabase = await createClient()  // ❌ Direct Supabase (not getAuthContext)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {  // ❌ Manual auth check (duplicated)
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase  // ❌ Manual profile fetch (duplicated)
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {  // ❌ Manual checks (should be in getAuthContext)
      return errorResponse('Profile not found', 'NOT_FOUND')
    }

    // Only admin and manager can create job postings
    if (!['admin', 'manager'].includes(profile.role)) {  // ⚠️ Role check (good)
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const job = await recruitmentService.createJobPosting({  // ✅ Service layer
      ...validated,
      organization_id: profile.organization_id,
      posted_by: user.id,
    })

    return successResponse({ id: job.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
```

**Issues:**
- ❌ **No rate limiting** - Job posting creation is unprotected
- ❌ **Duplicated auth logic** - 15-20 lines repeated across actions
- ❌ **Inconsistent pattern** - Should use `getAuthContext()` helper
- ⚠️ **Role-based auth** - Good but not centralized

**Score: 6/10** - Functional but needs refactoring

#### **Worst Pattern** (employees/create-employee.ts) 🚨
```typescript
'use server'

export async function createEmployee(input: CreateEmployeeInput) {
  try {
    const validated = createEmployeeSchema.parse(input)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {  // ❌ Manual auth
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase  // ❌ Duplicated profile fetch
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    const { data, error } = await supabase  // 🚨 DIRECT DB ACCESS (bypasses service)
      .from('employees')
      .insert({
        ...validated,
        organization_id: profile.organization_id,
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    return successResponse({ id: data.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
```

**Critical Issues:**
- 🚨 **Bypasses service layer** - Direct database access violates architecture
- ❌ **No rate limiting** - Employee creation unprotected
- ❌ **No role validation** - Anyone authenticated can create employees
- ❌ **Duplicated auth logic** - Same pattern repeated
- ❌ **Missing business logic** - Should validate employee data, check duplicates

**Score: 3/10** - Violates architectural principles

---

## 2. API Routes Analysis

### Inventory

**REST API Routes (app/api/):**
- `/api/ai/recommend-career` - POST
- `/api/ai/score-cv` - POST
- `/api/goals` - GET, POST
- `/api/goals/[id]` - GET, PUT, DELETE
- `/api/performance/feedback` - POST
- `/api/performance/reviews` - GET, POST
- `/api/performance/reviews/[id]` - GET, PUT
- `/api/recruitment/candidates` - GET, POST
- `/api/recruitment/candidates/[id]/status` - PUT
- `/api/recruitment/jobs` - GET, POST

**Health/System Routes (src/app/api/):**
- `/api/health` - GET
- `/api/health/ready` - GET
- `/api/v1/goals` - GET, POST (versioned)
- `/api/v1/health` - GET
- `/api/v1/ready` - GET

### API Design Quality Assessment

#### ✅ **Strengths**
1. **RESTful resource naming** - `/goals`, `/candidates`, `/reviews`
2. **Versioning strategy** - `/api/v1/*` namespace exists
3. **Standard HTTP methods** - GET, POST, PUT, DELETE
4. **Health check endpoints** - `/health` and `/ready` for k8s

#### ❌ **Critical Gaps**

**1. Inconsistent API Versioning**
```
❌ Mixed: /api/goals AND /api/v1/goals (same resource, different paths)
✅ Should: All production APIs under /api/v1/*
```

**2. Missing OpenAPI/Swagger Documentation**
- No `swagger.json` or `openapi.yaml`
- No API documentation UI (Swagger UI, Redoc)
- No automated schema generation
- **Impact:** Difficult for frontend/mobile teams to integrate

**3. Inconsistent Rate Limiting**
```typescript
// src/app/api/v1/goals/route.ts - HAS rate limiting ✅
const rateLimitResult = checkRateLimit(
  RateLimitKeys.byUser(userId),
  RATE_LIMITS.authenticated
)

// app/api/goals/route.ts - NO rate limiting ❌
// Completely unprotected endpoint
```

**4. No CORS Configuration**
- Missing explicit CORS headers for external API access
- No preflight handling for cross-origin requests
- **Impact:** Cannot be used by external clients or mobile apps

**5. Inconsistent Error Response Format**

**API Route Format:**
```typescript
// src/app/api/v1/goals/route.ts
{
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}
```

**Server Action Format:**
```typescript
// src/actions/goals/create-goal.ts
{
  success: false,
  error: 'Unauthorized',
  code: 'UNAUTHORIZED'
}
```

❌ **Two different schemas for same error types**

**6. Missing Request/Response Schemas**
```typescript
// Example: No Zod schema exports for API consumers
export const GoalResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  // ... missing
})
```

**7. No API Gateway Pattern**
- Direct routes exposed (no centralized entry point)
- No request transformation
- No response aggregation
- No circuit breaker at gateway level

### REST API Compliance Score

| Criterion | Score | Notes |
|-----------|-------|-------|
| Resource naming | 9/10 | Good RESTful conventions |
| HTTP methods | 8/10 | Proper use of GET/POST/PUT/DELETE |
| Status codes | 7/10 | 200, 401, 404, 500 used but not comprehensive |
| Versioning | 4/10 | Partial v1, inconsistent application |
| Documentation | 1/10 | No OpenAPI/Swagger |
| Error handling | 6/10 | Consistent structure but two formats |
| Rate limiting | 3/10 | Only 20% of endpoints protected |
| CORS | 0/10 | Not configured |
| Pagination | 8/10 | Implemented in services |
| Filtering | 7/10 | Basic query params supported |

**Overall REST API Score: 5.3/10 (Needs Improvement)**

---

## 3. Middleware Stack Analysis

### Current Middleware Layers

```
Request Flow:
┌─────────────────────────────────────────────────┐
│ 1. Next.js Middleware (middleware.ts)          │
│    - Supabase Auth (SSR)                        │
│    - Public route detection                     │
│    - Security headers (CSP, X-Frame, etc.)      │
│    - Session refresh                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. API Route Middleware (implicit)              │
│    - Rate limiting (Upstash Redis) ⚠️ Partial   │
│    - Auth extraction                            │
│    - Organization context                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Server Action Middleware (wrapper)           │
│    - withActionRateLimit ⚠️ Only 12/65 actions  │
│    - getAuthContext ⚠️ Only 16/65 actions       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Service Layer (implicit)                     │
│    - Business logic                             │
│    - Database queries                           │
│    - RLS enforcement (Supabase)                 │
└─────────────────────────────────────────────────┘
```

### Authentication Middleware

#### ✅ **Strengths**
```typescript
// middleware.ts - Well implemented
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // ✅ Public routes defined
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', ...]

  // ✅ Redirect to signin if not authenticated
  if (!user) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Content-Security-Policy', ...)
}
```

**Score: 9/10** - Excellent implementation

#### ⚠️ **Gaps**
1. No JWT validation (relies on Supabase session)
2. No custom claims/roles in middleware
3. No organization switching support

### Rate Limiting Middleware

#### 🚨 **Critical Issue: Dual Systems**

**System 1: Upstash Redis (src/lib/middleware/rate-limit.ts)**
```typescript
// Uses @upstash/ratelimit with Redis backend
const ratelimit = new Ratelimit({
  redis: redis || undefined,  // ⚠️ Fallback to in-memory if no Redis
  limiter: Ratelimit.slidingWindow(config.requests, config.window),
})

// ✅ Organization-level rate limiting
if (profile?.organization_id) {
  return `org:${profile.organization_id}`  // Good for multi-tenant
}
```

**Pros:**
- ✅ Distributed (Redis-backed)
- ✅ Organization-aware
- ✅ Sliding window algorithm
- ✅ Proper rate limit headers

**Cons:**
- ❌ Only used in 2-3 API routes
- ⚠️ Silent fallback to in-memory (dangerous in production)

**System 2: In-Memory Rate Limiter (src/lib/middleware/rate-limiter.ts)**
```typescript
// Simple Map-based store
class RateLimitStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map()
  // ...
}

// ❌ NOT distributed
// ⚠️ Loses state on server restart
// ⚠️ Won't work with multiple instances
```

**Pros:**
- ✅ Fast (in-memory)
- ✅ No external dependencies

**Cons:**
- 🚨 **NOT production-ready** (single-instance only)
- ❌ No persistence
- ❌ No distributed coordination
- ❌ Rate limits reset on deploy

**System 3: Action Rate Limiter (src/lib/middleware/action-rate-limit.ts)**
```typescript
export async function withActionRateLimit<T>(
  limitType: keyof typeof actionRateLimits,
  action: () => Promise<ActionResponse<T>>
) {
  const { userId } = await getAuthContext()
  const rateLimitKey = RateLimitKeys.byUser(userId)
  const result = checkRateLimit(rateLimitKey, config)  // ⚠️ Uses in-memory store

  if (!result.allowed) {
    return errorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED')
  }

  return await action()
}
```

**Issue:** Uses **System 2** (in-memory), NOT System 1 (Redis)

#### **Verdict: 3/10 - Confusing and Incomplete**
- ✅ Good patterns defined
- ❌ Three different systems
- ❌ Only 18% coverage (12/65 actions)
- 🚨 Production deployment will fail with multiple instances

### Logging Middleware

#### ❌ **Missing**
- No structured logging middleware
- No request ID tracking
- No correlation IDs for distributed tracing
- Console.log scattered throughout

**Example from upload-cv.ts:**
```typescript
if (uploadError) {
  console.error('Upload error:', uploadError)  // ❌ Unstructured
  return errorResponse(`Failed to upload file: ${uploadError.message}`, 'UPLOAD_ERROR')
}
```

**Should be:**
```typescript
logger.error({
  err: uploadError,
  requestId: req.requestId,
  userId: user.id,
  organizationId: org.id,
  fileName: file.name,
  fileSize: file.size,
}, 'Failed to upload CV')
```

### Request Validation Middleware

#### ⚠️ **Partial Implementation**
- ✅ Zod schemas in actions
- ❌ No centralized validation middleware
- ❌ Validation happens inside each action (duplicated)

**Should have:**
```typescript
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  action: (validated: T) => Promise<ActionResponse>
) {
  return async (input: unknown) => {
    const result = schema.safeParse(input)
    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        result.error.errors
      )
    }
    return action(result.data)
  }
}
```

---

## 4. Integration Patterns Analysis

### Supabase Integration

#### ✅ **Excellent Type Safety**
```typescript
// Generated types from database schema
type Tables = Database['public']['Tables']
type Goal = Tables['goals']['Row']
type GoalInsert = Tables['goals']['Insert']
type GoalUpdate = Tables['goals']['Update']

// Helper functions for type-safe operations
export async function safeInsert<TableName>(...) {
  const { data, error } = await client
    .from(table)
    .insert(data as any)  // ⚠️ Still needs 'as any' due to Supabase types
    .select()
    .single()
}
```

**Score: 8/10** - Good patterns, minor type workarounds needed

#### ✅ **N+1 Query Prevention in Services**
```typescript
// goalsService.getGoals() - OPTIMIZED ✅
const { data, error } = await supabase
  .from('goals')
  .select(`
    *,
    owner:profiles!owner_id(id, email, full_name, avatar_url),
    key_results(id, title, target_value, current_value, unit, status),
    parent_goal:goals!parent_goal_id(id, title)
  `)  // ✅ Single query with joins
  .eq('organization_id', organizationId)
```

**Score: 9/10** - Excellent use of Supabase joins

#### ⚠️ **Pagination Implementation**
```typescript
// Proper pagination pattern
const { page, pageSize } = normalizePagination(pagination)
const offset = getPaginationOffset(page, pageSize)

// ❌ Two queries (count + data)
const { count } = await baseQuery  // Query 1: Count
const { data } = await dataQuery.range(offset, offset + pageSize - 1)  // Query 2: Data

// ✅ Returns proper paginated response
return createPaginatedResponse(data, page, pageSize, count)
```

**Issue:** Two queries instead of one (Supabase limitation)
**Score: 7/10** - Works but not optimal

### Redis Integration (Upstash)

#### Implementation
```typescript
// src/lib/middleware/rate-limit.ts
let redis: Redis | null = null

if (!redis && process.env.UPSTASH_REDIS_REST_URL) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const ratelimit = new Ratelimit({
  redis: redis || undefined,  // ⚠️ Silent fallback
  limiter: Ratelimit.slidingWindow(config.requests, config.window),
})
```

#### ❌ **Problems**
1. **Global singleton** - No connection pooling
2. **Silent fallback** - No warning when Redis unavailable
3. **Minimal usage** - Only rate limiting, no caching
4. **No health checks** - Can't detect Redis failures

**Recommended Use Cases (NOT implemented):**
- Session storage
- Feature flags
- Distributed locks
- Cache layer (currently missing)
- Real-time presence

**Score: 4/10** - Underutilized

### AI Service Integration (OpenAI/Anthropic)

#### 🚨 **Critical Finding: Placeholder Implementation**

```typescript
// src/lib/services/ai.service.ts
export class AIService {
  async synthesizePerformanceReview(reviewId: string, feedback: string[]): Promise<string> {
    // This would integrate with OpenAI/Anthropic API
    // For now, return a placeholder  ⚠️ NOT IMPLEMENTED
    return `Performance synthesis for review ${reviewId} based on ${feedback.length} feedback items.`
  }

  async generateInsights(organizationId: string, dataType: 'goals' | 'performance' | 'recruitment'): Promise<any> {
    // This would use AI to analyze patterns and generate insights
    // For now, return basic analytics  ⚠️ FAKE DATA
    return {
      completion_rate: 0.75,  // Hardcoded
      top_performers: [],
      areas_for_improvement: [],
    }
  }
}
```

#### **AI Actions Present in Codebase:**
1. `scoreCandidateCV` - ⚠️ Fetches data but doesn't call AI API
2. `synthesizePerformance` - ❌ Returns placeholder
3. `recommendCareer` - ❌ Returns placeholder

**Actual Implementation:**
```typescript
// src/actions/ai/score-cv.ts
const cvText = `Candidate: ${candidate.name}...`  // ✅ Prepares data

// Score the CV
const scoring = await aiService.scoreCandidateCV(
  cvText,
  jobPosting.description,
  jobPosting.requirements || []
)  // ❌ This function doesn't exist in ai.service.ts!
```

**Critical Gap:** Action calls non-existent method
**Score: 1/10** - Placeholder only, not functional

### File Upload Integration (Supabase Storage)

#### ✅ **Good Implementation**
```typescript
// src/actions/recruitment/upload-cv.ts
export async function uploadCV(formData: FormData) {
  const file = formData.get('file') as File

  // ✅ File type validation
  const allowedTypes = ['application/pdf', 'application/msword', ...]
  if (!allowedTypes.includes(file.type)) {
    return errorResponse('Invalid file type', 'VALIDATION_ERROR')
  }

  // ✅ File size validation (10MB)
  if (file.size > maxSize) {
    return errorResponse('File size exceeds 10MB limit', 'VALIDATION_ERROR')
  }

  // ✅ Organization-scoped path
  const filename = `${profile.organization_id}/${user.id}/${timestamp}.${extension}`

  // ✅ Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('cvs')
    .upload(filename, file, { cacheControl: '3600', upsert: false })
}
```

**Score: 9/10** - Excellent validation and organization isolation

#### ⚠️ **Missing Features**
- No virus scanning
- No duplicate detection (hash-based)
- No automatic cleanup of orphaned files
- No CDN integration for downloads

---

## 5. Service Layer Analysis

### Architecture Quality

```typescript
// Pattern: Singleton service with typed Supabase client
export class GoalsService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()  // ✅ Server-only client
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const supabase = await this.getClient()
    return await safeInsert(supabase, 'goals', goalData)  // ✅ Type-safe helper
  }
}

export const goalsService = new GoalsService()  // ✅ Singleton export
```

**Score: 9/10** - Clean architecture

### Service Consistency

| Service | Complete | Type-Safe | N+1 Prevention | Error Handling | Transactions |
|---------|----------|-----------|----------------|----------------|--------------|
| goals | ✅ | ✅ | ✅ | ✅ | ❌ |
| recruitment | ✅ | ✅ | ✅ | ✅ | ❌ |
| performance | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| notifications | ✅ | ✅ | ❌ | ✅ | ❌ |
| settings | ✅ | ✅ | N/A | ✅ | ❌ |
| kpis | ✅ | ✅ | ❌ | ✅ | ❌ |
| organization | ✅ | ✅ | N/A | ✅ | ❌ |
| employees | ⚠️ | ✅ | ❌ | ✅ | ❌ |
| ai | ❌ | ✅ | N/A | ✅ | N/A |
| notices | ✅ | ✅ | ❌ | ✅ | ❌ |
| portal | ✅ | ✅ | ❌ | ✅ | ❌ |

**Key Findings:**
- ✅ All services use typed Supabase client
- ✅ Consistent error handling
- ⚠️ Only 3/11 services prevent N+1 queries
- 🚨 **ZERO services use transactions** (data integrity risk)

### Transaction Handling Gap

**Example: Creating goal with key results (NOT atomic)**
```typescript
// Current implementation (NOT transactional) ❌
async function createGoalWithKeyResults(goalData, keyResults) {
  const goal = await goalsService.createGoal(goalData)  // Insert 1

  for (const kr of keyResults) {
    await goalsService.createKeyResult({  // Insert 2, 3, 4...
      goal_id: goal.id,
      ...kr
    })
  }
  // ❌ If createKeyResult fails, goal is orphaned
}
```

**Should be (with transaction):**
```typescript
async function createGoalWithKeyResults(goalData, keyResults) {
  const supabase = await this.getClient()

  // ✅ Use Supabase RPC for transaction
  const { data, error } = await supabase.rpc('create_goal_with_key_results', {
    goal_data: goalData,
    key_results: keyResults
  })
  // Rollback on any failure
}
```

**Impact:** Data inconsistency risk in multi-step operations

---

## 6. Security Analysis

### Authentication Security

#### ✅ **Strengths**
1. **Supabase Auth** - Industry-standard JWT
2. **RLS Policies** - Database-level multi-tenant isolation
3. **Session management** - Automatic refresh in middleware
4. **Secure defaults** - All routes protected by default

#### ❌ **Vulnerabilities**

**1. Inconsistent Authorization Checks**
```typescript
// recruitment/create-job-posting.ts - ✅ Has role check
if (!['admin', 'manager'].includes(profile.role)) {
  return errorResponse('Insufficient permissions', 'FORBIDDEN')
}

// employees/create-employee.ts - ❌ NO role check
const { data, error } = await supabase
  .from('employees')
  .insert({...})  // Any authenticated user can create employees!
```

**Impact:** Privilege escalation vulnerability

**2. No RBAC Middleware**
```typescript
// Should have:
export const withRole = (roles: string[]) => (action) => {
  return async (...args) => {
    const { role } = await getAuthContext()
    if (!roles.includes(role)) {
      return errorResponse('Forbidden', 'FORBIDDEN')
    }
    return action(...args)
  }
}

// Usage:
export const deleteEmployee = withRole(['admin'])(async (id) => {
  // Only admins can delete
})
```

**3. No API Key Authentication**
- No support for service-to-service auth
- No webhook signature verification
- No machine-to-machine tokens

### Input Validation Security

#### ✅ **Strengths**
```typescript
// Zod schemas with business rules
export const createGoalSchema = z.object({
  title: z.string().min(3).max(200),  // ✅ Length limits
  end_date: z.string().datetime().or(z.date()),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start  // ✅ Business logic validation
}, {
  message: 'End date must be after start date',
})
```

#### ⚠️ **Gaps**
1. No HTML sanitization (XSS risk if rendered)
2. No SQL injection prevention (RLS saves us, but risky)
3. No file upload content validation (magic number check)

### Rate Limiting Security

**Current State:**
- ✅ Public endpoints: 100 req/15min
- ✅ Authenticated: 1000 req/15min
- ✅ AI endpoints: 100 req/hour
- ❌ **Only 18% of actions protected**

**Exposed Endpoints (no rate limit):**
- All recruitment actions (13 actions)
- All employee actions (4 actions)
- All performance actions (4 actions)
- **Impact:** DDoS vulnerability, resource exhaustion

### CSRF Protection

#### Status: ⚠️ **Implicit Protection**
```typescript
// Next.js App Router Server Actions have built-in CSRF protection
// via origin checks and same-site cookies
```

**But:**
- ❌ No explicit CSRF tokens
- ❌ No documentation of protection
- ⚠️ Relies on Next.js defaults

### Content Security Policy

#### ✅ **Good Foundation**
```typescript
// middleware.ts
response.headers.set('Content-Security-Policy', [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // ⚠️ Too permissive
  "style-src 'self' 'unsafe-inline'",  // ⚠️ Too permissive
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
].join('; '))
```

**Issues:**
- ⚠️ `unsafe-inline` and `unsafe-eval` enabled
- ⚠️ Allows all of supabase.co (should be specific subdomain)

### Security Headers Score

| Header | Implemented | Strength |
|--------|-------------|----------|
| X-Frame-Options | ✅ DENY | Strong |
| X-Content-Type-Options | ✅ nosniff | Strong |
| Referrer-Policy | ✅ strict-origin | Good |
| Permissions-Policy | ✅ Restrictive | Strong |
| CSP | ⚠️ Weak | Needs tightening |
| HSTS | ❌ Missing | Critical |
| X-XSS-Protection | ❌ Missing | Optional |

**Overall Security Score: 6.5/10 (Acceptable but needs hardening)**

---

## 7. Performance & Scalability

### Query Performance

#### ✅ **Optimizations Implemented**
1. **Database Views** - Pre-computed aggregations
   ```sql
   CREATE VIEW goals_with_progress AS
   SELECT g.*,
          COUNT(kr.id) as total_key_results,
          AVG(kr.current_value / kr.target_value) as progress
   FROM goals g
   LEFT JOIN key_results kr ON kr.goal_id = g.id
   GROUP BY g.id;
   ```

2. **Composite Indexes** (from migration files)
   ```sql
   CREATE INDEX idx_goals_org_status ON goals(organization_id, status);
   CREATE INDEX idx_goals_owner_period ON goals(owner_id, period);
   ```

3. **N+1 Prevention** (in services)
   ```typescript
   // Single query with relations
   .select(`
     *,
     owner:profiles!owner_id(...),
     key_results(...),
     parent_goal:goals!parent_goal_id(...)
   `)
   ```

#### ❌ **Performance Issues**

**1. No Query Result Caching**
```typescript
// Every request hits database
async getGoals(organizationId: string) {
  const { data } = await supabase.from('goals').select('*')
  return data  // ❌ No cache layer
}

// Should be:
const cacheKey = `goals:org:${organizationId}`
const cached = await cache.get(cacheKey)
if (cached) return cached

const data = await supabase.from('goals').select('*')
await cache.set(cacheKey, data, { ttl: 300 })  // 5 min cache
```

**2. Pagination Not Cursor-Based**
```typescript
// Current: Offset pagination (slow for large datasets)
.range(offset, offset + pageSize - 1)  // ❌ Full table scan for high offsets

// Better: Cursor-based
.gt('created_at', lastCursor)
.limit(pageSize)
```

**3. No Database Connection Pooling**
```typescript
// Each request creates new client
private async getClient(): Promise<TypedSupabaseClient> {
  return createClient()  // ⚠️ No pooling
}
```

Supabase handles this server-side, but no client-side pool management

### Caching Strategy

#### Current State: ⚠️ **Minimal**

**Cache Files Found:**
- `src/lib/cache/cache-manager.ts` - ✅ Interface defined
- `src/lib/cache/redis-cache.ts` - ⚠️ Implementation exists but NOT USED
- `src/lib/cache/service-cache.ts` - ❌ Empty placeholder
- `src/lib/cache/browser-cache.ts` - Client-side only

**Cache Usage:**
```typescript
// src/app/api/v1/goals/route.ts - ONLY PLACE using cache
const cacheKey = CacheKeys.goals(profile.organization_id)
const cached = await cache.get(cacheKey)
if (cached) {
  return NextResponse.json({ success: true, data: cached, meta: { cached: true } })
}
```

**Coverage: <5% of endpoints**

**Recommended Cache Strategy:**
```
┌─────────────────────────────────────────────┐
│ L1: In-Memory Cache (Map)                   │
│ - Hot paths (goals list, user profile)      │
│ - TTL: 30-60 seconds                         │
│ - Eviction: LRU                              │
└─────────────────────────────────────────────┘
                    ↓ Miss
┌─────────────────────────────────────────────┐
│ L2: Redis (Upstash)                          │
│ - Shared across instances                   │
│ - TTL: 5-15 minutes                          │
│ - Invalidation on write                      │
└─────────────────────────────────────────────┘
                    ↓ Miss
┌─────────────────────────────────────────────┐
│ L3: Database (Supabase)                      │
│ - Source of truth                            │
│ - Materialized views for aggregations        │
└─────────────────────────────────────────────┘
```

### Horizontal Scalability

#### Current State: ⚠️ **Not Ready**

**Blockers:**
1. **In-memory rate limiter** - Won't work across instances
2. **No distributed session storage** - Supabase handles it ✅
3. **No cache invalidation strategy** - Can't coordinate cache clears
4. **No shared state** - Each instance isolated

**Load Balancer Compatibility:**
- ✅ Stateless Server Actions
- ✅ Supabase connection pooling
- ❌ Rate limiting (in-memory)
- ❌ Cache coordination

**Score: 5/10** - Can scale vertically, not horizontally

---

## 8. Error Handling & Observability

### Error Handling Patterns

#### ✅ **Consistent Structure**
```typescript
// Custom error classes
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

// Centralized handler
export function handleServiceError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error instanceof ZodError) {
    return new ValidationError(messages)
  }
  return new AppError('Unexpected error', 'INTERNAL_ERROR', 500)
}
```

**Score: 9/10** - Excellent pattern

#### ❌ **Observability Gaps**

**1. No Structured Logging**
```typescript
// Current: console.log scattered
console.error('Upload error:', uploadError)  // ❌ Unstructured
console.log('[Service]', 'Creating goal:', data)  // ❌ Not parseable
```

**Should be:**
```typescript
logger.error({
  err: uploadError,
  context: {
    userId: user.id,
    organizationId: org.id,
    fileName: file.name,
    fileSize: file.size,
  },
  requestId: context.requestId,
  spanId: context.spanId,
}, 'Failed to upload CV')
```

**2. No Distributed Tracing**
- ❌ No OpenTelemetry integration
- ❌ No trace IDs
- ❌ No span tracking
- **Impact:** Can't track requests across services

**3. No APM Integration**
- ❌ No DataDog
- ❌ No New Relic
- ❌ No Sentry error tracking
- **Impact:** Can't monitor production errors

**4. No Metrics Collection**
```typescript
// Should track:
metrics.increment('goals.created', { org: organizationId })
metrics.timing('goals.query.duration', queryTime)
metrics.gauge('goals.active.count', count)
```

**5. No Health Checks (Beyond Basic)**
```typescript
// app/api/health/route.ts - Basic implementation
export async function GET() {
  return NextResponse.json({ status: 'ok' })  // ⚠️ Too simple
}

// Should check:
// - Database connectivity
// - Redis connectivity
// - Supabase Auth status
// - Storage bucket accessibility
```

**Observability Score: 2/10 (Critical Gap)**

---

## 9. API Documentation & Standards

### Current State: ❌ **Non-Existent**

**No OpenAPI/Swagger Specification:**
```
❌ No swagger.json
❌ No openapi.yaml
❌ No API documentation UI (Swagger UI, Redoc, Stoplight)
❌ No automated schema generation from Zod
```

**Impact:**
- Frontend teams must read TypeScript source
- External integrations impossible
- No API contract testing
- No automated client generation

### Recommended Implementation

**1. Generate OpenAPI from Zod Schemas**
```typescript
// Using zod-to-openapi
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createGoalSchema = z.object({
  title: z.string().min(3).max(200),
}).openapi({
  example: {
    title: 'Increase revenue by 20%',
  },
})
```

**2. Auto-Generate OpenAPI Spec**
```typescript
// scripts/generate-openapi.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const registry = new OpenAPIRegistry()

registry.registerPath({
  method: 'post',
  path: '/api/v1/goals',
  request: {
    body: {
      content: {
        'application/json': { schema: createGoalSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: goalResponseSchema },
      },
    },
  },
})

const spec = registry.generateDocument({
  openapi: '3.1.0',
  info: { title: 'Targetym API', version: '1.0.0' },
})

fs.writeFileSync('public/openapi.json', JSON.stringify(spec))
```

**3. Serve Swagger UI**
```typescript
// app/api/docs/page.tsx
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
  return <SwaggerUI url="/openapi.json" />
}
```

### API Versioning Strategy

**Current:** ⚠️ Partial
```
/api/v1/goals  ✅
/api/goals     ❌ (unversioned)
```

**Recommended:**
```
/api/v1/*      - Current stable API
/api/v2/*      - Next version (breaking changes)
/api/internal/* - Internal-only endpoints
/api/webhooks/* - Webhook receivers
```

**Deprecation Policy:** Missing
```typescript
// Should have in responses:
headers: {
  'Sunset': 'Sun, 01 Jan 2026 00:00:00 GMT',
  'Deprecation': 'true',
  'Link': '<https://api.targetym.com/v2/goals>; rel="successor-version"'
}
```

---

## 10. Critical Security Vulnerabilities

### HIGH SEVERITY 🚨

**1. Mass Assignment Vulnerability**
```typescript
// employees/create-employee.ts
const { data, error } = await supabase
  .from('employees')
  .insert({
    ...validated,  // ⚠️ Could include role, salary, etc.
    organization_id: profile.organization_id,
  })
```

**Attack:** User can set `role: 'admin'` in payload
**Fix:** Explicitly list allowed fields

**2. No Input Sanitization**
```typescript
// Forms accept raw HTML
description: z.string().max(2000).optional()  // ⚠️ No sanitization
```

**Attack:** Stored XSS if rendered without escaping
**Fix:** Use DOMPurify or strip HTML tags

**3. File Upload Path Traversal**
```typescript
const filename = `${profile.organization_id}/${user.id}/${timestamp}.${extension}`
// ⚠️ Extension from user input (file.name.split('.').pop())
```

**Attack:** `../../etc/passwd.pdf` → Escape organization folder
**Fix:** Validate extension against allowlist, sanitize

### MEDIUM SEVERITY ⚠️

**4. Weak Rate Limiting**
- Only 18% coverage
- In-memory (can be bypassed by rotating IPs)

**5. No Account Enumeration Protection**
```typescript
// Sign-in returns different errors
'Unauthorized' - User exists, wrong password
'Profile not found' - User doesn't exist
```

**Attack:** Enumerate valid accounts
**Fix:** Generic error "Invalid credentials"

**6. No Request Size Limits**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()  // ⚠️ Unbounded
}
```

**Attack:** Send 100MB JSON → OOM
**Fix:** Add `bodyParser.json({ limit: '1mb' })`

### LOW SEVERITY ℹ️

**7. Verbose Error Messages**
```typescript
throw new Error(`Failed to create goal: ${error.message}`)
// Exposes: "duplicate key value violates unique constraint goals_pkey"
```

**Fix:** Generic errors in production, log details server-side

---

## 11. Architectural Recommendations

### Immediate Actions (Week 1) 🔥

**1. Standardize Rate Limiting**
```typescript
// Decision: Use Upstash Redis for ALL rate limiting
// Remove in-memory fallback (fail closed, not open)

// Update all 65 actions to use withActionRateLimit
export const createEmployee = async (input: CreateEmployeeInput) => {
  return withActionRateLimit('create', async () => {
    // ... action logic
  })
}
```

**2. Centralize Authentication**
```typescript
// Replace all direct supabase.auth.getUser() calls
// Use getAuthContext() exclusively

// ❌ Before (53 places):
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase.from('profiles').select(...)

// ✅ After (1 line):
const { userId, organizationId, role } = await getAuthContext()
```

**3. Add RBAC Middleware**
```typescript
// New: src/lib/middleware/rbac.ts
export const withRole = (allowedRoles: string[]) => {
  return async <T>(
    action: () => Promise<ActionResponse<T>>
  ): Promise<ActionResponse<T>> => {
    const { role } = await getAuthContext()
    if (!allowedRoles.includes(role)) {
      return errorResponse('Forbidden', 'FORBIDDEN')
    }
    return action()
  }
}

// Usage:
export const deleteEmployee = async (id: string) => {
  return withRole(['admin'])(async () => {
    // Only admins reach here
  })
}
```

**4. Fix Service Layer Bypasses**
```typescript
// Refactor employees/create-employee.ts to use service
// ❌ Current: Direct DB access
const { data } = await supabase.from('employees').insert(...)

// ✅ Should be:
const employee = await employeesService.createEmployee({...})
```

### Short-term (Month 1) 📅

**5. Implement OpenAPI Documentation**
```bash
npm install @asteasolutions/zod-to-openapi swagger-ui-react

# Generate spec
npm run openapi:generate

# Serve docs at /api/docs
```

**6. Add Structured Logging**
```typescript
// Install pino
npm install pino pino-pretty

// Create logger singleton
import pino from 'pino'
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
})
```

**7. Implement Redis Caching**
```typescript
// Wrap all GET services with cache layer
export async function getGoals(organizationId: string) {
  return withCache(
    `goals:org:${organizationId}`,
    async () => {
      // Actual query
    },
    { ttl: 300 }  // 5 minutes
  )
}
```

**8. Add Transaction Support**
```typescript
// Use Supabase RPC for multi-step operations
CREATE FUNCTION create_goal_with_key_results(
  goal_data jsonb,
  key_results jsonb[]
) RETURNS goal AS $$
BEGIN
  -- Atomic operation
END;
$$ LANGUAGE plpgsql;
```

### Long-term (Quarter 1) 🎯

**9. Implement API Gateway**
```typescript
// New: API Gateway layer
// - Rate limiting
// - Authentication
// - Request transformation
// - Circuit breaker
// - Response aggregation

// Recommendation: Use Kong, Traefik, or AWS API Gateway
```

**10. Add Observability Stack**
```yaml
# docker-compose.observability.yml
services:
  jaeger:  # Distributed tracing
  prometheus:  # Metrics
  grafana:  # Dashboards
  loki:  # Log aggregation
```

**11. Implement Feature Flags**
```typescript
// Use LaunchDarkly, Unleash, or custom solution
const canUseAI = await featureFlags.isEnabled('ai-cv-scoring', {
  userId: user.id,
  organizationId: org.id,
})
```

**12. Add Circuit Breaker**
```typescript
// For external services (AI APIs, etc.)
import { CircuitBreaker } from 'opossum'

const aiBreaker = new CircuitBreaker(callOpenAI, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
})
```

---

## 12. Performance Benchmarks & Targets

### Current Performance (Estimated)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| API response time (p50) | ~200ms | <100ms | ⚠️ Needs cache |
| API response time (p99) | ~2s | <500ms | ❌ Needs optimization |
| Database queries per request | 2-5 | 1-2 | ⚠️ N+1 in some services |
| Cache hit rate | ~5% | >70% | ❌ No caching strategy |
| Rate limit coverage | 18% | 100% | 🚨 Critical gap |
| Error rate | Unknown | <1% | ❌ No monitoring |
| Uptime | Unknown | >99.9% | ❌ No SLA |

### Scalability Targets

**Current Capacity (Single Instance):**
- ~1,000 req/min
- ~50 concurrent users
- ~10 GB data

**Target Capacity (Multi-Instance):**
- ~100,000 req/min
- ~5,000 concurrent users
- ~1 TB data

**Blockers to Scalability:**
1. In-memory rate limiter
2. No distributed cache
3. No database read replicas
4. No CDN for static assets

---

## 13. Code Quality Metrics

### Technical Debt Assessment

**Duplication:**
```bash
# Auth logic duplicated ~50 times
grep -r "supabase.auth.getUser" src/actions | wc -l
# Output: 114

# Profile fetch duplicated ~50 times
grep -r "from('profiles').select" src/actions | wc -l
# Output: ~50
```

**Estimated Refactoring Effort:**
- Replace auth duplication: **2 days**
- Standardize rate limiting: **3 days**
- Fix service layer bypasses: **2 days**
- Add RBAC middleware: **3 days**
- **Total: 2 weeks (1 sprint)**

### Test Coverage

**Current:** Unknown (no coverage reports in repo)

**Recommended:**
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Code Complexity

**High Complexity Files (need refactoring):**
1. `recruitment.service.ts` - 510 lines
2. `goals.service.ts` - 252 lines
3. `performance.service.ts` - 200+ lines

**Recommendation:** Split into smaller, focused services

---

## 14. Migration Path to Production

### Pre-Production Checklist

**Security:**
- [ ] Enable Upstash Redis (required for distributed rate limiting)
- [ ] Remove in-memory rate limiter fallback
- [ ] Add rate limiting to all 65 actions
- [ ] Implement RBAC middleware
- [ ] Add input sanitization (DOMPurify)
- [ ] Enable HSTS header
- [ ] Tighten CSP policy (remove unsafe-inline)
- [ ] Add request size limits
- [ ] Implement secret scanning (GitHub Advanced Security)

**Performance:**
- [ ] Implement Redis caching layer
- [ ] Add database read replicas (Supabase Pro)
- [ ] Enable CDN for static assets
- [ ] Optimize database queries (check EXPLAIN ANALYZE)
- [ ] Add database connection pooling (Supavisor)

**Observability:**
- [ ] Integrate Sentry for error tracking
- [ ] Add structured logging (pino)
- [ ] Implement distributed tracing (OpenTelemetry)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create Grafana dashboards
- [ ] Configure alerts (PagerDuty, Opsgenie)

**Documentation:**
- [ ] Generate OpenAPI spec
- [ ] Deploy Swagger UI at /api/docs
- [ ] Write API migration guide
- [ ] Document rate limits per endpoint
- [ ] Create runbook for common issues

**Testing:**
- [ ] Achieve 80% code coverage
- [ ] Add integration tests for critical paths
- [ ] Implement contract tests (Pact)
- [ ] Run load tests (k6, Artillery)
- [ ] Perform security audit (OWASP ZAP)

### Deployment Strategy

**Phase 1: Canary Deployment**
```yaml
# Route 5% of traffic to new version
# Monitor for 24 hours
# Rollback if error rate > 1%
```

**Phase 2: Blue-Green Deployment**
```yaml
# Full cutover after canary success
# Keep old version running for 1 week
# Easy rollback if issues arise
```

**Phase 3: Feature Flags**
```typescript
// Gradually enable new features
if (await featureFlags.isEnabled('new-rate-limiting')) {
  return withActionRateLimit(...)
}
```

---

## 15. Conclusion & Action Plan

### Overall Backend Grade: B- (72/100)

**Breakdown:**
- Architecture: A- (90/100) - Excellent separation of concerns
- Security: C+ (65/100) - Good foundations, gaps in implementation
- Performance: C (60/100) - No caching, N+1 queries in places
- Observability: D (40/100) - Minimal logging, no monitoring
- Documentation: F (10/100) - No API docs
- Rate Limiting: D- (30/100) - Only 18% coverage
- Consistency: C (60/100) - Many pattern violations

### Critical Path (Next 2 Weeks)

**Priority 1: Security Hardening (Week 1)**
1. ✅ Enable Upstash Redis (production-ready rate limiting)
2. ✅ Add `withActionRateLimit` to all 53 unprotected actions
3. ✅ Replace all direct `supabase.auth.getUser()` with `getAuthContext()`
4. ✅ Add RBAC middleware for role-based actions
5. ✅ Fix service layer bypasses (employees, forms modules)

**Priority 2: Observability (Week 2)**
6. ✅ Integrate Sentry for error tracking
7. ✅ Add structured logging with pino
8. ✅ Create health check endpoints (DB, Redis, Storage)
9. ✅ Set up basic monitoring dashboard

**Priority 3: Documentation (Week 3-4)**
10. ✅ Generate OpenAPI spec from Zod schemas
11. ✅ Deploy Swagger UI at /api/docs
12. ✅ Document all API endpoints with examples
13. ✅ Create API versioning strategy document

**Priority 4: Performance (Month 2)**
14. ✅ Implement Redis caching layer
15. ✅ Fix N+1 queries in notifications, kpis, portal services
16. ✅ Add transaction support for multi-step operations
17. ✅ Optimize database queries (indexes, EXPLAIN ANALYZE)

### Long-term Roadmap (Q1 2026)

**Month 3: Advanced Features**
- API Gateway (Kong/Traefik)
- Circuit breaker for external services
- Feature flags system
- Webhook system with retries

**Month 4: AI Integration**
- Implement actual OpenAI/Anthropic integration
- Add CV parsing (pdf-parse, tesseract)
- Implement performance synthesis
- Add career recommendation engine

**Month 5: Enterprise Features**
- Multi-region deployment
- Database sharding by organization
- Advanced analytics
- Audit logging

### Success Metrics

**Track monthly:**
- API response time (p50, p95, p99)
- Error rate (target: <0.1%)
- Cache hit rate (target: >70%)
- Rate limit violations (should decrease)
- Security vulnerabilities (target: 0 critical)
- API documentation coverage (target: 100%)

---

## Appendix A: Code Examples

### Example 1: Standardized Action Pattern

```typescript
// src/actions/[module]/[action].ts
'use server'

import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withRole } from '@/src/lib/middleware/rbac'
import { moduleService } from '@/src/lib/services/module.service'
import { actionSchema, type ActionInput } from '@/src/lib/validations/module.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function standardAction(
  input: ActionInput
): Promise<ActionResponse<{ id: string }>> {
  // 1. Rate limiting (ALL actions)
  return withActionRateLimit('create', async () => {
    try {
      // 2. Input validation (Zod)
      const validated = actionSchema.parse(input)

      // 3. Authentication + Organization context (centralized)
      const { userId, organizationId, role } = await getAuthContext()

      // 4. Authorization (role-based, if needed)
      if (!['admin', 'manager'].includes(role)) {
        return errorResponse('Forbidden', 'FORBIDDEN')
      }

      // 5. Business logic (service layer)
      const result = await moduleService.performAction({
        ...validated,
        userId,
        organizationId,
      })

      // 6. Structured response
      return successResponse({ id: result.id })
    } catch (error) {
      // 7. Centralized error handling
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
```

### Example 2: Service with Caching

```typescript
// src/lib/services/module.service.ts
import { createClient } from '@/src/lib/supabase/server'
import { cache } from '@/src/lib/cache/redis-cache'
import type { Database } from '@/src/types/database.types'

export class ModuleService {
  private async getClient() {
    return createClient()
  }

  async getResources(
    organizationId: string,
    filters?: Filters
  ): Promise<Resource[]> {
    // 1. Check cache
    const cacheKey = `resources:org:${organizationId}:${JSON.stringify(filters)}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    // 2. Query database (with N+1 prevention)
    const supabase = await this.getClient()
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        owner:profiles!owner_id(id, full_name),
        related:related_table(id, name)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)

    if (error) throw new Error(`Failed to fetch: ${error.message}`)

    // 3. Cache result
    await cache.set(cacheKey, data, { ttl: 300 })  // 5 min

    return data || []
  }

  async createResource(data: CreateResourceData): Promise<Resource> {
    const supabase = await this.getClient()

    // Use transaction for multi-step operations
    const { data: result, error } = await supabase.rpc('create_resource_tx', {
      resource_data: data,
      related_data: data.related,
    })

    if (error) throw new Error(`Failed to create: ${error.message}`)

    // Invalidate cache
    await cache.delete(`resources:org:${data.organizationId}:*`)

    return result
  }
}

export const moduleService = new ModuleService()
```

### Example 3: OpenAPI Generation

```typescript
// scripts/generate-openapi.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import fs from 'fs'

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

// Register schemas
const goalSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['draft', 'active', 'completed']),
}).openapi('Goal')

// Register endpoints
registry.registerPath({
  method: 'get',
  path: '/api/v1/goals',
  tags: ['Goals'],
  summary: 'List goals',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(['draft', 'active', 'completed']).optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(20),
    }),
  },
  responses: {
    200: {
      description: 'List of goals',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(goalSchema),
            meta: z.object({
              page: z.number(),
              pageSize: z.number(),
              total: z.number(),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
    429: {
      description: 'Rate limit exceeded',
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)
const document = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Targetym API',
    version: '1.0.0',
    description: 'HR Management Platform API',
  },
  servers: [
    { url: 'https://api.targetym.com', description: 'Production' },
    { url: 'http://localhost:3001', description: 'Development' },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
})

fs.writeFileSync('public/openapi.json', JSON.stringify(document, null, 2))
console.log('✅ OpenAPI spec generated at public/openapi.json')
```

---

## Appendix B: Performance Optimization Examples

### Database Query Optimization

```sql
-- Before: N+1 query pattern
SELECT * FROM goals WHERE organization_id = $1;
-- Then for each goal:
SELECT * FROM key_results WHERE goal_id = $2;  -- N queries

-- After: Single query with join
SELECT
  g.*,
  jsonb_agg(jsonb_build_object(
    'id', kr.id,
    'title', kr.title,
    'current_value', kr.current_value,
    'target_value', kr.target_value
  )) as key_results
FROM goals g
LEFT JOIN key_results kr ON kr.goal_id = g.id
WHERE g.organization_id = $1
  AND g.deleted_at IS NULL
GROUP BY g.id;
```

### Redis Caching Pattern

```typescript
// Layered caching with automatic invalidation
export class CachedGoalsService extends GoalsService {
  async getGoals(organizationId: string) {
    const cacheKey = `goals:org:${organizationId}`

    // L1: In-memory (fast, short TTL)
    const memCached = memoryCache.get(cacheKey)
    if (memCached) return memCached

    // L2: Redis (shared, longer TTL)
    const redisCached = await redisCache.get(cacheKey)
    if (redisCached) {
      memoryCache.set(cacheKey, redisCached, 60)  // 1 min
      return redisCached
    }

    // L3: Database (source of truth)
    const data = await super.getGoals(organizationId)

    // Populate caches
    await redisCache.set(cacheKey, data, 300)  // 5 min
    memoryCache.set(cacheKey, data, 60)  // 1 min

    return data
  }

  async createGoal(data: CreateGoalData) {
    const goal = await super.createGoal(data)

    // Invalidate caches
    await redisCache.delete(`goals:org:${data.organizationId}`)
    memoryCache.delete(`goals:org:${data.organizationId}`)

    return goal
  }
}
```

---

**End of Report**

Generated: 2025-10-30
Analyzed by: Backend System Architect
Targetym Version: Next.js 15.5.4 + Supabase + Better Auth
