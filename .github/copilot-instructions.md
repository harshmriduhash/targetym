# Targetym AI Coding Agent Instructions

## Byterover MCP Tools
- Always use `byterover-store-knowledge` to capture new patterns, error solutions, and reusable code.
- Always use `byterover-retrieve-knowledge` before starting tasks, making architectural decisions, or debugging unfamiliar code.

## Architecture Overview
- **Next.js 15.5.4 app** with Clerk for authentication and Supabase for user profiles.
- **Major directories:**
  - `app/` (routes, pages, layouts)
  - `components/` (UI, dashboard, auth, onboarding)
  - `src/lib/` (auth, integrations, services)
  - `middleware.ts` (route protection, redirects)
  - `app/layout.tsx` (ClerkProvider config)
  - `app/api/webhooks/clerk/route.ts` (Clerk→Supabase sync)

## Authentication & Redirects
- **Sign-in:** `/auth/sign-in` (Clerk <SignIn> component)
- **Sign-up:** `/auth/sign-up` (Clerk <SignUp> component)
- **After sign-in/sign-up:** Always redirect to `/dashboard`
- **Protected routes:** `/dashboard` and children require authentication
- **Middleware:**
  - Redirects authenticated users from `/auth/sign-in` or `/auth/sign-up` to `/dashboard`
  - Redirects unauthenticated users from `/dashboard` to `/auth/sign-in`
- **ClerkProvider config:**
  ```tsx
  <ClerkProvider
    signInUrl="/auth/sign-in"
    signUpUrl="/auth/sign-up"
    afterSignInUrl="/dashboard"
    afterSignUpUrl="/dashboard"
    afterSignOutUrl="/"
  >
    {children}
  </ClerkProvider>
  ```
- **Server-side protection:**
  ```tsx
  // app/dashboard/layout.tsx
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in');
  ```

## Developer Workflows
- **Start dev server:** `npm run dev`
- **Run tests:** `npm test` (Jest)
- **Type generation:** `npm run supabase:types`
- **Clear type cache:** `npm run type-check:clean`
- **Common issues:**
  - Infinite redirect: Check `middleware.ts` for conflicting logic
  - Clerk errors: Verify env keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)

## Project Conventions
- **Auth pages:** Always use `/auth/sign-in` and `/auth/sign-up` (not `/signin`/`/signup`)
- **Redirects:** Use `redirect('/dashboard')` after successful auth
- **Public routes:** `/`, `/auth/*`, `/api/*`, `/api/webhooks/clerk`, `/api/health`
- **Profile sync:** Clerk webhook triggers Supabase profile creation
- **Use Byterover MCP tools** for knowledge extraction and retrieval as described above

## Key Files/Examples
- `app/auth/sign-in/page.tsx` — Clerk sign-in UI, redirects
- `app/auth/sign-up/page.tsx` — Clerk sign-up UI, redirects
- `app/dashboard/layout.tsx` — Auth protection
- `middleware.ts` — Route protection, redirect logic
- `app/layout.tsx` — ClerkProvider config
- `app/api/webhooks/clerk/route.ts` — Profile sync
- `src/lib/auth/server-auth.ts` — Auth context utilities

## Integration Patterns
- **OAuth:** Supported via Clerk (Google, GitHub, etc.)
- **Supabase:** Used for user profile storage, synced via webhook
- **Security:** Middleware sets CSP, X-Frame-Options, etc.

---
For more details, see:
- `app/_docs/CLERK_CONFIGURATION.md`
- `app/_docs/IMPLEMENTATION_SUMMARY.md`
- `docs/AUTH_SETUP_SUMMARY.md`
- `docs/BETTER_AUTH_IMPLEMENTATION.md`
- `docs/CLERK_AUTH_FIX_REPORT.md`

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
