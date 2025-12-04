# Backend Architecture & API Analysis Report
## Targetym HR Management Platform

**Analysis Date:** October 30, 2025
**Codebase Version:** 0.1.0
**Analyzed By:** Backend Architect Specialist

---

## Executive Summary

This comprehensive analysis examines the backend architecture of Targetym, an AI-powered HR management platform built with Next.js 15.5.4, TypeScript, and Supabase. The codebase demonstrates **strong architectural patterns** with a well-organized service layer, consistent Server Actions implementation, and robust security through RLS policies.

### Key Metrics
- **Server Actions:** 89 exported functions across 15 modules
- **Service Layer:** 13 services (~3,768 LOC)
- **API Routes:** 32 route handlers
- **Action Code:** ~4,169 LOC
- **Database Migrations:** 25 migration files
- **Middleware Components:** 5 middleware modules

### Overall Assessment: **B+ (Very Good)**

**Strengths:**
✅ Clean service layer with singleton pattern
✅ Consistent error handling and response patterns
✅ Strong type safety with generated Supabase types
✅ Advanced middleware architecture (action wrapper, rate limiting)
✅ Multi-tenant architecture with RLS
✅ Modern patterns (pagination, caching, N+1 prevention)

**Areas for Improvement:**
⚠️ Mixed patterns between actions (some use wrapper, some don't)
⚠️ Duplicate API routes (app/api and src/app/api)
⚠️ Inconsistent rate limiting adoption (only 6/89 actions use it)
⚠️ Direct Supabase client usage in actions (140 instances vs centralized auth)
⚠️ Missing OpenAPI/Swagger documentation
⚠️ Limited transaction support

---

## 1. Server Actions Architecture

### 1.1 Current Implementation

**Organization:** 15 modules with clear domain separation
```
src/actions/
├── ai/           # 4 actions (CV scoring, career recommendations)
├── employees/    # 4 actions (CRUD operations)
├── forms/        # 4 actions (form entries management)
├── goals/        # 9 actions (goals, key results, progress)
├── help/         # 3 actions (help tickets)
├── kpis/         # 6 actions (KPI management)
├── notices/      # 4 actions (notice board)
├── notifications/# 6 actions (notification system)
├── performance/  # 8 actions (reviews, feedback)
├── portal/       # 7 actions (HR portal resources)
├── recruitment/  # 12 actions (jobs, candidates, interviews)
├── search/       # 4 actions (global search)
├── security/     # 2 actions (security events)
└── settings/     # 16 actions (org and user settings)
```

### 1.2 Pattern Analysis

#### **Pattern A: Modern Action Wrapper (6 actions - 7% adoption)**
```typescript
// src/actions/goals/create-goal.ts
export async function createGoal(input: CreateGoalInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      const validated = createGoalSchema.parse(input)
      const { userId, organizationId } = await getAuthContext()

      const goal = await goalsService.createGoal({
        ...validated,
        owner_id: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: goal.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
```

**Strengths:**
✅ Centralized auth via `getAuthContext()` helper
✅ Rate limiting built-in
✅ Consistent error handling
✅ Clean, concise implementation

#### **Pattern B: Direct Implementation (83 actions - 93% majority)**
```typescript
// src/actions/recruitment/create-job-posting.ts
export async function createJobPosting(input: CreateJobPostingInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = createJobPostingSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 'NOT_FOUND')
    }

    // Role-based authorization
    if (!['admin', 'manager'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const job = await recruitmentService.createJobPosting({
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
⚠️ Duplicate auth code in every action (140 instances of `createClient()`)
⚠️ No rate limiting
⚠️ Manual role checking (could be centralized)
⚠️ Verbose boilerplate

### 1.3 Validation Layer

**Excellent implementation** with Zod schemas:
```typescript
// src/lib/validations/goals.schemas.ts
export const createGoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  period: z.enum(['quarterly', 'annual', 'custom']),
  start_date: z.string().datetime().or(z.date()),
  end_date: z.string().datetime().or(z.date()),
  visibility: z.enum(['private', 'team', 'organization']).default('team'),
  parent_goal_id: z.string().uuid().optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})
