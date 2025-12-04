# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Targetym is an AI-powered HR management platform built with Next.js 15.5.4 (App Router with Turbopack), React 19, TypeScript (strict mode), Supabase (PostgreSQL), and Clerk for authentication. The platform includes Goals & OKRs, Recruitment Pipeline, Performance Management, and AI-powered insights.

**Tech Stack Summary:**
- **Frontend:** Next.js 15.5.4, React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui (Radix UI)
- **Backend:** Supabase (PostgreSQL + RLS), Server Actions
- **Auth:** Clerk (authentication) synced with Supabase profiles
- **State:** React Query (@tanstack/react-query) for server state
- **Forms:** React Hook Form + Zod validation
- **AI:** OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet (optional)

## Development Commands

### Essential Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build with Turbopack
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report (80% threshold)
npm run test:unit        # Unit tests only (__tests__/unit)
npm run test:integration # Integration tests (__tests__/integration)
npm run test:ci          # CI mode with coverage

# Supabase
npm run supabase:start   # Start local Supabase (required for dev)
npm run supabase:stop    # Stop local Supabase
npm run supabase:reset   # Reset DB and apply all migrations
npm run supabase:push    # Push migrations to production
npm run supabase:types   # Generate TypeScript types from schema
npm run supabase:test    # Run RLS policy tests
```

### Running a Single Test

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create goal"

# Run specific test suite
npm run test:unit -- goals.service.test.ts
```

## Architecture

### Key Architectural Patterns

**Authentication Flow:**
- Clerk handles user authentication (sign-in/sign-up/sessions/OAuth)
- Clerk user IDs are synced to Supabase `profiles` table via webhooks
- User profiles stored in `profiles` table with Clerk user ID as primary key
- Protected routes via Clerk middleware (`clerkMiddleware`) in `middleware.ts`
- Public routes: `/`, `/auth/*`, `/api/auth/*`, `/api/health`, `/api/webhooks/clerk`
- Organization-aware routing: `/dashboard` and `/app` routes require valid Clerk session
- Session management via Clerk with automatic token refresh
- Webhook endpoint at `/api/webhooks/clerk` syncs Clerk users to Supabase profiles

**Data Access Pattern:**
- Server Actions in `src/actions/*` for all mutations
- Service layer in `src/lib/services/*` for business logic
- Supabase RLS policies enforce multi-tenant isolation
- All queries filtered by `organization_id`
- Type-safe queries using generated `database.types.ts`

**Multi-Tenancy:**
- Organization-based data isolation via RLS
- `get_user_organization_id()` helper function in Supabase
- All tables have `organization_id` foreign key
- RLS policies automatically filter by user's organization

**Server vs Client Components:**
- Default to Server Components for data fetching
- Use `'use client'` only for interactivity (forms, UI state, React Query hooks)
- Server Actions marked with `'use server'` directive
- Supabase client creation:
  - Server: `createClient()` from `@/src/lib/supabase/server` (uses cookies via next/headers)
  - Client: `createClient()` from `@/src/lib/supabase/client` (browser-based)
  - Middleware: `createClient()` from `@/src/lib/supabase/middleware` (special middleware pattern)

**State Management:**
- Server state: React Query (`@tanstack/react-query`) with devtools
- Global providers in `app/layout.tsx`: ClerkProvider → ReactQueryProvider → ThemeProvider
- Local state: useState, useReducer for component-level state
- Form state: React Hook Form with Zod resolvers

### Module Organization

```
src/
├── actions/          # Server Actions (Next.js)
│   ├── goals/       # 5 actions: create-goal, update-goal, etc.
│   ├── recruitment/ # 6 actions: create-job-posting, update-candidate-status, etc.
│   ├── performance/ # 3 actions: create-review, update-review, create-feedback
│   └── ai/          # 3 actions: score-cv, synthesize-performance, recommend-career
├── components/       # React components (UI only)
│   ├── goals/
│   ├── recruitment/
│   └── performance/
├── lib/
│   ├── services/    # Business logic layer
│   │   ├── goals.service.ts
│   │   ├── recruitment.service.ts
│   │   ├── performance.service.ts
│   │   └── ai.service.ts
│   ├── validations/ # Zod schemas
│   ├── utils/       # Helpers (errors, response)
│   └── supabase/    # DB clients (server, client, middleware)
└── types/
    ├── database.types.ts  # Auto-generated from Supabase schema
    └── modules.types.ts   # Application types
```

### Critical Service Layer Pattern

**Services** handle all database operations and business logic (singleton pattern):

