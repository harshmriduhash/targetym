# API Design Document - Targetym HR Platform

**Version:** 1.0.0  
**Last Updated:** 2025-11-17  
**Status:** Design Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Request/Response Patterns](#requestresponse-patterns)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [API Resources](#api-resources)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Versioning Strategy](#versioning-strategy)

---

## Overview

Targetym API is a RESTful API built on Next.js 15 App Router, providing comprehensive HR management capabilities including Goals & OKRs, Recruitment, Performance Management, and AI-powered features.

### Base URLs

- **Development:** `http://localhost:3000/api/v1`
- **Production:** `https://targetym.vercel.app/api/v1`
- **Staging:** `https://staging.targetym.vercel.app/api/v1`

### API Features

- ✅ RESTful design with standard HTTP methods
- ✅ Multi-tenant isolation (organization-based)
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting per user/organization
- ✅ Comprehensive error handling
- ✅ Request validation with Zod
- ✅ Response caching where appropriate
- ✅ OpenAPI 3.0 specification

---

## Architecture Principles

### 1. **Dual API Pattern**

Targetym uses two complementary API patterns:

#### **A. REST API Routes** (`/api/v1/*`)
- **Use Case:** External integrations, mobile apps, third-party services
- **Location:** `src/app/api/v1/`
- **Features:** Rate limiting, caching, CORS support
- **Example:** `GET /api/v1/goals`

#### **B. Server Actions** (`'use server'`)
- **Use Case:** Next.js frontend components, form submissions
- **Location:** `src/actions/`
- **Features:** Type-safe, optimized for React Server Components
- **Example:** `createGoal()` action

### 2. **Three-Layer Architecture**

```
API Route/Server Action
    ↓
Service Layer (Business Logic)
    ↓
Repository/Data Access Layer
    ↓
Supabase Database
```

### 3. **Multi-Tenant Isolation**

All resources are scoped to `organization_id`:
- Automatic filtering via RLS policies
- User can only access their organization's data
- Enforced at database level (PostgreSQL RLS)

---

## API Structure

### Resource Naming Conventions

- **Plural nouns** for collections: `/goals`, `/candidates`, `/job-postings`
- **Kebab-case** for multi-word resources: `/job-postings`, `/performance-reviews`
- **Nested resources** for relationships: `/goals/{id}/key-results`
- **Actions** as sub-resources: `/candidates/{id}/status`, `/interviews/{id}/schedule`

### HTTP Methods

| Method | Usage | Idempotent | Example |
|--------|-------|------------|---------|
| `GET` | Retrieve resources | ✅ Yes | `GET /api/v1/goals` |
| `POST` | Create resources | ❌ No | `POST /api/v1/goals` |
| `PUT` | Full update (replace) | ✅ Yes | `PUT /api/v1/goals/{id}` |
| `PATCH` | Partial update | ✅ Yes | `PATCH /api/v1/goals/{id}` |
| `DELETE` | Delete resources | ✅ Yes | `DELETE /api/v1/goals/{id}` |

---

## Authentication & Authorization

### Authentication

**Method:** Bearer Token (JWT via Supabase Auth)

```http
Authorization: Bearer <supabase_jwt_token>
```

**Implementation:**
```typescript
// src/lib/middleware/auth.ts
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)
  }
  
  return { userId: user.id, user }
}
```

### Authorization

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|------|-------------|
| `admin` | Full access to organization |
| `hr` | Recruitment, performance reviews, employee management |
| `manager` | Team goals, performance reviews, team members |
| `employee` | Own goals, own profile, own performance reviews |

**Implementation:**
```typescript
// Check role in service layer
if (userRole !== 'admin' && userRole !== 'hr') {
  throw new AppError('Forbidden', 'FORBIDDEN', 403)
}
```

---

## Request/Response Patterns

### Standard Request Format

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <optional-tracking-id>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sort`: Sort field (e.g., `created_at`)
- `order`: Sort direction (`asc` or `desc`)
- `filter`: Filter criteria (JSON string)

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Resource data
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "cached": false
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [
    // Array of resources
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "statusCode": 400,
    "details": [
      {
        "path": "title",
        "message": "Title is required"
      }
    ],
    "timestamp": "2025-11-17T10:30:00Z",
    "path": "/api/v1/goals"
  }
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Structure

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    statusCode: number
    details?: unknown
    timestamp: string
    path?: string
  }
}
```

### Implementation

```typescript
// src/lib/middleware/error-handler.ts
export function formatErrorResponse(
  error: Error | AppError,
  path?: string
): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }
  
  // Handle generic errors
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path,
    },
  }
}
```

---

## Rate Limiting

### Rate Limit Tiers

| Tier | Requests | Window | Headers |
|------|----------|--------|---------|
| `anonymous` | 10 | 1 minute | `X-RateLimit-*` |
| `authenticated` | 100 | 1 minute | `X-RateLimit-*` |
| `premium` | 500 | 1 minute | `X-RateLimit-*` |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

### Implementation

```typescript
// src/lib/middleware/rate-limiter.ts
import { checkRateLimit, RateLimitKeys, RATE_LIMITS } from '@/src/lib/middleware/rate-limiter'

const rateLimitResult = checkRateLimit(
  RateLimitKeys.byUser(userId),
  RATE_LIMITS.authenticated
)

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
    { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
  )
}
```

---

## API Resources

### 1. Goals & OKRs

#### List Goals
```http
GET /api/v1/goals
```

**Query Parameters:**
- `owner_id` (optional): Filter by owner
- `status` (optional): Filter by status (`active`, `completed`, `archived`)
- `period` (optional): Filter by period (`Q1`, `Q2`, `Q3`, `Q4`, `YEARLY`)
- `page`, `pageSize`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Increase revenue by 20%",
      "description": "...",
      "status": "active",
      "period": "Q1",
      "owner_id": "uuid",
      "organization_id": "uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 50 }
}
```

#### Get Goal
```http
GET /api/v1/goals/{id}
```

#### Create Goal
```http
POST /api/v1/goals
Content-Type: application/json