```

**Strengths:**
✅ Custom validation rules (cross-field validation)
✅ Clear error messages
✅ Type inference with `z.infer<>`
✅ Reusable schemas (create/update patterns)

### 1.4 Response Pattern

**Consistent response structure** across all actions:
```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown }
```

**Strengths:**
✅ Type-safe responses
✅ Discriminated unions for easy client-side handling
✅ Consistent error codes
✅ Helper functions (`successResponse`, `errorResponse`)

---

## 2. Service Layer Architecture

### 2.1 Service Organization

**13 Services** implementing business logic:
```
src/lib/services/
├── ai.service.ts              # AI integrations (CV scoring, career recs)
├── employees.service.ts       # Employee management
├── goals.service.ts           # Goals and OKRs
├── goals.service.cached.ts    # Cached goals service
├── kpis.service.ts            # KPI tracking
├── notices.service.ts         # Notice board
├── notifications.service.ts   # Notification system
├── organization.service.ts    # Organization management
├── performance.service.ts     # Performance reviews
├── portal.service.ts          # HR portal resources
├── recruitment.service.ts     # Recruitment pipeline
├── settings.service.ts        # Settings management
└── index.ts                   # Barrel exports
```

### 2.2 Service Pattern Analysis

**Singleton Pattern Implementation:**
```typescript
export class GoalsService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const supabase = await this.getClient()
    const goalData: GoalInsert = { /* ... */ }
    return await safeInsert(supabase, 'goals', goalData)
  }

  async getGoals(
    organizationId: string,
    filters?: { owner_id?: string; status?: string; period?: string },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Goal>> {
    const supabase = await this.getClient()

    // Optimize: N+1 prevention with joined queries
    let dataQuery = supabase
      .from('goals')
      .select(`
        *,
        owner:profiles!owner_id(id, email, full_name, avatar_url),
        key_results(id, title, target_value, current_value, unit, status),
        parent_goal:goals!parent_goal_id(id, title)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    return createPaginatedResponse(data || [], page, pageSize, count || 0)
  }
}

export const goalsService = new GoalsService()
```

**Strengths:**
✅ **N+1 Query Prevention:** Joined queries fetch related data in single call
✅ **Type Safety:** Full TypeScript types from generated database schema
✅ **Pagination Support:** Built-in pagination with metadata
✅ **Soft Deletes:** Consistent `deleted_at` filtering
✅ **Helper Functions:** `safeInsert`, `safeUpdate`, `safeSoftDelete`
✅ **Error Handling:** Custom errors (`NotFoundError`, `ForbiddenError`)

### 2.3 Database Query Optimization

**Example: Recruitment Service**
```typescript
async getJobPostings(
  organizationId: string,
  filters?: { status?: string; department?: string },
  pagination?: PaginationParams
): Promise<PaginatedResponse<JobPosting>> {
  // Two-query pattern for accurate pagination

  // Query 1: Get total count
  const { count } = await baseQuery

  // Query 2: Fetch data with relations (N+1 prevention)
  const { data: jobs } = await supabase
    .from('job_postings')
    .select(`
      *,
      hiring_manager:profiles!hiring_manager_id(id, email, full_name, avatar_url),
      created_by_user:profiles!created_by(id, email, full_name),
      candidates(count)
    `)
    .eq('organization_id', organizationId)
    .range(offset, offset + pageSize - 1)

  return createPaginatedResponse(jobs || [], page, pageSize, count || 0)
}
```

**Optimization Techniques:**
✅ Separate count query for accuracy
✅ Joined queries for related data
✅ Range-based pagination
✅ Aggregate queries (candidate counts)

### 2.4 Type Safety Helpers

**Supabase Type Helpers** (`src/lib/utils/supabase-helpers.ts`):
```typescript
export async function safeInsert<
  TableName extends keyof Database['public']['Tables'],
  Row = Database['public']['Tables'][TableName]['Row']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  data: SafeInsert<Database['public']['Tables'][TableName]['Insert']>
) {
  const { data: insertedData, error } = await client
    .from(table)
    .insert(data as any)  // Known Supabase type limitation
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to insert into ${String(table)}: ${error.message}`)
  }

  return insertedData as Row
}
```

**Benefits:**
✅ Reduces boilerplate
✅ Consistent error messages
✅ Type-safe operations
✅ Single source of truth for DB operations

---

## 3. API Routes Architecture

### 3.1 API Route Organization

**Issue: Duplicate API Structures**
```
app/api/                          # Legacy/duplicate routes
├── goals/route.ts
├── goals/[id]/route.ts
├── recruitment/
├── performance/
└── ai/

