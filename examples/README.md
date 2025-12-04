# Targetym Component Registry - Examples

Welcome to the Targetym Component Registry examples! This directory contains comprehensive, production-ready examples for all registry modules.

## Overview

The Targetym Component Registry is a collection of reusable, well-documented components and utilities for building modern HR management applications with Next.js 15, React 19, TypeScript, and Supabase.

## Available Examples

### Feature Modules

#### 1. Goals Management
**Path:** `goals-management/`

Complete OKR (Objectives and Key Results) management system with progress tracking and team collaboration.

- **basic.tsx** - Simple goal creation and listing
- **with-realtime.tsx** - Live updates using Supabase Realtime
- **with-optimistic-updates.tsx** - Instant UI feedback with React Query

**Key Features:**
- Hierarchical goal structure (parent-child)
- Progress tracking with visual indicators
- Multi-period support (quarterly, annual, custom)
- Team collaboration and visibility settings

[View Goals Management Examples →](./goals-management/README.md)

---

#### 2. Recruitment Pipeline
**Path:** `recruitment-pipeline/`

End-to-end recruitment workflow from job posting to candidate hiring.

- **basic.tsx** - Job postings and candidate management
- **with-filters.tsx** - Advanced filtering with presets
- **interview-scheduling.tsx** - Complete interview workflow

**Key Features:**
- Job posting creation and management
- Candidate pipeline tracking
- Interview scheduling with calendar integration
- AI-powered CV scoring (optional)
- Status tracking through hiring stages

[View Recruitment Pipeline Examples →](./recruitment-pipeline/README.md)

---

#### 3. Performance Management
**Path:** `performance-management/`

Employee performance reviews and development tracking.

- **basic.tsx** - Review creation and management
- **with-charts.tsx** - Performance analytics with visualizations

**Key Features:**
- 360-degree feedback collection
- Multiple rating categories
- Performance trend analysis
- Peer feedback integration
- Goal alignment

[View Performance Management Examples →](./performance-management/README.md)

---

### Utility Modules

#### 4. Cache Manager
**Path:** `cache-manager/`

Multi-layer caching system for optimal performance.

- **basic.ts** - Simple caching operations
- **with-redis.ts** - Distributed caching with Upstash Redis
- **with-invalidation.ts** - Advanced cache invalidation strategies

**Key Features:**
- In-memory and Redis caching
- Tag-based invalidation
- TTL (time-to-live) management
- Batch operations
- Cache analytics

[View Cache Manager Examples →](./cache-manager/README.md)

---

#### 5. Rate Limiter
**Path:** `rate-limiter/`

Production-ready rate limiting to prevent abuse.

- **server-action.ts** - Server Action protection
- **api-route.ts** - API route middleware

**Key Features:**
- Multiple rate limiting algorithms
- Tiered limits (free/premium)
- Cost-based limiting
- Per-endpoint configuration
- Analytics and monitoring

[View Rate Limiter Examples →](./rate-limiter/README.md)

---

## Quick Start

### 1. Installation

Each module can be installed independently:

```bash
# Install a specific module
npx shadcn@latest add goals-management
npx shadcn@latest add recruitment-pipeline
npx shadcn@latest add performance-management
npx shadcn@latest add cache-manager
npx shadcn@latest add rate-limiter

# Or install multiple at once
npx shadcn@latest add goals-management recruitment-pipeline
```

### 2. Prerequisites

Ensure you have the core dependencies:

```bash
npm install react-hook-form zod @tanstack/react-query
npm install @supabase/supabase-js @supabase/ssr
npm install recharts date-fns
npm install @upstash/redis @upstash/ratelimit
```

### 3. Environment Setup

Configure your environment variables:

```bash
# .env.local

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis (optional, for cache-manager and rate-limiter)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# AI Features (optional)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Database Setup

Initialize Supabase and run migrations:

```bash
# Start local Supabase
npm run supabase:start

# Apply migrations
npm run supabase:reset

