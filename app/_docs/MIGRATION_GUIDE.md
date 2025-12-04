# Migration Guide: Supabase Auth to Clerk

This guide helps you migrate from the previous Supabase Auth implementation to Clerk authentication.

## Overview

The application has been migrated from Supabase Auth to Clerk for improved authentication features, better UX, and easier OAuth integration.

## What Changed

### Before (Supabase Auth)
- Custom sign-in/sign-up forms with server actions
- Manual session management
- Complex OAuth setup
- Auth pages: `/auth/signin`, `/auth/signup`
- Callback handling at `/auth/callback`

### After (Clerk)
- Pre-built Clerk components with customization
- Automatic session management
- Built-in OAuth providers
- Auth pages: `/auth/sign-in`, `/auth/sign-up`
- Clerk handles OAuth callbacks internally

## Migration Steps

### Step 1: Environment Variables

#### Remove (No Longer Needed)
```bash
# These Supabase Auth-specific variables are no longer needed for authentication
# But keep SUPABASE_* variables for database access
```

#### Add (Required for Clerk)
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 2: Update Dependencies

No new dependencies required - Clerk packages are already installed:
- `@clerk/nextjs`
- `svix` (for webhook verification)

### Step 3: Configure Clerk

1. **Create Clerk Application:**
   - Go to [clerk.com](https://clerk.com)
   - Create account or sign in
   - Create new application
   - Copy API keys to `.env.local`

2. **Configure Webhook:**
   - In Clerk Dashboard, go to Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret to `CLERK_WEBHOOK_SECRET`

### Step 4: User Data Migration

You have two options:

#### Option A: Fresh Start (Recommended for Small User Base)
1. Delete old auth users from Supabase Auth (if any)
2. Keep `profiles` table data (organization, role info)
3. Users re-register with Clerk
4. Webhook will create new profiles or update existing ones

#### Option B: User Migration (For Existing User Base)

**Export from Supabase Auth:**
```sql
SELECT
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
FROM auth.users;
```

**Import to Clerk:**
Use Clerk's API or Dashboard import feature:
- API: [https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser](https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser)
- Dashboard: Bulk user import (contact Clerk support)

**Note:** Password migration requires special handling since Supabase uses different hashing. Consider:
1. Import users without passwords and send password reset emails
2. Or use Clerk's password migration API

### Step 5: Update Code References

#### Server Actions

**Before (Supabase Auth):**
```typescript
import { createClient } from '@/src/lib/supabase/server'

export async function createGoal(input: CreateGoalInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse('Unauthorized')
  }

  // Use user.id
}
```

**After (Clerk):**
```typescript
import { getAuthContext } from '@/src/lib/auth/server-auth'

export async function createGoal(input: CreateGoalInput) {
  const { userId, organizationId } = await getAuthContext()

  // Use userId and organizationId
}
```

#### Server Components

**Before:**
```typescript
import { createClient } from '@/src/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')
}
```

**After:**
```typescript
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) redirect('/auth/sign-in')
}
```

#### Client Components

**Before:**
```typescript
import { createClient } from '@/src/lib/supabase/client'
import { useEffect, useState } from 'react'

export function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])
}
```

**After:**
```typescript
import { useUser } from '@clerk/nextjs'

export function UserProfile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div>Loading...</div>

  // Use user
}
```

### Step 6: Update Links and Routes

**Find and replace in your codebase:**
- `/auth/signin` → `/auth/sign-in`
- `/auth/signup` → `/auth/sign-up`

**Files to check:**
- Navigation components
- Link components
- Redirect calls
- Hard-coded URLs in tests

### Step 7: Testing Migration

1. **Test Sign-Up:**
   ```bash
   npm run dev
   # Visit http://localhost:3001/auth/sign-up
   # Create test account
   # Verify redirect to /dashboard
   # Check profiles table in Supabase
   ```

2. **Test Sign-In:**
   ```bash
   # Sign out from dashboard
   # Visit /auth/sign-in
   # Sign in with test account
   # Verify redirect to /dashboard
   ```

3. **Test Protected Routes:**
   ```bash
   # Sign out
   # Visit /dashboard directly
   # Verify redirect to /auth/sign-in
   ```

4. **Test Webhook:**
   ```bash
   # Check Clerk Dashboard → Webhooks → Logs
   # Verify user.created event was received
   # Check profiles table for synced data
   ```

### Step 8: Remove Old Code (Optional)

After successful migration and testing:

1. **Delete backup directories:**
   ```bash
   rm -rf app/auth/signin.backup
   rm -rf app/auth/signup.backup
   ```

2. **Remove old Server Actions (if not used elsewhere):**
   - `src/actions/auth/sign-in.ts` (old Supabase version)
   - `src/actions/auth/sign-up.ts` (old Supabase version)

3. **Remove callback route (if not used):**
   - `app/auth/callback/route.ts` (Supabase OAuth callback)

**Warning:** Only delete after confirming Clerk authentication works in production!

### Step 9: Production Deployment

1. **Update environment variables in production:**
   ```bash
   # Replace with production Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

2. **Update webhook URL in Clerk Dashboard:**
   ```
   https://your-production-domain.com/api/webhooks/clerk
   ```

3. **Test in production:**
   - Create test account
   - Verify sign-in/sign-up
   - Check webhook logs
   - Verify profile sync

4. **Monitor for issues:**
   - Check Clerk Dashboard logs
   - Monitor application error logs
   - Verify user profiles are syncing

## OAuth Providers

### Before (Supabase)
- Required manual OAuth app setup
- Complex callback handling
- Limited provider support

### After (Clerk)
- One-click provider enablement
- Automatic callback handling
- 20+ providers supported

**To Enable:**
1. Go to Clerk Dashboard → Social Connections
2. Toggle desired providers (Google, GitHub, etc.)
3. Add OAuth credentials if using custom apps
4. Test sign-in with provider

## Database Schema Changes

### Profiles Table

The `profiles` table structure remains the same:
- `id` (text, primary key) - Now stores Clerk user ID instead of Supabase Auth ID
- `email` (text) - User email from Clerk
- `full_name` (text) - User name from Clerk
- `organization_id` (uuid) - User's organization
- `role` (text) - User's role
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Migration Consideration:**
If you have existing profiles with Supabase Auth IDs, you need to:
1. Map old Supabase Auth IDs to new Clerk user IDs
2. Update all foreign key references
3. Or start fresh and re-create profiles via webhook

## Rollback Plan

If you need to rollback to Supabase Auth:

1. **Restore backup auth pages:**
   ```bash
   mv app/auth/signin.backup app/auth/signin
   mv app/auth/signup.backup app/auth/signup
   ```

2. **Restore middleware.ts from git:**
   ```bash
   git checkout HEAD~1 -- middleware.ts
   ```

3. **Restore layout files from git:**
   ```bash
   git checkout HEAD~1 -- app/layout.tsx
   git checkout HEAD~1 -- app/dashboard/layout.tsx
   ```

4. **Remove Clerk environment variables**

5. **Restart dev server**

## Comparison: Supabase Auth vs Clerk

| Feature | Supabase Auth | Clerk |
|---------|---------------|-------|
| Sign-in/Sign-up UI | Custom built | Pre-built components |
| Session Management | Manual | Automatic |
| OAuth Providers | Complex setup | One-click enable |
| MFA | Manual setup | Built-in |
| User Management | Supabase Dashboard | Clerk Dashboard |
| Email Templates | Custom | Built-in + Custom |
| Webhooks | Manual | Built-in |
| Cost | Free (self-hosted) | Free tier, paid plans |

## Common Issues and Solutions

### Issue: Users can't sign in after migration

**Cause:** User IDs changed from Supabase to Clerk

**Solution:**
1. Check `profiles` table for correct Clerk user IDs
2. Verify webhook is syncing users correctly
3. Have users re-register if necessary

### Issue: Webhook not creating profiles

**Checklist:**
- [ ] `CLERK_WEBHOOK_SECRET` is set correctly
- [ ] Webhook URL is publicly accessible
- [ ] Events are subscribed in Clerk Dashboard
- [ ] Check Clerk webhook logs for errors
- [ ] Verify Supabase connection in webhook handler

### Issue: Infinite redirect loops

**Cause:** Misconfigured middleware or ClerkProvider

**Solution:**
1. Verify middleware public routes include `/auth/sign-in`, `/auth/sign-up`
2. Check `afterSignInUrl` and `afterSignUpUrl` in ClerkProvider
3. Ensure middleware redirect logic is correct

### Issue: Old auth pages still accessible

**Cause:** Multiple auth page directories exist

**Solution:**
1. Delete or rename old directories:
   ```bash
   rm -rf app/auth/signin.backup
   rm -rf app/auth/signup.backup
   ```
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

## Support

- **Implementation docs:** See `CLERK_CONFIGURATION.md` and `CLERK_QUICK_START.md`
- **Clerk support:** [https://clerk.com/discord](https://clerk.com/discord)
- **Migration issues:** Check Clerk Dashboard logs and webhook events

## Next Steps After Migration

1. **Enable OAuth providers** in Clerk Dashboard
2. **Customize email templates** for branded experience
3. **Set up MFA** for enhanced security (optional)
4. **Configure session settings** (timeouts, activity-based)
5. **Set up custom domain** for Clerk pages (optional)
6. **Monitor webhook logs** to ensure sync is working
7. **Test all authentication flows** thoroughly

## Conclusion

The migration to Clerk provides:
- Better authentication UX
- Easier OAuth integration
- Automatic session management
- Built-in security features
- Simplified codebase

Follow this guide step-by-step for a smooth migration. After successful migration and testing, the old Supabase Auth code can be safely removed.