{
  "title": "Increase revenue by 20%",
  "description": "Focus on enterprise sales",
  "period": "Q1",
  "target_date": "2025-03-31"
}
```

#### Update Goal
```http
PATCH /api/v1/goals/{id}
Content-Type: application/json

{
  "status": "completed",
  "completion_percentage": 100
}
```

#### Delete Goal
```http
DELETE /api/v1/goals/{id}
```

#### Key Results

```http
GET /api/v1/goals/{id}/key-results
POST /api/v1/goals/{id}/key-results
GET /api/v1/key-results/{id}
PATCH /api/v1/key-results/{id}
DELETE /api/v1/key-results/{id}
```

---

### 2. Recruitment

#### Job Postings

```http
GET /api/v1/job-postings
POST /api/v1/job-postings
GET /api/v1/job-postings/{id}
PATCH /api/v1/job-postings/{id}
DELETE /api/v1/job-postings/{id}
```

**Create Job Posting:**
```json
{
  "title": "Senior Full-Stack Developer",
  "department": "Engineering",
  "location": "Remote",
  "employment_type": "full-time",
  "description": "...",
  "requirements": ["5+ years experience", "React, Node.js"],
  "status": "open"
}
```

#### Candidates

```http
GET /api/v1/candidates
POST /api/v1/candidates
GET /api/v1/candidates/{id}
PATCH /api/v1/candidates/{id}
DELETE /api/v1/candidates/{id}
```

**Update Candidate Status:**
```http
PATCH /api/v1/candidates/{id}/status
Content-Type: application/json

{
  "status": "interview_scheduled",
  "current_stage": "technical_interview",
  "notes": "Scheduled for next week"
}
```

#### Interviews

```http
GET /api/v1/interviews
POST /api/v1/interviews
GET /api/v1/interviews/{id}
PATCH /api/v1/interviews/{id}
DELETE /api/v1/interviews/{id}
```

**Schedule Interview:**
```http
POST /api/v1/interviews
Content-Type: application/json