# Generate TypeScript types
npm run supabase:types
```

## Module Categories

### By Type

**Feature Modules** (Complete UI + Logic):
- goals-management
- recruitment-pipeline
- performance-management

**Utility Modules** (Backend Logic):
- cache-manager
- rate-limiter

**UI Components**:
- All feature modules include shadcn/ui components
- Consistent design system
- Fully accessible (ARIA compliant)

### By Use Case

**Team Collaboration**:
- goals-management (team goals, visibility)
- performance-management (peer feedback)

**Process Management**:
- recruitment-pipeline (hiring workflow)
- performance-management (review cycles)

**Performance Optimization**:
- cache-manager (response caching)
- rate-limiter (abuse prevention)

## Architecture Overview

All modules follow these patterns:

```
module/
├── components/          # React components
│   ├── form.tsx        # Creation/editing forms
│   ├── list.tsx        # List views with filtering
│   └── detail.tsx      # Detail/view pages
├── lib/
│   ├── services/       # Business logic layer
│   └── validations/    # Zod schemas
└── actions/            # Next.js Server Actions
    ├── create.ts
    ├── read.ts
    ├── update.ts
    └── delete.ts
```

### Key Patterns

1. **Server Actions First**: All mutations via Server Actions
2. **Type Safety**: Full TypeScript strict mode
3. **Validation**: Runtime validation with Zod
4. **Authentication**: Supabase Auth integration
5. **Multi-tenancy**: Organization-based RLS policies
6. **Error Handling**: Standardized error responses

## Common Use Cases

### Building a Dashboard

```tsx
import { GoalsList } from '@/components/goals'
import { CandidatesList } from '@/components/recruitment'
import { ReviewsList } from '@/components/performance'

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <GoalsList initialFilters={{ status: 'active' }} />
      <CandidatesList initialFilters={{ status: 'interviewing' }} />
      <ReviewsList initialFilters={{ status: 'in_progress' }} />
    </div>
  )
}
```

### Adding Real-time Updates

```tsx
'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeGoals() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('goals-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals'
      }, () => {
        queryClient.invalidateQueries(['goals'])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
```

### Implementing Rate Limiting

```tsx
'use server'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const rateLimit = new Ratelimit({
  redis: new Redis({...}),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function createGoal(data: any) {
  const { success } = await rateLimit.limit(userId)

  if (!success) {
    return { error: 'Rate limit exceeded' }
  }

  // Create goal
  return { success: true }
}
```

### Adding Caching

```ts
import { cacheManager } from '@/lib/cache'

export async function getGoals(userId: string) {
  return cacheManager.getOrSet(
    `goals:${userId}`,
    async () => {
      // Only runs on cache miss
      return fetchGoalsFromDB(userId)
    },
    300 // Cache for 5 minutes
  )
}
```

## Testing

All examples include testing patterns:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Example test:

```ts
import { render, screen } from '@testing-library/react'
import { GoalsList } from '@/components/goals'

describe('GoalsList', () => {
  it('renders goals list', async () => {
    render(<GoalsList />)
    expect(screen.getByText('Goals & OKRs')).toBeInTheDocument()
  })
})
```

## Performance Optimization

### React Query Configuration

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

### Server Component Caching

```tsx
// app/goals/page.tsx
export const revalidate = 300 // Revalidate every 5 minutes

export default async function GoalsPage() {
  const goals = await getGoals() // Cached
  return <GoalsList initialData={goals} />
}
```

## Security Best Practices

1. **Row Level Security**: All tables use RLS policies
2. **Server Actions**: Never expose sensitive operations to client
3. **Rate Limiting**: Protect all public endpoints
4. **Input Validation**: Validate all inputs with Zod
5. **Authentication**: Check user auth in every Server Action
6. **Multi-tenancy**: Filter by organization_id automatically

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 14+, Android 10+

## Contributing

When adding new examples:

1. Follow existing file structure
2. Include comprehensive comments
3. Add TypeScript types
4. Write README documentation
5. Include error handling
6. Test all examples

## Support & Resources

- **Documentation**: See individual module READMEs
- **Project Docs**: `/CLAUDE.md`
- **Database Guide**: `/QUICK_REFERENCE.md`
- **Frontend Guide**: `/FRONTEND_OPTIMIZATIONS.md`
- **AI Setup**: `/AI_SETUP.md`

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0 (2025-11-15)

Initial release with:
- Goals Management module
- Recruitment Pipeline module
- Performance Management module
- Cache Manager utility
- Rate Limiter utility

---

**Need Help?**

1. Check module-specific READMEs
2. Review example code
3. Test RLS: `npm run supabase:test`
4. Check types: `npm run type-check`
5. Review Supabase Studio logs

**Happy coding!**
