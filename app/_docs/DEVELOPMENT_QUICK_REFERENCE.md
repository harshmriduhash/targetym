# Development Quick Reference

Fast lookup guide for common development tasks.

## Setup & Validation

| Task | Command | Purpose |
|------|---------|---------|
| Initial setup | `npm run setup` | Validate all environment variables |
| Check auth | `npm run check:auth` | Verify Clerk configuration |
| Health check | `npm run check:health` | Type check + linting |
| Full check | `npm run check:all` | All three checks above |
| Fresh start | `npm run dev:fresh` | Clean build + reset DB + dev server |
| Clean build | `npm run clean` | Remove build artifacts |

## Development Commands

| Task | Command | Purpose |
|------|---------|---------|
| Start dev | `npm run dev` | Development server with Turbopack |
| Build | `npm run build` | Production build |
| Start prod | `npm run start` | Production server |
| Type check | `npm run type-check` | TypeScript validation |
| Lint | `npm run lint` | ESLint check |
| Format | `npx eslint --fix src/` | Auto-fix lint issues |

## Testing

| Task | Command | Purpose |
|------|---------|---------|
| All tests | `npm test` | Run all tests |
| Watch mode | `npm run test:watch` | Auto-rerun on changes |
| Coverage | `npm run test:coverage` | Coverage report |
| Unit tests | `npm run test:unit` | Unit tests only |
| Integration | `npm run test:integration` | Integration tests |
| Single file | `npm test -- path/to/test.ts` | Run specific test |
| Pattern | `npm test -- --testNamePattern="pattern"` | Run matching tests |
| CI mode | `npm run test:ci` | CI with coverage |

## Database Management

| Task | Command | Purpose |
|------|---------|---------|
| Start DB | `npm run supabase:start` | Start local Supabase |
| Stop DB | `npm run supabase:stop` | Stop local Supabase |
| Reset DB | `npm run supabase:reset` | Reset + apply migrations |
| New migration | `npx supabase migration new <name>` | Create migration file |
| Apply migration | `npm run supabase:reset` | Apply pending migrations |
| Generate types | `npm run supabase:types` | Update database.types.ts |
| Push to prod | `npm run supabase:push` | Push migrations to production |
| Test RLS | `npm run supabase:test` | Test RLS policies |

## Environment Variables

### Required Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://...
```

### Optional Variables

```bash
# AI Features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Authentication Flow

### Sign-Up Flow
```
1. User visits /auth/sign-up
2. Clerk displays form
3. User submits
4. Clerk creates user
5. Webhook creates Supabase profile
6. Redirect to /dashboard
```

### Sign-In Flow
```
1. User visits /auth/sign-in
2. Clerk displays form
3. User submits credentials
4. Clerk authenticates
5. Redirect to /dashboard
```

### Protected Route Access
```
1. User (unauthenticated) visits /dashboard
2. Middleware checks auth
3. Redirect to /auth/sign-in
4. After sign-in, redirect to /dashboard
```

## Key Files & Locations

| Purpose | Path |
|---------|------|
| Auth middleware | `middleware.ts` |
| Clerk setup | `app/layout.tsx` |
| Sign-in page | `app/auth/sign-in/page.tsx` |
| Sign-up page | `app/auth/sign-up/page.tsx` |
| Webhook endpoint | `app/api/webhooks/clerk/route.ts` |
| Auth utilities | `src/lib/auth/server-auth.ts` |
| Auth context | `src/lib/auth/clerk.ts` |
| Database types | `src/types/database.types.ts` |
| Validations | `src/lib/validations/*.schemas.ts` |
| Services | `src/lib/services/*.service.ts` |
| Actions | `src/actions/*/*.ts` |
| Components | `src/components/` |

## Common Code Patterns

### Server Action with Auth

```typescript
'use server'

import { getAuthContext } from '@/src/lib/auth/server-auth'
import { createFeatureSchema } from '@/src/lib/validations/feature.schemas'

export async function createFeature(input: CreateFeatureInput) {
  try {
    const validated = createFeatureSchema.parse(input)
    const { userId, organizationId } = await getAuthContext()

    const result = await featureService.create({
      ...validated,
      owner_id: userId,
      organization_id: organizationId,
    })

    return successResponse(result)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
```

### Client Component with Forms

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFeature } from '@/src/actions/feature/create'
import { useTransition } from 'react'