src/app/api/                      # Newer routes
├── health/route.ts
├── v1/
│   ├── health/route.ts
│   ├── ready/route.ts
│   └── goals/route.ts
```

**Problems:**
⚠️ Two sets of API routes with overlapping functionality
⚠️ Inconsistent patterns between directories
⚠️ Maintenance burden with duplicate endpoints

### 3.2 API Route Pattern Comparison

#### **Pattern A: Advanced (src/app/api/v1/goals/route.ts)**
```typescript
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(RateLimitKeys.byUser(userId), RATE_LIMITS.authenticated)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Caching layer
    const cacheKey = CacheKeys.goals(profile.organization_id)
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached, meta: { cached: true } })
    }

    const repository = createGoalsRepository(supabase)
    const goals = await repository.findByOrganization(profile.organization_id)
    await cache.set(cacheKey, goals, { ttl: CacheTTL.MEDIUM })

    logger.info({ userId, count: goals.length }, 'Goals fetched')
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch goals')
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' } },
      { status: 500 }
    )
  }
}
```

**Features:**
✅ Rate limiting with headers
✅ Caching layer
✅ Structured logging
✅ Repository pattern
✅ Consistent error responses

#### **Pattern B: Simple (app/api/goals/route.ts)**
```typescript
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goals = await goalsService.getGoals(profile.organization_id, filters)

    return NextResponse.json({ data: goals }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**Observations:**
⚠️ No rate limiting
⚠️ No caching
⚠️ Basic error handling
⚠️ Direct service calls (good)
⚠️ Inconsistent response format

### 3.3 Missing API Documentation

**Major Gap:** No OpenAPI/Swagger documentation

**Recommendations:**
- Generate OpenAPI spec from TypeScript types
- Use `next-swagger-doc` or similar
- Document rate limits, authentication requirements
- Provide example requests/responses
- Version API endpoints (current: `/api/v1/`)

---

## 4. Middleware Architecture

### 4.1 Middleware Components

**5 Middleware Modules:**
```
src/lib/middleware/
├── action-rate-limit.ts   # Server Action rate limiting
├── action-wrapper.ts      # Universal action wrapper (advanced)
├── error-handler.ts       # Error handling middleware
├── rate-limit.ts          # API route rate limiting
└── rate-limiter.ts        # Core rate limiting logic
```

### 4.2 Action Wrapper Analysis

**Advanced Pattern** (`action-wrapper.ts`):
```typescript
export function createAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    const executeAction = async (): Promise<ActionResponse<TOutput>> => {
      // Step 1: Validate input with Zod
      const validated = schema.parse(input)

      // Step 2: Get authentication context
      let context: ActionContext | undefined
      if (requireAuth) {
        context = await getAuthContext()
      }

      // Step 3: Check role permissions
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(context.role)) {
          return errorResponse('Insufficient permissions', 'FORBIDDEN')
        }
      }

      // Step 4: Execute handler
      const result = await handler(validated, context!)

      return successResponse(result)
    }

    // Step 5: Apply rate limiting (if specified)
    if (rateLimit) {
      return withActionRateLimit(rateLimit, executeAction)
    }

    return executeAction()
  }
}
```

**Variants:**
- `createPublicAction()` - No auth required
- `createAdminAction()` - Admin-only
- `createPaginatedAction()` - Built-in pagination
- `createCachedAction()` - Automatic caching
- `createBatchAction()` - Batch operations
- `composeActions()` - Transaction composition

**Benefits:**
✅ **DRY Principle:** Eliminates boilerplate
✅ **Consistency:** Standardized auth/validation/error handling
✅ **Composability:** Easy to add cross-cutting concerns
✅ **Type Safety:** Full TypeScript support
✅ **Testing:** Easier to mock and test

**Problem:**
⚠️ **Low Adoption:** Only 7% of actions use this pattern
⚠️ **Migration Needed:** 83 actions still use old pattern

### 4.3 Rate Limiting Implementation

**In-Memory Rate Limiter** (Production: should use Redis):
```typescript
export const RATE_LIMITS = {
  public: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  authenticated: { windowMs: 15 * 60 * 1000, maxRequests: 1000 },
  organization: { windowMs: 60 * 60 * 1000, maxRequests: 10000 },
  ai: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
  write: { windowMs: 15 * 60 * 1000, maxRequests: 200 },
}

export const actionRateLimits = {
  default: { windowMs: 60 * 1000, maxRequests: 60 },
  create: { windowMs: 60 * 1000, maxRequests: 20 },
  bulk: { windowMs: 60 * 1000, maxRequests: 10 },
  ai: { windowMs: 60 * 1000, maxRequests: 5 },
}
```

**Issues:**
⚠️ In-memory store won't scale horizontally
⚠️ No distributed rate limiting
⚠️ Data loss on server restart

**Recommendation:** Use Redis (Upstash for serverless):
```typescript
// Already set up in redis-cache.ts but not used for rate limiting
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

### 4.4 Authentication Middleware

**Next.js Middleware** (`src/middleware.ts`):
```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */)
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Protect routes
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', /* ... */)

  return response
}
```

**Strengths:**
✅ Session management via Supabase SSR
✅ Automatic redirect preservation
✅ Security headers (CSP, X-Frame-Options)
✅ Clean public route handling

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

**Supabase Auth Integration:**
```
1. User signs in → Supabase Auth
2. Session stored in cookies (handled by @supabase/ssr)
3. Middleware validates session on every request
4. Server Actions/API routes call `supabase.auth.getUser()`
5. User profile fetched from `profiles` table
6. Organization ID extracted for multi-tenancy
```

**Centralized Auth Helper:**
```typescript
// src/lib/auth/server-auth.ts
export async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    throw new Error('User organization not found')
  }

  return {
    userId: user.id,
    organizationId: profile.organization_id,
    role: profile.role,
    email: user.email,
  }
}
```

**Problem:**
⚠️ Only 6 actions use `getAuthContext()` helper
⚠️ 140 instances of manual `createClient() → auth.getUser()` pattern
⚠️ Duplicate auth code across actions

### 5.2 Authorization Pattern

**Role-Based Access Control (RBAC):**
```typescript
// Manual role checking in actions
if (!['admin', 'manager'].includes(profile.role)) {
  return errorResponse('Insufficient permissions', 'FORBIDDEN')
}

// Action wrapper approach (better)
export const createJobPosting = createAction({
  schema: createJobPostingSchema,
  allowedRoles: ['admin', 'manager'],
  handler: async (validated, context) => {
    // Only called if user has required role
  }
})
```

**RLS Policies** (Database-level authorization):
```sql
-- Example: Goals table RLS
CREATE POLICY "Users can view own org goals"
  ON goals FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Managers can update goals"
  ON goals FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    (has_role('admin') OR has_role('manager') OR owner_id = auth.uid())
  );
