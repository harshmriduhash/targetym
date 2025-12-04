# Developer Setup Guide for Targetym

Welcome to the Targetym development team! This guide will help you get up and running in less than 15 minutes.

## Prerequisites

- **Node.js:** >= 24.0.0 (Check: `node --version`)
- **pnpm:** >= 10.0.0 (Check: `pnpm --version`)
- **Git:** Latest stable version

### Installing pnpm

If you don't have pnpm installed, use one of these methods:

**Method 1: Using Corepack (Recommended)**
```bash
# Enable Corepack (comes with Node.js 16.10+)
corepack enable

# Prepare and activate pnpm 10.18.1 (matches project version)
corepack prepare pnpm@10.18.1 --activate

# Verify installation
pnpm --version  # Should show 10.18.1
```

**Method 2: Using npm**
```bash
npm install -g pnpm@10.18.1
pnpm --version
```

**Method 3: Using Homebrew (macOS/Linux)**
```bash
brew install pnpm
pnpm --version
```

**Method 4: Standalone installer**
```bash
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Quick Setup (15 minutes)

### Step 1: Clone and Install (3 minutes)

```bash
# Clone repository
git clone <repo-url>
cd targetym

# Install dependencies
pnpm install

# Verify installation
npm run type-check
```

### Step 2: Configure Environment Variables (5 minutes)

```bash
# Copy environment template
cp .env.production.example .env.local
```

Then add the following values:

#### Clerk Authentication (Required)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → your publishable key
   - `CLERK_SECRET_KEY` → your secret key
3. Get webhook secret from Dashboard → Webhooks

#### Supabase (Required)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your project keys:
   - `NEXT_PUBLIC_SUPABASE_URL` → project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → service role key

#### Application URL (Required)
```
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3: Validate Setup (2 minutes)

```bash
# Validate all environment variables
npx tsx scripts/validate-env.ts

# You should see: "SUCCESS: All required environment variables are configured!"
```

### Step 4: Start Development (5 minutes)

```bash
# Terminal 1: Start Supabase (database)
npm run supabase:start

# Terminal 2: Start Next.js development server
npm run dev

# Visit: http://localhost:3001
```

## Verify Everything Works

### 1. Create a Test Account

```
1. Navigate to http://localhost:3001/auth/sign-up
2. Create account with test email
3. You should be redirected to http://localhost:3001/dashboard
```

### 2. Check Supabase Profile Created

```
1. Open Supabase Studio: http://localhost:54323
2. Go to Tables → profiles
3. Find your test user profile (ID = your Clerk user ID)
4. Verify email and full_name are synced
```

### 3. Test Sign-Out and Sign-In

```
1. On dashboard, click your avatar → Sign Out
2. Should redirect to http://localhost:3001
3. Visit http://localhost:3001/auth/sign-in
4. Sign in with your test account
5. Should redirect to http://localhost:3001/dashboard
```

If all three tests pass, you're ready to develop!

## Essential Commands

### Development

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode for TDD
npm run test:coverage    # Coverage report
npm run test:unit        # Unit tests only
npm run test:ci          # CI mode
```

### Database

```bash
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:reset   # Reset database with migrations
npm run supabase:types   # Regenerate TypeScript types
```

### Validation & Setup

```bash
npx tsx scripts/validate-env.ts  # Check environment setup
```

## Development Workflow

### 1. Creating a New Server Action

```bash
# 1. Create Zod schema
# File: src/lib/validations/feature.schemas.ts
export const createFeatureSchema = z.object({
  title: z.string().min(1),
})

# 2. Create Server Action
# File: src/actions/feature/create.ts
'use server'
import { createFeatureSchema } from '@/src/lib/validations/feature.schemas'
import { getAuthContext } from '@/src/lib/auth/server-auth'

export async function createFeature(input: CreateFeatureInput) {
  const validated = createFeatureSchema.parse(input)
  const { userId, organizationId } = await getAuthContext()
  // Implementation
}

# 3. Use in Component
# File: src/components/feature/CreateForm.tsx
'use client'
import { createFeature } from '@/src/actions/feature/create'
import { useTransition } from 'react'

export function CreateFeatureForm() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(data) {
    startTransition(async () => {
      const result = await createFeature(data)
    })
  }
}
```

### 2. Adding a Database Change

```bash
# 1. Create migration
npx supabase migration new description_of_change

