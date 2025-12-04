# Clerk Authentication Quick Start

This is a quick reference guide for Clerk authentication setup in Targetym.

## Prerequisites

1. Clerk account and application created at [clerk.com](https://clerk.com)
2. Supabase project set up
3. Next.js 15.5.4 application running

## 1. Environment Setup (5 minutes)

Create or update `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase (for profile storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Get Clerk Keys:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Copy `Secret Key` → `CLERK_SECRET_KEY`

## 2. Webhook Configuration (10 minutes)

### For Local Development (using ngrok):

```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, create tunnel
ngrok http 3001

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

### Configure in Clerk Dashboard:

1. Go to [Clerk Dashboard → Webhooks](https://dashboard.clerk.com/last-active?path=webhooks)
2. Click **Add Endpoint**
3. Enter endpoint URL:
   - Local: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy **Signing Secret** → `CLERK_WEBHOOK_SECRET`
6. Save endpoint

## 3. Verify Installation

### Check Files Exist:

```bash
# Core files
app/layout.tsx                    # ✅ ClerkProvider configured
middleware.ts                     # ✅ Route protection

# Auth pages
app/auth/sign-in/page.tsx        # ✅ Sign-in page
app/auth/sign-up/page.tsx        # ✅ Sign-up page

# Protected routes
app/dashboard/layout.tsx         # ✅ Auth check

# Webhook
app/api/webhooks/clerk/route.ts  # ✅ User sync to Supabase

# Helpers
src/lib/auth/server-auth.ts      # ✅ getAuthContext()
src/lib/auth/clerk.ts            # ✅ Clerk utilities
```

### Test Authentication Flow:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Visit sign-up page:**
   ```
   http://localhost:3001/auth/sign-up
   ```

3. **Create test account:**
   - Enter name, email, password
   - Should redirect to `/dashboard` after sign-up

4. **Verify user in Supabase:**
   - Open Supabase Studio
   - Check `profiles` table
   - New profile should exist with Clerk user ID

5. **Test sign-out and sign-in:**
   - Sign out from dashboard
   - Visit `/auth/sign-in`
   - Sign in with same credentials
   - Should redirect to `/dashboard`

6. **Test protected routes:**
   - Sign out
   - Try to visit `/dashboard`
   - Should redirect to `/auth/sign-in`

## 4. Enable OAuth Providers (Optional)

### Google OAuth:

1. **Clerk Dashboard:**
   - Go to **User & Authentication** → **Social Connections**
   - Toggle **Google** on

2. **Configure OAuth (if custom):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URIs from Clerk Dashboard
   - Copy Client ID and Secret to Clerk

3. **Test:**
   - Visit `/auth/sign-in`
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Should create profile in Supabase and redirect to `/dashboard`

### Other Providers:

Follow same pattern for:
- GitHub
- Microsoft
- LinkedIn
- Facebook
- Apple

## 5. Route Configuration Reference

### Public Routes (Accessible Without Auth):

- `/` - Home page
- `/auth/sign-in` - Sign-in page
- `/auth/sign-up` - Sign-up page
- `/auth/*` - All auth pages
- `/api/auth/*` - Auth API routes
- `/api/health` - Health check
- `/api/webhooks/clerk` - Clerk webhook

### Protected Routes (Require Auth):

- `/dashboard` - Main dashboard
- `/dashboard/*` - All dashboard pages
- `/app/*` - Application routes (if exists)

### Auto-Redirects:

| From | To | When |
|------|----|----- |
| `/auth/sign-in` | `/dashboard` | Already authenticated |
| `/auth/sign-up` | `/dashboard` | Already authenticated |
| `/dashboard` | `/auth/sign-in` | Not authenticated |
| After sign-in | `/dashboard` | Authentication success |
| After sign-up | `/dashboard` | Registration success |
| After sign-out | `/` | Sign-out complete |

## 6. Using Auth in Your Code

### In Server Actions:

```typescript
'use server'

import { getAuthContext } from '@/src/lib/auth/server-auth'

export async function createGoal(input: CreateGoalInput) {
  try {
    // Get authenticated user
    const { userId, organizationId, role } = await getAuthContext()

    // Use in your logic
    const goal = await goalsService.createGoal({
      ...input,
      owner_id: userId,
      organization_id: organizationId,
    })

    return successResponse(goal)
  } catch (error) {
    return errorResponse('Unauthorized')
  }
}
```

### In Server Components:

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in')
  }

  // Render protected content
  return <div>Profile for user {userId}</div>
}
```

### In Client Components:

```typescript
'use client'

import { useUser, useAuth } from '@clerk/nextjs'

export function UserProfile() {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

## 7. Troubleshooting

### Issue: "Invalid publishable key"

**Solution:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
- Restart dev server: `npm run dev`
- Check key starts with `pk_test_` or `pk_live_`

### Issue: Webhook not working

**Checklist:**
1. Is `CLERK_WEBHOOK_SECRET` set?
2. Is webhook URL publicly accessible? (Use ngrok for local)
3. Are events subscribed in Clerk Dashboard?
4. Check webhook logs in Clerk Dashboard

### Issue: User redirected to Clerk's hosted pages

**Solution:**
- Ensure `signInUrl` and `signUpUrl` are set in `ClerkProvider`
- Check `routing="path"` is set in `<SignIn>` and `<SignUp>` components

### Issue: Profile not found after sign-in

**Solutions:**
1. Check webhook was triggered (Clerk Dashboard → Webhooks → Logs)
2. Verify Supabase connection in webhook handler
3. Check `profiles` table in Supabase
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Issue: Infinite redirect loop

**Solution:**
- Check middleware logic doesn't conflict with Clerk's default behavior
- Ensure public routes are correctly configured in middleware
- Verify `afterSignInUrl` and `afterSignUpUrl` are set in `ClerkProvider`

## 8. Production Deployment Checklist

- [ ] Replace test keys with production keys in environment variables
- [ ] Update webhook URL to production domain in Clerk Dashboard
- [ ] Configure production redirect URLs for OAuth providers
- [ ] Test sign-in/sign-up flows in production
- [ ] Verify webhook integration in production
- [ ] Enable desired OAuth providers
- [ ] Configure email templates in Clerk Dashboard
- [ ] Set up custom domain (optional, in Clerk Dashboard)
- [ ] Enable MFA (optional, in Clerk Dashboard)
- [ ] Review and configure session settings

## 9. Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Webhooks Guide](https://clerk.com/docs/integrations/webhooks/overview)
- [Clerk Discord Community](https://clerk.com/discord)

## 10. Support

For detailed configuration, see `CLERK_CONFIGURATION.md`.

For issues:
1. Check error logs in browser console and terminal
2. Review Clerk Dashboard logs (Webhooks, Users)
3. Check Supabase logs (if profile sync issues)
4. Visit [Clerk Discord](https://clerk.com/discord) for community help