```

**Multi-layered Security:**
✅ Application-level (Server Actions)
✅ Database-level (RLS policies)
✅ Middleware-level (route protection)

---

## 6. Data Integration & Caching

### 6.1 Caching Architecture

**Redis Cache Service** (`src/lib/cache/redis-cache.ts`):
```typescript
export class CacheService {
  async getCached<T>(
    key: string,
    callback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 300, revalidate = false } = options

    // Try cache first
    const cached = await redis.get(fullKey)
    if (cached !== null) {
      this.stats.hits++
      return JSON.parse(cached) as T
    }

    // Cache miss - fetch and cache
    const data = await callback()
    await this.set(fullKey, data, ttl)

    return data
  }

  async invalidate(pattern: string): Promise<number> {
    const keys = await redis.keys(pattern)
    await redis.del(...keys)
    return keys.length
  }
}
```

**Cache Key Patterns:**
```typescript
export const CacheKeys = {
  goal: (goalId: string) => `goal:${goalId}`,
  goals: (orgId: string, filters?: string) => `goals:${orgId}${filters ? `:${filters}` : ''}`,
  goalsWithProgress: (orgId: string) => `goals-progress:${orgId}`,
  kpis: (orgId: string) => `kpis:${orgId}`,
  performanceReviews: (orgId: string) => `perf-reviews:${orgId}`,
  // ... etc
}
```

**Strengths:**
✅ Fallback to in-memory cache if Redis unavailable
✅ Pattern-based invalidation
✅ Tag-based cache busting
✅ Cache statistics (hit rate tracking)
✅ TTL support

**Issues:**
⚠️ Limited adoption (cache service exists but rarely used)
⚠️ API routes don't consistently use caching
⚠️ Server Actions bypass cache layer

### 6.2 Database Connection Pooling

**Current Implementation:**
```typescript
// src/lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  )
}
```

**Analysis:**
✅ Supabase handles connection pooling internally
✅ Uses Supabase Pooler for serverless environments
⚠️ No visibility into pool size or connection metrics
⚠️ Limited control over connection lifecycle

**Recommendation:**
- Monitor connection metrics via Supabase dashboard
- Consider dedicated pooler for high-traffic endpoints
- Implement connection retry logic for transient failures

---

## 7. Performance Optimization

### 7.1 Query Optimization

**N+1 Prevention:**
```typescript
// ❌ BAD: N+1 queries
async getGoals(orgId: string) {
  const goals = await supabase.from('goals').select('*').eq('organization_id', orgId)

  for (const goal of goals) {
    goal.owner = await supabase.from('profiles').select('*').eq('id', goal.owner_id).single()
    goal.key_results = await supabase.from('key_results').select('*').eq('goal_id', goal.id)
  }

  return goals
}

// ✅ GOOD: Single query with joins
async getGoals(orgId: string) {
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      *,
      owner:profiles!owner_id(id, email, full_name, avatar_url),
      key_results(id, title, target_value, current_value, unit, status),
      parent_goal:goals!parent_goal_id(id, title)
    `)
    .eq('organization_id', orgId)

  return goals
}
```

**Database Views:**
```sql
-- Optimized views for complex queries
CREATE VIEW goals_with_progress AS
SELECT
  g.*,
  COALESCE(AVG(kr.current_value / NULLIF(kr.target_value, 0)) * 100, 0) as progress
FROM goals g
LEFT JOIN key_results kr ON kr.goal_id = g.id
GROUP BY g.id;

CREATE VIEW job_postings_with_stats AS
SELECT
  jp.*,
  COUNT(c.id) as total_candidates,
  COUNT(CASE WHEN c.status = 'in_process' THEN 1 END) as active_candidates
FROM job_postings jp
LEFT JOIN candidates c ON c.job_posting_id = jp.id
GROUP BY jp.id;
```

**Indexing Strategy:**
```sql
-- Composite indexes for common queries
CREATE INDEX idx_goals_org_status ON goals(organization_id, status);
CREATE INDEX idx_goals_org_owner ON goals(organization_id, owner_id);
CREATE INDEX idx_candidates_job_status ON candidates(job_posting_id, status);

-- Full-text search indexes
CREATE INDEX idx_goals_search ON goals USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

**Strengths:**
✅ Joined queries throughout codebase
✅ Database views for complex aggregations
✅ Composite indexes on common filters
✅ Full-text search support

### 7.2 Pagination Implementation

**Consistent Pagination Pattern:**
```typescript
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Service method
async getGoals(
  organizationId: string,
  filters?: { ... },
  pagination?: PaginationParams
): Promise<PaginatedResponse<Goal>> {
  const { page, pageSize } = normalizePagination(pagination)
  const offset = getPaginationOffset(page, pageSize)

  // Get total count
  const { count } = await supabase.from('goals').select('*', { count: 'exact' })...

  // Fetch paginated data
  const { data } = await supabase
    .from('goals')
    .select('...')
    .range(offset, offset + pageSize - 1)

  return createPaginatedResponse(data || [], page, pageSize, count || 0)
}
```

**Strengths:**
✅ Consistent pagination interface
✅ Offset-based pagination (simple, predictable)
✅ Metadata includes helpful navigation info
✅ Default limits (20) and max limits (100)

**Limitations:**
⚠️ Offset pagination doesn't scale well for large datasets
⚠️ "Deep pagination" problem (page 1000 is slow)

**Recommendation:** Implement cursor-based pagination for large tables:
```typescript
// Cursor-based pagination (better for scale)
interface CursorPaginationParams {
  cursor?: string
  limit?: number
}

async getGoalsCursor(orgId: string, params: CursorPaginationParams) {
  const { cursor, limit = 20 } = params

  let query = supabase
    .from('goals')
    .select('*')
    .eq('organization_id', orgId)
    .limit(limit + 1) // Fetch one extra to check if there's a next page

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data } = await query

  const hasNextPage = data.length > limit
  const items = hasNextPage ? data.slice(0, limit) : data
  const nextCursor = hasNextPage ? items[items.length - 1].created_at : null

  return { data: items, nextCursor, hasNextPage }
}
```

### 7.3 Async Operations

**Background Job Processing:**
- Currently: No dedicated job queue
- AI operations (CV scoring) run synchronously
- Long-running operations may timeout

**Recommendation:** Implement background jobs:
```typescript
// Using Supabase Edge Functions or external queue
interface JobData {
  type: 'score_cv' | 'generate_insights'
  candidateId?: string
  organizationId: string
}