{
  "candidate_id": "uuid",
  "interviewer_id": "uuid",
  "scheduled_at": "2025-11-20T14:00:00Z",
  "type": "technical",
  "location": "Zoom",
  "notes": "Focus on system design"
}
```

---

### 3. Performance Management

#### Performance Reviews

```http
GET /api/v1/performance-reviews
POST /api/v1/performance-reviews
GET /api/v1/performance-reviews/{id}
PATCH /api/v1/performance-reviews/{id}
DELETE /api/v1/performance-reviews/{id}
```

**Create Review:**
```json
{
  "reviewee_id": "uuid",
  "reviewer_id": "uuid",
  "review_period_start": "2025-01-01",
  "review_period_end": "2025-03-31",
  "status": "draft"
}
```

#### Peer Feedback

```http
GET /api/v1/peer-feedback
POST /api/v1/peer-feedback
GET /api/v1/peer-feedback/{id}
PATCH /api/v1/peer-feedback/{id}
DELETE /api/v1/peer-feedback/{id}
```

---

### 4. Profiles & Organizations

#### Profiles

```http
GET /api/v1/profiles
GET /api/v1/profiles/{id}
PATCH /api/v1/profiles/{id}
```

**Update Profile:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "job_title": "Senior Developer",
  "department": "Engineering",
  "skills": ["React", "TypeScript", "Node.js"]
}
```

#### Organizations

```http
GET /api/v1/organizations/{id}
PATCH /api/v1/organizations/{id}
```

---

### 5. AI Features

#### CV Scoring

```http
POST /api/v1/ai/cv-score
Content-Type: multipart/form-data

{
  "candidate_id": "uuid",
  "cv_file": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "match_percentage": 90,
    "strengths": ["5+ years React", "TypeScript expertise"],
    "gaps": ["No AWS experience"],
    "recommendation": "strong_match"
  }
}
```

#### Performance Synthesis

```http
POST /api/v1/ai/performance-synthesize
Content-Type: application/json

{
  "reviewee_id": "uuid",
  "review_period": "Q1"
}
```

#### Career Recommendations

```http
POST /api/v1/ai/career-recommend
Content-Type: application/json

{
  "profile_id": "uuid"
}
```

---

### 6. KPIs

```http
GET /api/v1/kpis
POST /api/v1/kpis
GET /api/v1/kpis/{id}
PATCH /api/v1/kpis/{id}
DELETE /api/v1/kpis/{id}
POST /api/v1/kpis/{id}/measurements
```

---

### 7. Notifications

```http
GET /api/v1/notifications
PATCH /api/v1/notifications/{id}/read
PATCH /api/v1/notifications/read-all
```

---

### 8. Integrations

```http
GET /api/v1/integrations
POST /api/v1/integrations/connect
POST /api/v1/integrations/{id}/disconnect
GET /api/v1/integrations/{id}/status
```

---

## Implementation Guidelines

### 1. API Route Template

```typescript
// src/app/api/v1/{resource}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/middleware/auth'
import { checkRateLimit, RATE_LIMITS } from '@/src/lib/middleware/rate-limiter'
import { handleError } from '@/src/lib/middleware/error-handler'
import { z } from 'zod'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * GET /api/v1/{resource} - List resources
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const { userId, organizationId } = await requireAuth(request)
    
    // 2. Rate limiting
    const rateLimitResult = checkRateLimit(
      RateLimitKeys.byUser(userId),
      RATE_LIMITS.authenticated
    )
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
        { status: 429 }
      )
    }
    
    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    // 4. Business logic (via service layer)
    const supabase = await createClient()
    const repository = createResourceRepository(supabase)
    const result = await repository.findByOrganization(organizationId, {
      page,
      pageSize,
    })
    
    // 5. Response
    logger.info({ userId, count: result.data.length }, 'Resources fetched')
    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    return handleError(error, request.nextUrl.pathname)
  }
}

/**
 * POST /api/v1/{resource} - Create resource
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, organizationId } = await requireAuth(request)
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(
      RateLimitKeys.byUser(userId),
      RATE_LIMITS.authenticated
    )
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
        { status: 429 }
      )
    }
    
    // Validate request body
    const body = await request.json()
    const schema = z.object({
      // Define schema
    })
    const validated = schema.parse(body)
    
    // Business logic
    const supabase = await createClient()
    const repository = createResourceRepository(supabase)
    const resource = await repository.create({
      ...validated,
      organization_id: organizationId,
      created_by: userId,
    })
    
    // Invalidate cache
    await cache.deletePattern(`resource:org:${organizationId}*`)
    
    logger.info({ resourceId: resource.id }, 'Resource created')
    return NextResponse.json(
      { success: true, data: resource },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error, request.nextUrl.pathname)
  }
}
```

### 2. Server Action Template

