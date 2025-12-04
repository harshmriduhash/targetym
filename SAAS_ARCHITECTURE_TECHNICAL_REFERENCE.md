# Targetym SaaS Architecture - Technical Reference

**Quick Navigation to Key SaaS Files**

---

## Authentication & Multi-Tenancy

### Clerk Authentication Setup
- **File:** `app/layout.tsx` (lines 30-50)
- **Purpose:** ClerkProvider configuration with redirects
- **Key Features:** afterSignInUrl=/dashboard, OAuth support
- **SaaS Element:** Session management, user identity

```tsx
<ClerkProvider
  signInUrl="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/dashboard"
  afterSignOutUrl="/"
>
```

### Route Protection & Redirects
- **File:** `middleware.ts` (lines 1-103)
- **Purpose:** Protect routes, enforce authentication
- **Key Features:** Public route matching, security headers, CSP policy
- **SaaS Element:** Access control, request filtering

```typescript
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})
```

### User Profile Sync with Clerk
- **File:** `src/lib/auth/clerk.ts` (lines 1-120)
- **Functions:**
  - `getCurrentUserId()` - Get authenticated user ID
  - `getCurrentUser()` - Get full user object
  - `getUserProfile()` - Fetch Supabase profile
  - `syncClerkUserToSupabase()` - Sync on webhook
  - `getUserOrganizationId()` - Get org context
  - `isAuthenticated()` - Check auth status
  - `requireAuth()` - Enforce auth (throws if not)
- **SaaS Element:** User provisioning, multi-org assignment

### Webhook Handler
- **File:** `app/api/webhooks/clerk/route.ts`
- **Purpose:** Handle Clerk events (user.created, user.updated, user.deleted)
- **SaaS Element:** Automatic profile creation on signup

**Key Events:**
```typescript
// On signup
const evt = await svix.verify(payload, headers)
if (evt.type === 'user.created') {
  // Create Supabase profile automatically
}
```

---

## Multi-Tenancy Architecture

### Organizations Table (Core)
- **File:** `supabase/migrations/20250109000000_create_complete_schema.sql` (lines 9-24)
- **Purpose:** Multi-tenant container for all data
- **Columns:**
  - `id` UUID - Organization identifier
  - `name` - Organization name
  - `slug` - URL-friendly identifier (UNIQUE)
  - `subscription_tier` - free|pro|enterprise
  - `subscription_status` - active|inactive|suspended|trial
  - `trial_ends_at` - Trial expiration
  - `settings` JSONB - Configuration store
- **SaaS Element:** Core tenant isolation, subscription tracking

### Profiles Table (User-Org Mapping)
- **File:** `supabase/migrations/20250109000000_create_complete_schema.sql` (lines 26-51)
- **Purpose:** User profiles linked to organizations
- **Key Columns:**
  - `id` UUID - Clerk user ID (FK to auth.users)
  - `organization_id` - Tenant identifier (FK to organizations)
  - `role` - admin|hr|manager|employee
  - `manager_id` - For hierarchical relationships
  - `employment_status` - active|inactive|on_leave|terminated
  - `timezone` - User preference
- **SaaS Element:** User provisioning, role assignment, org membership

### RLS (Row-Level Security) Policies
- **File:** `supabase/migrations/20250109000001_rls_policies_complete.sql`
- **Purpose:** Enforce data isolation at database level
- **Helper Functions:**
  - `get_user_organization_id()` - Get user's org
  - `has_role(role_text)` - Check specific role
  - `has_any_role(role_array)` - Check multiple roles
  - `is_manager_of(employee_id)` - Check management relationship

**Example Policy:**
```sql
CREATE POLICY goals_select ON goals
  FOR SELECT
  USING (organization_id = get_user_organization_id());
```

**SaaS Element:** Database-enforced isolation, cannot be bypassed

---

## Database Schema

### Module: Goals & OKRs (3 tables)
- **File:** `supabase/migrations/20250109000000_create_complete_schema.sql` (lines 53-113)
- **Tables:**
  - `goals` - Goal records (id, owner_id, organization_id, status, progress, visibility, tags)
  - `key_results` - Measurable outcomes (auto-calculated progress_percentage)
  - `goal_collaborators` - Team collaboration (with role: owner|contributor|viewer)
- **SaaS Feature:** Goals management module

### Module: Recruitment (4 tables)
- **File:** `supabase/migrations/20250109000000_create_complete_schema.sql` (lines 115-185)
- **Tables:**
  - `job_postings` - Job descriptions (salary_min, salary_max, remote_allowed)
  - `candidates` - Applicants (ai_cv_score, ai_cv_recommendation)
  - `interviews` - Interview records
  - `candidate_notes` - Communication history
- **SaaS Feature:** Recruitment pipeline module