async function enqueueJob(job: JobData) {
  await supabase.from('background_jobs').insert({
    type: job.type,
    payload: job,
    status: 'pending',
  })

  // Trigger edge function or worker
  await fetch('/api/jobs/process', { method: 'POST', body: JSON.stringify(job) })
}
```

---

## 8. Security Analysis

### 8.1 Multi-Tenant Security

**RLS Policies** (Row-Level Security):
```sql
-- Automatic organization isolation
CREATE FUNCTION get_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Applied to all tables
CREATE POLICY "org_isolation" ON goals
  FOR ALL
  USING (organization_id = get_user_organization_id());
```

**Strengths:**
✅ Database-enforced multi-tenancy
✅ Impossible to access other org's data
✅ Works even if application code has bugs
✅ Consistent across all tables

### 8.2 Input Validation

**Zod Validation** at multiple layers:
```typescript
// 1. API Route validation
export async function POST(request: Request) {
  const body = await request.json()
  const validated = createGoalSchema.parse(body) // Throws on invalid
  // ...
}

// 2. Server Action validation
export async function createGoal(input: CreateGoalInput) {
  const validated = createGoalSchema.parse(input) // Double validation
  // ...
}
```

**Security Features:**
✅ XSS prevention (sanitized inputs)
✅ SQL injection prevention (parameterized queries)
✅ Type coercion attacks prevented
✅ Length limits enforced

### 8.3 Rate Limiting Security

**DDoS Protection:**
```typescript
export const RATE_LIMITS = {
  public: { windowMs: 15 * 60 * 1000, maxRequests: 100 },      // 100/15min
  authenticated: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000/15min
  ai: { windowMs: 60 * 60 * 1000, maxRequests: 100 },          // 100/hour
}
```

**Issues:**
⚠️ In-memory rate limiting (not distributed)
⚠️ Low adoption (most actions unprotected)
⚠️ No IP-based rate limiting for unauthenticated routes

### 8.4 Security Headers

**Middleware Security Headers:**
```typescript
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
response.headers.set('Content-Security-Policy', [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // ⚠️ Unsafe
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co",
].join('; '))
```

**Issues:**
⚠️ `'unsafe-inline'` and `'unsafe-eval'` weaken CSP
⚠️ No HSTS header
⚠️ No Subresource Integrity (SRI)

---

## 9. Testing Strategy

### 9.1 Test Coverage

**Current State:**
- Unit tests for services
- Integration tests for actions
- Test coverage threshold: 80%

**Test Examples:**
```typescript
// __tests__/unit/lib/services/goals.service.test.ts
describe('GoalsService', () => {
  it('should create goal with valid data', async () => {
    const goalData = { title: 'Test Goal', /* ... */ }
    const result = await goalsService.createGoal(goalData)
    expect(result).toMatchObject(goalData)
  })

  it('should throw error on duplicate goal', async () => {
    await expect(goalsService.createGoal(duplicateData))
      .rejects.toThrow('Goal already exists')
  })
})
```

**Gaps:**
⚠️ No API route tests
⚠️ No end-to-end tests
⚠️ No load testing
⚠️ No security testing (penetration tests)

### 9.2 Testing Utilities

**Mocking Setup:**
```typescript
// Mock Supabase client
jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Mock auth context
jest.mock('@/src/lib/auth/server-auth', () => ({
  getAuthContext: jest.fn(() => ({
    userId: 'test-user-id',
    organizationId: 'test-org-id',
    role: 'admin',
  }))
}))
```

**Strengths:**
✅ Type-safe mocks
✅ Reusable test utilities
✅ Coverage enforcement

---

## 10. Scalability Assessment

### 10.1 Horizontal Scalability

**Current Architecture:**
✅ Stateless Server Actions
✅ Supabase pooling for database connections
✅ Next.js serverless-ready
⚠️ In-memory rate limiter (not distributed)
⚠️ In-memory cache fallback

**Scalability Score:** 7/10

**Bottlenecks:**
1. In-memory rate limiting won't work across instances
2. Cache service needs Redis for multi-instance deployment
3. No distributed locking for concurrent operations

### 10.2 Vertical Scalability

**Database:**
- Supabase PostgreSQL (scalable)
- Connection pooling enabled
- Read replicas available (Supabase Pro)

**Application:**
- Next.js handles increased traffic well
- Serverless functions auto-scale
- No long-running processes

### 10.3 Performance Benchmarks

**Estimated Response Times:**
- Simple queries: 50-100ms
- Complex joined queries: 100-300ms
- Paginated lists: 150-400ms
- AI operations: 2-5 seconds

**Database Query Complexity:**
- Average query: 2-3 joins
- Maximum observed: 5 joins (candidate detail view)

---

## 11. Key Recommendations

### 11.1 Critical (Immediate Action Required)

#### **1. Standardize Server Actions Pattern**
**Priority:** 🔴 HIGH
**Impact:** Code maintainability, consistency, security

**Problem:** 93% of actions use verbose, duplicated pattern instead of action wrapper.

**Solution:**
```typescript
// Migrate all actions to use createAction wrapper
// Before (83 actions):
export async function createGoal(input: CreateGoalInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized')
  const { data: profile } = await supabase.from('profiles')...
  // ... 20 more lines
}

// After:
export const createGoal = createAction({
  schema: createGoalSchema,
  rateLimit: 'create',
  handler: async (validated, context) => {
    const goal = await goalsService.createGoal({
      ...validated,
      owner_id: context.userId,
      organization_id: context.organizationId,
    })
    return { id: goal.id }
  },
})
```

**Benefits:**
- Reduce code by ~70% per action
- Consistent auth/validation/error handling
- Easier to add rate limiting, caching, logging
- Better testability

**Estimated Effort:** 2-3 weeks

---

#### **2. Consolidate API Routes**
**Priority:** 🔴 HIGH
**Impact:** Maintenance burden, confusion

**Problem:** Duplicate API structure in `app/api/` and `src/app/api/`

**Solution:**
```bash
# Recommended structure:
src/app/api/
├── v1/                    # Current API version
│   ├── goals/
│   ├── recruitment/
│   ├── performance/
│   └── ai/
├── health/                # Health checks
└── auth/                  # Auth endpoints

# Delete: app/api/* (legacy routes)
```

**Migration Plan:**
1. Audit both directories for differences
2. Consolidate features into versioned API
3. Add deprecation warnings to old routes
4. Update client code to use new endpoints
5. Remove old routes after migration period

**Estimated Effort:** 1 week

---

#### **3. Implement Distributed Rate Limiting**
**Priority:** 🔴 HIGH
**Impact:** Security, scalability

**Problem:** In-memory rate limiter won't work in multi-instance deployment.

**Solution:**
```typescript
// Use Upstash Redis for distributed rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  analytics: true,
})

// In middleware:
const { success, limit, remaining, reset } = await rateLimiter.limit(userId)
if (!success) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

**Apply to:**
- All Server Actions (via `createAction` wrapper)
- All API routes
- Public endpoints (IP-based rate limiting)

**Estimated Effort:** 3-4 days

---

### 11.2 Important (Short-term Improvements)

#### **4. Add OpenAPI Documentation**
**Priority:** 🟡 MEDIUM
**Impact:** Developer experience, API discoverability

**Solution:**
```typescript
// Use next-swagger-doc
import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () => {
  return createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Targetym API',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Development' },
        { url: 'https://api.targetym.com', description: 'Production' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
    },
  })
}

// Add JSDoc comments to routes:
/**
 * @swagger
 * /api/v1/goals:
 *   get:
 *     summary: List goals
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed]
 *     responses:
 *       200:
 *         description: List of goals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
 */
```

**Estimated Effort:** 1 week

---

#### **5. Implement Background Job Queue**
**Priority:** 🟡 MEDIUM
**Impact:** Performance, reliability

**Problem:** Long-running operations (AI scoring) run synchronously, blocking requests.

**Solution:**
```typescript
// Use Supabase Edge Functions or Bull/BullMQ
import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'

const jobQueue = new Queue('targetym-jobs', {
  connection: new Redis(process.env.REDIS_URL),
})

// Enqueue job
export async function scoreCandidateCV(candidateId: string) {
  await jobQueue.add('score-cv', { candidateId })
  return { status: 'queued', jobId: job.id }
}

// Worker
const worker = new Worker('targetym-jobs', async (job) => {
  if (job.name === 'score-cv') {
    const { candidateId } = job.data
    const result = await aiService.scoreCandidateCV(candidateId)
    await supabase.from('candidates').update({ ai_cv_score: result.score }).eq('id', candidateId)
  }
})
```

**Use Cases:**
- AI CV scoring
- Bulk operations (batch updates)
- Email notifications
- Report generation
- Data exports