# 2. Edit migration file in supabase/migrations/
# 3. Test locally
npm run supabase:reset

# 4. Generate types
npm run supabase:types

# 5. Push to production (when ready)
npm run supabase:push
```

### 3. Writing Tests

```typescript
// __tests__/unit/lib/services/feature.service.test.ts
describe('FeatureService', () => {
  it('should create feature', async () => {
    // Arrange
    const input = { title: 'Test' }

    // Act
    const result = await featureService.create(input)

    // Assert
    expect(result.title).toBe('Test')
  })
})
```

## Architecture Overview

### Key Patterns

**Authentication:**
- Clerk handles user authentication
- Webhooks sync users to Supabase `profiles` table
- `getAuthContext()` provides userId and organizationId

**Data Access:**
- Server Actions for mutations
- Services for business logic
- Supabase RLS for security

**State Management:**
- React Query for server state
- useState for component state
- Form state via React Hook Form

### Project Structure

```
src/
├── actions/          # Server Actions (Next.js)
├── components/       # React components
├── lib/
│   ├── services/    # Business logic
│   ├── validations/ # Zod schemas
│   ├── auth/        # Auth utilities
│   └── supabase/    # DB clients
├── types/           # TypeScript types
└── utils/           # Helpers
```

## Common Issues & Solutions

### Issue: "Failed to load Clerk"

**Solution:**
```bash
# 1. Verify environment variables
npx tsx scripts/validate-env.ts

# 2. Check Clerk keys are correct (should start with pk_test_/sk_test_)
# 3. Clear cache and restart
rm -rf .next
npm run dev
```

### Issue: Webhook not syncing users to Supabase

**Checklist:**
1. Is webhook URL accessible? (Use ngrok for local: `ngrok http 3001`)
2. Is `CLERK_WEBHOOK_SECRET` set correctly?
3. Check Clerk Dashboard → Webhooks → Logs for errors
4. Verify `/api/webhooks/clerk` route exists

### Issue: TypeScript errors after schema changes

**Solution:**
```bash
# 1. Regenerate database types
npm run supabase:types

# 2. Clear cache
npm run type-check:clean

# 3. Restart dev server
npm run dev
```

### Issue: Infinite redirect loop during auth

**Solution:**
Check middleware.ts for conflicting redirect logic. The current setup:
- Public routes: `/`, `/auth/*`, `/api/*`
- Authenticated users on auth pages → redirect to `/dashboard`
- Unauthenticated users accessing protected routes → redirect to `/auth/sign-in`

## Team Practices

### Code Standards

- **TypeScript:** Strict mode enabled
- **Formatting:** Tailwind CSS 4
- **Naming:** camelCase for variables, PascalCase for components
- **Imports:** Use `@/*` path alias (maps to project root)

### Commit Message Format

```
type(scope): description

[optional body]
```

Examples:
```
feat(goals): add goal creation feature
fix(auth): resolve webhook user sync issue
docs(setup): update environment setup guide
```

### Pull Request Checklist

- [ ] Code passes `npm run type-check`
- [ ] Code passes `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow format

## Resources

### Documentation

- **CLAUDE.md** - Project architecture and patterns
- **CLERK_QUICK_START.md** - Clerk authentication setup
- **CLERK_CONFIGURATION.md** - Advanced Clerk features
- **QUICK_REFERENCE.md** - Database commands

### External Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Getting Help

### When you get stuck:

1. **Check documentation first:**
   - CLAUDE.md
   - CLERK_QUICK_START.md
   - DEVELOPER_SETUP.md (this file)

2. **Search for similar issues:**
   - GitHub Issues
   - Team Slack

3. **Debug step by step:**
   - Check browser console (F12)
   - Check terminal output
   - Check `.env.local` is set correctly
   - Run validation: `npx tsx scripts/validate-env.ts`

4. **Ask the team:**
   - Slack channel
   - Code review
   - Pair programming session

## Next Steps

1. Complete the setup above
2. Read CLAUDE.md for architecture
3. Review CLERK_QUICK_START.md for auth details
4. Pick a small feature to implement
5. Run tests and build before submitting PR

Welcome aboard! Happy coding!