```typescript
// Example: GoalsService pattern (src/lib/services/goals.service.ts)
export class GoalsService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient() // Server client only (from @/src/lib/supabase/server)
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const supabase = await this.getClient()

    const goalData: GoalInsert = { /* prepare data */ }

    // @ts-expect-error: Known Supabase types issue with insert
    const { data: insertedData, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single()

    if (error) throw new Error(`Failed to create goal: ${error.message}`)
    return insertedData as Goal
  }
}

export const goalsService = new GoalsService() // Singleton export
```

**Server Actions** call services and handle auth + validation:

```typescript
'use server'
import { goalsService } from '@/src/lib/services/goals.service'
import { createGoalSchema } from '@/src/lib/validations/goals.schemas'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'

export async function createGoal(input: CreateGoalInput): Promise<ActionResponse<{ id: string }>> {
  try {
    // 1. Validate with Zod
    const validated = createGoalSchema.parse(input)

    // 2. Get authenticated user context (uses Clerk auth internally)
    const { userId, organizationId } = await getAuthContext()

    // 3. Call service with enriched data
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
}
```

**Key Patterns:**
- Services are server-side only (`'use server'` in service files)
- Server Actions handle authentication via `getAuthContext()` which uses Clerk's `auth()` function
- `getAuthContext()` is defined in `@/src/lib/auth/server-auth` and returns `{ userId, organizationId, role }`
- Actions automatically get user's `organization_id` from the `profiles` table
- Use `successResponse()` and `errorResponse()` helpers for consistent API responses
- Use `handleServiceError()` to convert errors to `AppError` with codes
- Custom errors: `NotFoundError`, `ForbiddenError` (in `@/src/lib/utils/errors`)

### Database Schema Essentials

**Core Tables:**
- `organizations` - Multi-tenant container
- `profiles` - User profiles (linked to Supabase Auth users)
- `goals`, `key_results`, `goal_collaborators` - Goals module
- `job_postings`, `candidates`, `interviews` - Recruitment module
- `performance_reviews`, `performance_ratings`, `peer_feedback` - Performance module

**RLS Security Model:**
- All tables have organization isolation policies
- Role-based policies: `admin`, `hr`, `manager`, `employee`
- Helper functions: `get_user_organization_id()`, `has_role()`, `is_manager_of()`
- Test RLS with: `npm run supabase:test`

**Database Views:**
- `goals_with_progress` - Goals with calculated progress
- `job_postings_with_stats` - Job postings with candidate counts
- `performance_review_summary` - Review aggregations

### Type Safety

**Generated Types:**
```typescript
// Auto-generated from Supabase schema
import type { Database } from '@/src/types/database.types'

type Tables = Database['public']['Tables']
type Goal = Tables['goals']['Row']
type GoalInsert = Tables['goals']['Insert']
type GoalUpdate = Tables['goals']['Update']
```

**Path Alias:**
- Use `@/*` for imports (maps to project root)
- Example: `import { createClient } from '@/src/lib/supabase/server'`

### UI Development Patterns

**Component Library:**
- Using shadcn/ui (Radix UI primitives + Tailwind CSS)
- Components located in `components/ui/`
- Install new components: `npx shadcn@latest add <component-name>`
- Custom components in `src/components/` organized by module (goals/, recruitment/, performance/)

**Styling:**
- Tailwind CSS 4 with custom config
- CSS utility classes for styling
- Dark mode support via `next-themes` (ThemeProvider in layout)
- Responsive design: mobile-first approach
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