**Estimated Effort:** 1-2 weeks

---

#### **6. Add Comprehensive Logging**
**Priority:** 🟡 MEDIUM
**Impact:** Observability, debugging

**Solution:**
```typescript
// Use Pino (already in package.json)
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
})

// In Server Actions:
export const createGoal = createAction({
  schema: createGoalSchema,
  enableLogging: true, // Log request/response
  handler: async (validated, context) => {
    logger.info({ userId: context.userId, title: validated.title }, 'Creating goal')

    try {
      const goal = await goalsService.createGoal(validated)
      logger.info({ goalId: goal.id }, 'Goal created successfully')
      return { id: goal.id }
    } catch (error) {
      logger.error({ err: error }, 'Failed to create goal')
      throw error
    }
  },
})
```

**Log Aggregation:** Use LogTail, Datadog, or CloudWatch

**Estimated Effort:** 3-4 days

---

### 11.3 Nice to Have (Long-term Enhancements)

#### **7. Implement CQRS Pattern**
**Priority:** 🟢 LOW
**Impact:** Performance, scalability

Separate read and write models for complex queries:
```typescript
// Write model (commands)
class GoalsCommandService {
  async createGoal(data: CreateGoalData): Promise<string> {
    const goalId = await this.insert(data)
    await this.invalidateCache(data.organization_id)
    await this.publishEvent('goal.created', { goalId })
    return goalId
  }
}

// Read model (queries)
class GoalsQueryService {
  async getGoals(orgId: string): Promise<Goal[]> {
    return await this.cache.getCached(`goals:${orgId}`, async () => {
      return await this.fetchFromView('goals_with_progress')
    })
  }
}
```

**Estimated Effort:** 3-4 weeks

---

#### **8. Add GraphQL API**
**Priority:** 🟢 LOW
**Impact:** Developer experience, efficiency

Provide GraphQL alongside REST:
```graphql
type Query {
  goals(organizationId: ID!, filters: GoalFilters): [Goal!]!
  goal(id: ID!): Goal
}

type Mutation {
  createGoal(input: CreateGoalInput!): Goal!
  updateGoal(id: ID!, input: UpdateGoalInput!): Goal!
}

type Subscription {
  goalUpdated(organizationId: ID!): Goal!
}
```

**Estimated Effort:** 2-3 weeks

---

#### **9. Implement Event Sourcing**
**Priority:** 🟢 LOW
**Impact:** Audit trail, debugging

Store all state changes as events:
```typescript
// Event store
interface Event {
  id: string
  aggregateId: string
  type: 'goal.created' | 'goal.updated' | 'goal.completed'
  payload: any
  userId: string
  timestamp: string
}

// Rebuild state from events
async function replayEvents(goalId: string): Promise<Goal> {
  const events = await supabase
    .from('events')
    .select('*')
    .eq('aggregateId', goalId)
    .order('timestamp', { ascending: true })

  return events.reduce((state, event) => applyEvent(state, event), initialState)
}
```

**Estimated Effort:** 4-6 weeks

---

## 12. Security Recommendations

### 12.1 Critical Security Issues

#### **1. Strengthen CSP Headers**
```typescript
// Current (insecure):
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"

// Recommended:
"script-src 'self' 'nonce-{random}'"

// Generate nonces per request
const nonce = crypto.randomUUID()
response.headers.set('Content-Security-Policy',
  `script-src 'self' 'nonce-${nonce}'`
)
```

#### **2. Add HSTS Header**
```typescript
response.headers.set('Strict-Transport-Security',
  'max-age=63072000; includeSubDomains; preload'
)
```

#### **3. Implement API Key Rotation**
```typescript
// Service role key should be rotated regularly
// Add to Supabase dashboard settings
// Update env vars after rotation
```

#### **4. Add Request Signing**
```typescript
// For sensitive operations
import { createHmac } from 'crypto'

function signRequest(body: any, secret: string): string {
  const hmac = createHmac('sha256', secret)
  hmac.update(JSON.stringify(body))
  return hmac.digest('hex')
}

// Verify in middleware
const signature = request.headers.get('x-signature')
const expected = signRequest(body, process.env.SECRET_KEY!)
if (signature !== expected) {
  return errorResponse('Invalid signature', 'INVALID_SIGNATURE')
}
```

---

## 13. Performance Optimization Roadmap

### Phase 1: Quick Wins (1-2 weeks)
1. ✅ Enable response compression (gzip/brotli)
2. ✅ Add HTTP caching headers
3. ✅ Optimize database queries (add missing indexes)
4. ✅ Enable Supabase query caching

### Phase 2: Caching Layer (2-3 weeks)
1. Deploy Redis (Upstash)
2. Implement cache-aside pattern in services
3. Add cache warming for popular queries
4. Implement cache invalidation on mutations

### Phase 3: Advanced Optimizations (1-2 months)
1. Implement cursor-based pagination
2. Add read replicas for heavy read operations
3. Implement query result streaming
4. Add CDN for static assets
5. Implement service workers for offline support

---

## 14. Monitoring & Observability

### 14.1 Metrics to Track

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Cache hit rate (%)