### Module: Performance (6 tables)
- **File:** `supabase/migrations/20250109000000_create_complete_schema.sql` (lines 187-250)
- **Tables:**
  - `performance_reviews` - Review records
  - `performance_criteria` - Evaluation framework
  - `performance_ratings` - Ratings per criteria
  - `performance_goals` - Goals from reviews
  - `peer_feedback` - 360 feedback
  - `career_development` - Career planning
- **SaaS Feature:** Performance management module

### Settings Tables (Comprehensive Configuration)
- **File:** `supabase/migrations/20251012105148_add_settings_tables.sql` (lines 1-130)
- **Tables:**
  - `organization_settings` - Org-wide config
  - `user_settings` - User preferences
- **Settings Include:**
  - AI features (provider, enabled flags, model config)
  - Integrations (Slack, Teams, Asana, Notion, GitHub, GitLab, Jira)
  - Security (2FA, password policies, session timeout, IP whitelist)
  - Data retention (audit logs, deleted records)
  - Feature flags (goals, recruitment, performance, analytics)
  - Compliance (GDPR, data region, anonymization)
  - Branding (logo, colors, domain)
  - Localization (language, timezone, date format, currency)

**SaaS Element:** Feature gates, org customization, compliance controls

### Feature Flags Tables
- **File:** Database schema
- **Tables:**
  - `feature_flags` - Flag definitions (name, enabled, rollout_percentage)
  - `feature_flag_overrides` - User-level overrides
- **SaaS Feature:** A/B testing, canary deployments, feature control

---

## API Design

### Versioned API Example
- **File:** `src/app/api/v1/goals/route.ts`
- **Endpoint:** `GET /api/v1/goals`
- **Features:**
  - Clerk authentication check
  - Rate limiting per user
  - Cache layer (5min TTL)
  - Pagination support
  - Error handling with consistent response format
- **SaaS Element:** API versioning, rate limiting, caching

**Response Format:**
```json
{
  "success": true,
  "error": null,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

### Basic API Example
- **File:** `app/api/goals/route.ts`
- **Features:** Simple CRUD, auth check, basic error handling
- **Note:** Inconsistent versioning (unversioned vs /v1/)

### API Routes by Module

**Goals API:**
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `GET /api/goals/[id]` - Get goal
- `PATCH /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal
- `/api/v1/goals` - Versioned endpoints

**Recruitment API:**
- `GET /api/recruitment/jobs` - List jobs
- `POST /api/recruitment/jobs` - Create job
- `PATCH /api/recruitment/jobs/[id]` - Update job
- `GET /api/recruitment/candidates` - List candidates
- `POST /api/recruitment/candidates` - Add candidate
- `PATCH /api/recruitment/candidates/[id]/status` - Update candidate status

**Performance API:**
- `GET /api/performance/reviews` - List reviews
- `POST /api/performance/reviews` - Create review
- `PATCH /api/performance/reviews/[id]` - Update review
- `POST /api/performance/feedback` - Create feedback

**AI API:**
- `POST /api/ai/score-cv` - Score resume with AI
- `POST /api/ai/recommend-career` - Get career recommendations

**Health/System:**
- `GET /api/health` - Health check
- `GET /api/v1/ready` - Readiness check (DB connection test)
- `POST /api/webhooks/clerk` - Clerk webhook endpoint

---

## Rate Limiting

### Implementation
- **File:** `src/lib/middleware/rate-limiter.ts`
- **Technology:** Upstash Redis (managed service)
- **Strategy:** Sliding window algorithm
- **Applied To:**
  - `/api/v1/goals` - 20 req/min (authenticated users)
  - Login endpoints - 5 req/15 min
  - Most other endpoints - Not protected (GAP)

**Configuration:**
```typescript
const RATE_LIMITS = {
  authenticated: '20 req/min',
  unauthenticated: '5 req/min',
  login: '5 req/15 min'
}
```

### Usage in Routes:
```typescript
const rateLimitResult = checkRateLimit(
  RateLimitKeys.byUser(userId),
  RATE_LIMITS.authenticated
)

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: 'RATE_LIMIT_EXCEEDED' },
    { 
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult)
    }
  )
}
```

---

## Feature Flags & A/B Testing

### Feature Flag Service
- **File:** `src/lib/analytics/ab-testing.ts`
- **Class:** `ABTestingService`
- **Methods:**
  - `isFeatureEnabled(userId, flagName)` - Check if feature enabled for user
  - `hashString(input)` - Deterministic hashing for consistent bucketing
  - Supports percentage-based rollouts and user overrides

**Usage:**
```typescript
const enabled = await ABTestingService.isFeatureEnabled(
  userId,
  'new_oauth_flow'
)

if (enabled) {
  // Show new feature to user
}
```

### Feature Flag Admin Panel
- **File:** `app/dashboard/admin/feature-flags/`
- **Components:**
  - `feature-flags-content.tsx` - Main content
  - `feature-flag-toggle.tsx` - Toggle component
  - `page.tsx` - Page wrapper