```typescript
// src/actions/{module}/{action-name}.ts
'use server'

import { createClient } from '@/src/lib/supabase/server'
import { getAuthContext } from '@/src/lib/utils/auth-context'
import { withActionRateLimit } from '@/src/lib/middleware/action-wrapper'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { z } from 'zod'

const createResourceSchema = z.object({
  // Define schema
})

export async function createResource(
  input: CreateResourceInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      // 1. Validate input
      const validated = createResourceSchema.parse(input)
      
      // 2. Get auth context
      const { userId, organizationId } = await getAuthContext()
      
      // 3. Business logic (via service)
      const supabase = await createClient()
      const service = createResourceService(supabase)
      const resource = await service.create({
        ...validated,
        organization_id: organizationId,
        created_by: userId,
      })
      
      // 4. Response
      return successResponse({ id: resource.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
```

### 3. Validation with Zod

```typescript
import { z } from 'zod'

// Request schemas
export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  period: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'YEARLY']),
  target_date: z.string().datetime().optional(),
})

export const updateGoalSchema = createGoalSchema.partial()

// Response schemas (for OpenAPI)
export const GoalResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['active', 'completed', 'archived']),
  period: z.string(),
  owner_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
```

---

## Versioning Strategy

### Current Version: v1

**Path-based versioning:**
- `/api/v1/goals`
- `/api/v2/goals` (future)

### Version Lifecycle

1. **v1 (Current):** Stable, production-ready
2. **v2 (Future):** Breaking changes, new features
3. **Deprecation:** 6 months notice before removal

### Backward Compatibility

- ✅ Add new fields (non-breaking)
- ✅ Add new endpoints (non-breaking)
- ❌ Remove fields (breaking)
- ❌ Change field types (breaking)
- ❌ Remove endpoints (breaking)

---

## Best Practices

### 1. **Always Use Service Layer**

❌ **Don't:**
```typescript
// Direct database access in API route
const { data } = await supabase.from('goals').select('*')
```

✅ **Do:**
```typescript
// Use service layer
const service = createGoalsService(supabase)
const goals = await service.getGoals(organizationId)
```

### 2. **Validate All Inputs**

```typescript
const schema = z.object({ /* ... */ })
const validated = schema.parse(body) // Throws ZodError if invalid
```

### 3. **Handle Errors Gracefully**

```typescript
try {
  // ...
} catch (error) {
  return handleError(error, request.nextUrl.pathname)
}
```

### 4. **Use Rate Limiting**

```typescript
const rateLimitResult = checkRateLimit(
  RateLimitKeys.byUser(userId),
  RATE_LIMITS.authenticated
)
```

### 5. **Log Important Events**

```typescript
logger.info({ userId, goalId }, 'Goal created')
logger.error({ err: error }, 'Failed to create goal')
```

### 6. **Cache When Appropriate**

```typescript
const cacheKey = CacheKeys.goals(organizationId)
const cached = await cache.get(cacheKey)
if (cached) return NextResponse.json({ success: true, data: cached })
```

---

## OpenAPI Documentation

Full OpenAPI 3.0 specification available at:
- **File:** `docs/api/openapi.yaml`
- **UI:** `/api/docs` (when Swagger UI is implemented)

---

## Testing

### API Testing

```typescript
// __tests__/integration/api/goals.test.ts
describe('GET /api/v1/goals', () => {
  it('should return goals for authenticated user', async () => {
    const response = await fetch('/api/v1/goals', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
```

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** RLS policies enforce organization isolation
3. **Rate Limiting:** Prevents abuse and DoS attacks
4. **Input Validation:** Zod schemas prevent injection attacks
5. **CORS:** Configured for allowed origins only
6. **HTTPS:** Required in production

---

## Performance Optimization

1. **Caching:** Redis cache for frequently accessed data
2. **Pagination:** All list endpoints support pagination
3. **Database Indexes:** Optimized queries with proper indexes
4. **Connection Pooling:** Supabase connection pooler
5. **Response Compression:** Gzip compression enabled

---

## Future Enhancements

- [ ] GraphQL API endpoint
- [ ] WebSocket support for real-time updates
- [ ] API key authentication for service accounts
- [ ] Webhook subscriptions
- [ ] Batch operations endpoint
- [ ] GraphQL subscriptions

---

## References

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase REST API](https://supabase.com/docs/reference/javascript/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Design Best Practices](https://restfulapi.net/)

---

**Document Maintained By:** Development Team  
**Last Review:** 2025-11-17