**Database Metrics:**
- Query latency
- Connection pool usage
- Slow queries (>100ms)
- Database CPU/memory

**Business Metrics:**
- Active users
- Goals created/completed
- Candidates processed
- API usage by endpoint

### 14.2 Recommended Tools

**APM:** DataDog, New Relic, or Sentry
**Logging:** LogTail or CloudWatch Logs
**Metrics:** Prometheus + Grafana
**Alerting:** PagerDuty or Opsgenie

---

## 15. Code Quality Score

### Architecture: A-
- ✅ Clean separation of concerns
- ✅ Service layer abstraction
- ✅ Type-safe implementation
- ⚠️ Inconsistent patterns (action wrapper adoption)

### Security: B+
- ✅ Multi-tenant RLS policies
- ✅ Input validation (Zod)
- ✅ Authentication middleware
- ⚠️ CSP too permissive
- ⚠️ Limited rate limiting adoption

### Scalability: B
- ✅ Stateless architecture
- ✅ Connection pooling
- ⚠️ In-memory rate limiting
- ⚠️ No distributed caching

### Performance: B+
- ✅ N+1 query prevention
- ✅ Database indexes
- ✅ Pagination support
- ⚠️ Limited caching adoption
- ⚠️ No cursor-based pagination

### Maintainability: A-
- ✅ Clear module organization
- ✅ Consistent naming conventions
- ✅ Helper utilities
- ⚠️ Some code duplication (auth pattern)

### Testing: B
- ✅ 80% coverage requirement
- ✅ Unit tests for services
- ⚠️ No E2E tests
- ⚠️ No load tests

**Overall Grade: B+ (Very Good)**

---

## 16. Migration Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Consolidate API routes structure
- [ ] Deploy Redis (Upstash)
- [ ] Implement distributed rate limiting
- [ ] Add comprehensive logging

### Phase 2: Standardization (Weeks 3-4)
- [ ] Migrate 20 actions to `createAction` wrapper
- [ ] Add OpenAPI documentation for main endpoints
- [ ] Implement background job queue
- [ ] Add monitoring dashboards

### Phase 3: Optimization (Weeks 5-6)
- [ ] Migrate remaining 63 actions to wrapper
- [ ] Implement Redis caching across services
- [ ] Add cursor-based pagination
- [ ] Security hardening (CSP, HSTS)

### Phase 4: Polish (Weeks 7-8)
- [ ] Complete OpenAPI documentation
- [ ] Add E2E tests
- [ ] Performance benchmarking
- [ ] Documentation updates

---

## 17. Conclusion

The Targetym backend architecture demonstrates **strong engineering practices** with a well-organized service layer, consistent error handling, and robust security through RLS policies. The codebase is in a **good state** for a v0.1.0 release but requires **standardization** before scaling.

### Critical Success Factors
1. **Standardize Server Actions** - Highest priority to reduce technical debt
2. **Distributed Infrastructure** - Redis for rate limiting and caching
3. **API Documentation** - OpenAPI spec for better developer experience
4. **Monitoring** - Observability before production launch

### Timeline to Production-Ready
**Estimated: 6-8 weeks** with 2 developers

The platform has a **solid foundation** and with the recommended improvements, will scale efficiently to support thousands of concurrent users and multiple organizations.

---

## Appendix A: Architecture Diagrams

### Current Request Flow
```
User Request
    ↓
Next.js Middleware (auth check)
    ↓
Server Action / API Route
    ↓
Service Layer (business logic)
    ↓
Supabase Client (database)
    ↓
PostgreSQL + RLS (data)
```

### Recommended Request Flow
```
User Request
    ↓
Next.js Middleware (auth + rate limit)
    ↓
Action Wrapper (validation + auth + rate limit + logging)
    ↓
Service Layer (business logic)
    ↓
Cache Layer (Redis)
    ↓
Supabase Client (database)
    ↓
PostgreSQL + RLS (data)
```

---

## Appendix B: Code Examples

### Example: Migrating Action to Wrapper Pattern

**Before (48 lines):**
```typescript
'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createJobPostingSchema, type CreateJobPostingInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function createJobPosting(
  input: CreateJobPostingInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validated = createJobPostingSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 'NOT_FOUND')
    }

    if (!['admin', 'manager'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const job = await recruitmentService.createJobPosting({
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

**After (14 lines - 71% reduction):**
```typescript
'use server'

import { createAction } from '@/src/lib/middleware/action-wrapper'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createJobPostingSchema } from '@/src/lib/validations/recruitment.schemas'

export const createJobPosting = createAction({
  schema: createJobPostingSchema,
  rateLimit: 'create',
  allowedRoles: ['admin', 'manager'],
  handler: async (validated, context) => {
    const job = await recruitmentService.createJobPosting({
      ...validated,
      organization_id: context.organizationId,
      posted_by: context.userId,
    })
    return { id: job.id }
  },
})
```

**Benefits:**
- 71% less code
- Automatic rate limiting
- Consistent error handling
- Role-based auth built-in
- Easier to test (mock context)

---

**END OF REPORT**

**Generated by:** Backend Architect Specialist
**Contact:** For questions about this analysis, refer to the development team.