export function CreateFeatureForm() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateFeatureInput>({
    resolver: zodResolver(createFeatureSchema),
  })

  function onSubmit(data: CreateFeatureInput) {
    startTransition(async () => {
      const result = await createFeature(data)
      if (result.success) {
        toast.success('Feature created')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

### React Query Data Fetching

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function FeaturesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['features'],
    queryFn: async () => {
      const response = await fetch('/api/features')
      return response.json()
    },
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorState />
  return <div>{/* render features */}</div>
}
```

### Zod Schema Validation

```typescript
import { z } from 'zod'

export const createFeatureSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>
```

### Service Layer Pattern

```typescript
import { createClient } from '@/src/lib/supabase/server'

export class FeatureService {
  private async getClient() {
    return createClient()
  }

  async create(data: CreateFeatureData): Promise<Feature> {
    const supabase = await this.getClient()

    const { data: result, error } = await supabase
      .from('features')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(`Failed to create feature: ${error.message}`)
    return result
  }
}

export const featureService = new FeatureService()
```

## Webhook Setup for Local Development

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Create Tunnel
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create tunnel
ngrok http 3001
# Output: Forwarding https://abc123.ngrok.io -> http://localhost:3001
```

### Step 3: Configure in Clerk Dashboard
```
Go to: https://dashboard.clerk.com → Webhooks
Create endpoint:
  URL: https://abc123.ngrok.io/api/webhooks/clerk
  Events: user.created, user.updated, user.deleted
Copy Signing Secret to CLERK_WEBHOOK_SECRET
```

### Step 4: Verify
```bash
npm run check:auth
# Should show webhook secret configured
```

## Debugging Tips

### TypeScript Errors
```bash
npm run type-check          # See all errors
npm run type-check:clean    # Clear cache and rebuild
```

### Auth Issues
```bash
npm run check:auth          # Verify Clerk config
npm run setup               # Check all env vars
# Check browser console (F12) for errors
```

### Database Issues
```bash
npm run supabase:start      # Ensure DB is running
npm run supabase:types      # Regenerate types after schema changes
npm run supabase:reset      # Reset DB with migrations
```

### Test Failures
```bash
npm test -- --verbose       # Verbose output
npm test -- path/to/test    # Single test file
npm run test:watch          # Watch mode for TDD
```

### Performance Issues
```bash
npm run build --verbose     # See what's slow
npm run dev:fresh           # Clean start
# Check Network tab in DevTools for slow requests
```

## Git Workflow

### Before Committing
```bash
npm run check:all          # Type check + lint + auth check
npm test                   # Run tests
npm run build              # Verify production build
```

### Commit Message Format
```
type(scope): description

[optional body]
[optional footer]
```

Examples:
```
feat(auth): add multi-factor authentication
fix(goals): resolve infinite redirect loop
docs(setup): update environment setup guide
refactor(services): simplify goal service
test(goals): add tests for goal creation
```

### Creating a Feature Branch
```bash
git checkout -b feature/feature-name
# Or: git checkout -b fix/bug-name
# Or: git checkout -b docs/doc-name

# After changes
npm run check:all
npm test
git add .
git commit -m "feat(scope): description"
git push origin feature/feature-name

# Create Pull Request on GitHub
```

## Performance Tips

### Development
- Use Turbopack for faster builds (`npm run dev`)
- ESLint caching speeds up linting
- Jest caching speeds up tests

### Production
- Next.js auto code-splitting by route
- Images optimized with next/image
- CSS pruning with Tailwind CSS 4
- Compression enabled by default

### Database Queries
- Use `.select('specific,columns')` instead of `*`
- Add `.limit()` for large result sets
- Use database views for complex queries
- Indexes on frequently queried columns

## Security Checklist

- [ ] Never expose `CLERK_SECRET_KEY` to client
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] Always verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all user input with Zod
- [ ] Use RLS policies in Supabase
- [ ] Keep dependencies updated

## Resources

| Resource | Link |
|----------|------|
| Documentation | See README.md, CLAUDE.md |
| Setup Help | DEVELOPER_SETUP.md |
| Troubleshooting | TROUBLESHOOTING.md |
| TypeScript Errors | TYPESCRIPT_ERRORS.md |
| Clerk Setup | CLERK_QUICK_START.md |
| Architecture | CLAUDE.md |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open DevTools | F12 |
| Console | F12 → Console |
| Network | F12 → Network |
| Sources/Debugger | F12 → Sources |
| Element Inspector | Ctrl+Shift+C |
| Quick Find | Ctrl+F |
| Search Project | Ctrl+Shift+F |

## Need Help?

1. Check this quick reference
2. Read relevant documentation
3. Run diagnostic: `npm run check:all`
4. Search error message in TROUBLESHOOTING.md
5. Check TYPESCRIPT_ERRORS.md for type issues
6. Ask the team with detailed information

Happy coding!