- **Features:**
  - Enable/disable flags
  - Set rollout percentage (0-100%)
  - View statistics
  - User-level overrides

**Access:** `/dashboard/admin/feature-flags` (admin only)

---

## Server Actions (Data Mutations)

### Pattern
- **Location:** `src/actions/`
- **Pattern:** 'use server' directive for server-side execution
- **Validation:** Zod schemas
- **Error Handling:** Consistent response format

**Example: Create Goal**
- **File:** `src/actions/goals/create-goal.ts`

```typescript
'use server'

export async function createGoal(input: { title, description }): 
  Promise<ActionResponse<Goal>> {
  // 1. Validate input
  const validated = createGoalSchema.parse(input)
  
  // 2. Get auth context
  const { userId, organizationId } = await getAuthContext()
  
  // 3. Check permissions
  if (role === 'employee') {
    return errorResponse('Forbidden', 'FORBIDDEN')
  }
  
  // 4. Execute business logic
  const goal = await goalsService.createGoal({
    ...validated,
    organization_id: organizationId,
    owner_id: userId
  })
  
  return successResponse(goal)
}
```

**Response Format:**
```typescript
interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

---

## Environment Variables

### Required
- **File:** `.env.local`
- **Reference:** `docs/ENV_VARIABLES_REFERENCE.md`

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.targetym.com
DATABASE_URL=postgresql://...
```

### Optional
```bash
# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Integrations
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
```

---

## Deployment

### Render Configuration
- **File:** `render.yaml`
- **Key Settings:**
  - Region: Frankfurt (EU)
  - Node: 24.9.0
  - pnpm: 10.18.1
  - Build: `pnpm install && pnpm run build`
  - Start: `pnpm run start`
  - Health Check: `/api/health`

### Deployment Scripts
- **Bash:** `SPRINT1_STAGING_DEPLOY.sh`
- **PowerShell:** `SPRINT1_STAGING_DEPLOY.ps1`
- **Documentation:** `docs/DEPLOYMENT_RENDER_CLERK_SUPABASE.md`

---

## Security Configuration

### Middleware Security Headers
- **File:** `middleware.ts` (lines 60-80+)
- **Headers Set:**
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), ...`
  - `Content-Security-Policy: ...` (strict)

### Input Validation
- **Technology:** Zod schemas
- **Location:** `src/lib/validations/`
- **Files:**
  - `goals.schemas.ts` - Goal validation
  - `recruitment.schemas.ts` - Recruitment validation
  - `performance.schemas.ts` - Performance validation
  - `settings.schemas.ts` - Settings validation

---

## Monitoring & Observability

### Error Tracking
- **Service:** Sentry
- **Files:**
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
- **Features:** Error capture, source maps, performance monitoring

### Logging
- **File:** `src/lib/monitoring/logger.ts`
- **Features:** Structured logging for production

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/v1/ready` - Readiness check with DB connection test

---

## Key Statistics

| Metric | Value |
|--------|-------|
| Database Tables | 21 |
| Migration Files | 27+ |
| RLS Policies | 25+ |
| API Endpoints | 15+ |
| Role Types | 4 |
| Subscription Tiers | 3 |
| Settings Categories | 15+ |
| Feature Modules | 5 |

---

## Documentation Files

**Architecture & Design:**
- `docs/CLAUDE.md` - Architecture overview
- `docs/API_DESIGN.md` - API specification
- `docs/BACKEND_ARCHITECTURE_ANALYSIS.md` - Detailed analysis

**Deployment:**
- `docs/DEPLOYMENT_RENDER_CLERK_SUPABASE.md` - Full deployment guide
- `docs/ENV_VARIABLES_REFERENCE.md` - Environment setup
- `render.yaml` - Infrastructure as code

**Configuration:**
- `app/_docs/CLERK_CONFIGURATION.md` - Clerk setup
- `app/_docs/IMPLEMENTATION_SUMMARY.md` - Implementation details
- `.github/copilot-instructions.md` - Development guidelines

**Feature Documentation:**
- `docs/AB_TESTING_QUICK_START.md` - Feature flags
- `docs/CRUD_AUDIT_REPORT.md` - CRUD operations audit
- Examples in `examples/` directory

---

## Next Steps for SaaS Launch

### Week 1: Payment Integration
1. Integrate Stripe API
2. Create billing routes
3. Implement subscription status checks
4. Add payment UI

### Week 2: API Hardening
1. Expand rate limiting to all endpoints
2. Generate OpenAPI documentation
3. Add Swagger UI
4. Comprehensive API testing

### Week 3: Communication
1. Integrate transactional email service
2. Create email templates
3. Set up notification system
4. Customer onboarding emails

### Week 4: Launch Preparation
1. Security audit
2. Load testing
3. Documentation finalization
4. Go-live readiness

---

This technical reference provides quick access to all SaaS-critical files and their locations. Use it as a navigation guide when implementing new features or debugging issues.