**Form Handling:**
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGoalSchema, type CreateGoalInput } from '@/src/lib/validations/goals.schemas'
import { createGoal } from '@/src/actions/goals/create-goal'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function CreateGoalForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: { /* ... */ }
  })

  async function onSubmit(data: CreateGoalInput) {
    startTransition(async () => {
      const result = await createGoal(data)
      if (result.success) {
        toast.success('Goal created successfully')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

**Data Fetching (Client Components):**
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

export function GoalsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      // Fetch from Server Action or API route
      const response = await fetch('/api/goals')
      return response.json()
    }
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorState />
  return <div>{/* render goals */}</div>
}
```

**Toast Notifications:**
- Using `sonner` library (imported as `toast`)
- Configured in `app/layout.tsx` with `<Toaster richColors position="top-right" />`
- Usage: `toast.success()`, `toast.error()`, `toast.loading()`, `toast.promise()`

### AI Features

AI services use OpenAI or Anthropic APIs with graceful fallbacks:

```typescript
// AI service pattern
async scoreCV(candidateId: string) {
  if (!process.env.OPENAI_API_KEY) {
    return { score: null, error: 'AI not configured' }
  }
  // Call OpenAI API
}
```

Optional AI features:
- CV Scoring (0-100 with recommendations)
- Performance Synthesis (trends and insights)
- Career Recommendations (personalized paths)

## Testing Philosophy

**Coverage Requirements:**
- 80% minimum coverage (enforced in jest.config.ts)
- TDD approach: write tests before implementation
- Test files: `__tests__/unit/**/*.test.ts`

**Test Structure:**
```typescript
import { goalsService } from '@/src/lib/services/goals.service'

describe('GoalsService', () => {
  it('should create goal', async () => {
    // Arrange
    const mockData = { title: 'Test Goal', ... }

    // Act
    const result = await goalsService.createGoal(mockData)

    // Assert
    expect(result).toMatchObject(mockData)
  })
})
```

**Testing Utilities:**
- Setup: `test-utils/setup.ts` (configures Jest + React Testing Library)
- Helpers: `test-utils/test-helpers.ts`
- Render: `test-utils/render-with-providers.tsx` (wraps components with providers)

**Mocking:**
- MSW (Mock Service Worker) for API mocking
- `jest-mock-extended` for type-safe mocks
- Mock Supabase client in tests:
  ```typescript
  jest.mock('@/src/lib/supabase/server', () => ({
    createClient: jest.fn(() => mockSupabaseClient)
  }))
  ```

**Accessibility Testing:**
- `jest-axe` for automated a11y testing
- Example:
  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe'
  expect.extend(toHaveNoViolations)

  it('should have no a11y violations', async () => {
    const { container } = render(<Component />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  ```

## Common Workflows

### Adding a New Feature

1. **Database First:**
   ```bash
   # Create migration
   supabase migration new add_feature_table
   # Edit migration file
   # Apply migration
   npm run supabase:reset
   # Generate types
   npm run supabase:types
   ```

2. **Service Layer:**
   - Create service in `src/lib/services/`
   - Add business logic methods
   - Write unit tests

3. **Server Actions:**
   - Create actions in `src/actions/`
   - Add Zod validation schemas
   - Call service methods

4. **UI Components:**
   - Create components in `src/components/`
   - Use shadcn/ui components
   - Call Server Actions via form actions or transitions

### Working with Supabase

**Type Generation After Schema Changes:**
```bash
npm run supabase:types
```

**Testing RLS Policies:**
```sql
-- In migration file, add RLS policies
CREATE POLICY "Users can view own org goals"
  ON goals FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Test with
npm run supabase:test
```

**Database Access URLs (Local):**
- Studio UI: http://localhost:54323
- API: http://localhost:54321
- Database: postgresql://postgres:postgres@localhost:54322/postgres

### Deployment

**Environment Variables Required:**
```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Database Connection (PostgreSQL via Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
CLERK_SECRET_KEY=your-secret-key
CLERK_WEBHOOK_SECRET=your-webhook-secret

# AI Features (Optional)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Application
NODE_ENV=development
```

**Environment Setup:**
- Copy `.env.production.example` to `.env.local` for local development
- Get Clerk keys from https://dashboard.clerk.com/last-active?path=api-keys
- Configure OAuth providers in Clerk Dashboard → SSO & Social
- Set up Clerk webhook at `/api/webhooks/clerk` for user sync
- Webhook URL: `https://your-domain.com/api/webhooks/clerk` (configure in Clerk Dashboard → Webhooks)
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`

**Production Migration:**
```bash
supabase link --project-ref your-project-ref
npm run supabase:push
```

## Code Standards

- TypeScript strict mode (enforced in tsconfig.json)
- ESLint with Next.js rules
- Conventional commits for changelog generation
- Server Actions for all mutations (no client-side DB access)
- Zod for runtime validation
- Error handling via custom errors (`NotFoundError`, `ForbiddenError`)

## Debugging & Troubleshooting

**Common Issues:**

1. **Type errors after schema changes:**
   ```bash
   npm run supabase:types  # Regenerate types
   npm run type-check      # Verify types
   ```

2. **RLS policy denying queries:**
   - Check user is authenticated: `supabase.auth.getUser()`
   - Verify `organization_id` in profiles table
   - Test policies: `npm run supabase:test`
   - Check Supabase logs in Studio: http://localhost:54323

3. **Server Actions not working:**
   - Ensure function has `'use server'` directive
   - Check authentication in action via `supabase.auth.getUser()`
   - Verify ActionResponse type is returned
   - Check browser Network tab for errors

4. **Database connection issues:**
   ```bash
   npm run supabase:start  # Start local Supabase
   # Check status at: http://localhost:54323
   ```

5. **Authentication issues:**
   - Verify Clerk keys are set in environment variables
   - Check user session via Clerk's `auth()` function in Server Actions
   - Verify `profiles` table is synced with Clerk users via webhook
   - Review auth logs in Clerk Dashboard
   - Ensure webhook at `/api/webhooks/clerk` is configured and receiving events

**Development Tools:**
- **React Query Devtools**: Enabled in dev mode (bottom-left icon)
- **Supabase Studio**: http://localhost:54323 (local DB admin)
- **Next.js Debug**: Add `NODE_OPTIONS='--inspect'` to dev script
- **VS Code Debugging**: Configure `.vscode/launch.json` for Next.js

**Logging:**
```typescript
// Server-side logging (visible in terminal)
console.log('[Service]', 'Creating goal:', data)

// Client-side logging (visible in browser console)
console.log('[Component]', 'Rendering with:', props)
```

## Important Constraints

**Security:**
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` or `CLERK_SECRET_KEY` to client
- Always use `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for client-side
- RLS policies are mandatory for all tables
- Clerk middleware (`clerkMiddleware`) protects all routes except public routes
- Verify webhook signatures using `CLERK_WEBHOOK_SECRET` to prevent unauthorized access

**Supabase Client Usage:**
- Server Components/Actions: Use `createClient()` from `server.ts`
- Client Components: Only when absolutely necessary
- Middleware: Has its own client creation pattern

**Type Safety:**
- Run `npm run type-check` before commits
- Regenerate types after schema changes
- Use generated Database types, not manual types

## Known Issues & Workarounds

**Supabase TypeScript Limitations:**
- Some Supabase type definitions require `@ts-expect-error` for insert/update operations
- See examples in `goals.service.ts:54,157,206`
- Pattern to use:
  ```typescript
  // @ts-expect-error: Known Supabase types issue with insert
  const { data, error } = await supabase.from('table').insert([data])
  ```
- This is a known Supabase TypeScript limitation, not a code issue

**Windows Development:**
- When running on Windows (as detected: platform `win32`), paths use backslashes
- Use path alias `@/*` for consistent imports across platforms
- Supabase CLI may require WSL for optimal performance

## Performance Optimization

**Server Components:**
- Use Server Components by default for better performance
- Data fetching happens on server (reduces client bundle)
- Only mark components as `'use client'` when necessary

**Code Splitting:**
- Next.js automatically code-splits by route
- Use dynamic imports for heavy components:
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Skeleton />
  })
  ```

**Database Performance:**
- Use views for complex queries: `goals_with_progress`, `job_postings_with_stats`
- Indexes on frequently queried columns (see migration files)
- Limit results with `.limit()` for lists
- Use `.select('specific,columns')` instead of `.select('*')`

**Caching:**
- React Query caches server state automatically
- Configure stale time for less frequent refetches:
  ```typescript
  useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  ```

**Bundle Size:**
- Turbopack for faster builds and HMR
- Tree-shaking enabled by default
- Check bundle: `npm run build` and review `.next/analyze`

## Documentation

Key docs in repository:
- `README.md` - Project overview and features
- `QUICK_START.md` - 5-minute setup guide
- `QUICK_REFERENCE.md` - Database commands and examples
- `DATABASE_COMMANDS.md` - Supabase CLI reference
- `AI_SETUP.md` - AI features configuration
- `DOCS_INDEX.md` - Complete documentation index
- `FRONTEND_OPTIMIZATIONS.md` - Frontend performance guide
- `RLS_AUDIT_SUMMARY.md` - RLS security audit

## Quick Reference

**Frequently Used Patterns:**

1. **Create a new Server Action:**
   ```bash
   # 1. Add Zod schema in src/lib/validations/
   # 2. Create action in src/actions/module-name/
   # 3. Import and use in component
   ```

2. **Add a new UI component:**
   ```bash
   npx shadcn@latest add <component-name>
   # Then customize in components/ui/
   ```

3. **Query database in service:**
   ```typescript
   const { data, error } = await supabase
     .from('table_name')
     .select('*')
     .eq('organization_id', orgId)
   ```

4. **Handle errors in Server Action:**
   ```typescript
   try {
     const result = await service.operation()
     return successResponse(result)
   } catch (error) {
     const appError = handleServiceError(error)
     return errorResponse(appError.message, appError.code)
   }
   ```
- always use camalcase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase
