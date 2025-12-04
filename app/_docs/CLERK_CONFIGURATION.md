# Clerk Authentication Configuration Guide

This guide provides complete setup instructions for Clerk authentication in your Targetym application.

## Overview

Clerk is configured as the primary authentication provider for this Next.js 15.5.4 application with the following features:

- User authentication (sign-in/sign-up)
- OAuth providers support (Google, GitHub, etc.)
- Automatic dashboard redirections
- User sync to Supabase profiles via webhooks
- Protected routes with middleware
- Session management

## File Structure

```
app/
├── layout.tsx                    # ClerkProvider with redirects
├── auth/
│   ├── sign-in/
│   │   └── page.tsx             # Clerk sign-in page
│   └── sign-up/
│       └── page.tsx             # Clerk sign-up page
├── dashboard/
│   └── layout.tsx               # Protected layout with auth check
└── api/
    └── webhooks/
        └── clerk/
            └── route.ts         # Webhook handler for user sync

middleware.ts                     # Route protection and redirects
src/
└── lib/
    └── auth/
        ├── server-auth.ts       # Server-side auth helpers
        └── clerk.ts             # Clerk integration utilities
```

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Getting Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application or create a new one
3. Navigate to **API Keys** section
4. Copy the `Publishable Key` and `Secret Key`

### Getting Webhook Secret

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
   - For local dev: Use ngrok or similar tunnel service
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** as `CLERK_WEBHOOK_SECRET`

## Authentication Flow

### Sign-In Flow

1. User visits `/auth/sign-in`
2. Clerk displays sign-in form
3. After successful authentication:
   - Middleware redirects to `/dashboard`
   - Session is created automatically
4. If already authenticated, middleware redirects from `/auth/sign-in` to `/dashboard`

### Sign-Up Flow

1. User visits `/auth/sign-up`
2. Clerk displays registration form
3. After successful registration:
   - Webhook triggers `user.created` event
   - Profile created in Supabase `profiles` table
   - User redirected to `/dashboard`
4. If already authenticated, middleware redirects from `/auth/sign-up` to `/dashboard`

### Protected Routes

All routes are protected by default except:

**Public Routes:**
- `/` - Home page
- `/auth/sign-in` - Sign-in page
- `/auth/sign-up` - Sign-up page
- `/auth/*` - All auth-related pages
- `/api/auth/*` - Auth API routes
- `/api/health` - Health check endpoint
- `/api/webhooks/clerk` - Clerk webhook endpoint

**Protected Routes:**
- `/dashboard` - Main dashboard (redirects to `/auth/sign-in` if unauthenticated)
- `/dashboard/*` - All dashboard pages
- `/app/*` - Application routes

## Middleware Configuration

The middleware (`middleware.ts`) handles:

1. **Route Protection**: Automatically protects all non-public routes
2. **Authenticated User Redirects**: Redirects authenticated users from auth pages to dashboard
3. **Unauthenticated User Redirects**: Clerk automatically redirects to `/auth/sign-in`
4. **Security Headers**: CSP, X-Frame-Options, etc.

### Key Middleware Logic

```typescript
// Redirect authenticated users from auth pages to dashboard
if (userId && (url.pathname.startsWith('/auth/sign-in') || url.pathname.startsWith('/auth/sign-up'))) {
  return NextResponse.redirect(new URL('/dashboard', req.url))
}

// Protect all routes except public routes
if (!isPublicRoute(req)) {
  await auth.protect()
}
```

## ClerkProvider Configuration

Located in `app/layout.tsx`:

```typescript
<ClerkProvider
  dynamic
  appearance={{
    baseTheme: undefined,
    variables: { colorPrimary: '#000000' }
  }}
  signInUrl="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/dashboard"
  afterSignOutUrl="/"
>
  {children}
</ClerkProvider>
```

**Configuration Options:**
- `signInUrl`: Custom sign-in page path
- `signUpUrl`: Custom sign-up page path
- `afterSignInUrl`: Redirect destination after sign-in
- `afterSignUpUrl`: Redirect destination after sign-up
- `afterSignOutUrl`: Redirect destination after sign-out
- `appearance`: Customization for Clerk UI components

## Dashboard Layout Protection

The `app/dashboard/layout.tsx` file ensures authentication:

```typescript
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  return <NewDashboardLayout>{children}</NewDashboardLayout>;
}
```

## Webhook Integration

### Purpose

The webhook at `/api/webhooks/clerk/route.ts` syncs Clerk users to Supabase `profiles` table.

### Events Handled

1. **user.created**
   - Creates new profile in Supabase
   - Uses Clerk user ID as primary key
   - Syncs email and full name

2. **user.updated**
   - Updates existing profile in Supabase
   - Syncs changed email or name

3. **user.deleted**
   - Deletes profile from Supabase
   - Or marks as deleted (depending on requirements)

### Webhook Security

- Verifies signature using `CLERK_WEBHOOK_SECRET`
- Rejects requests with invalid signatures
- Uses Svix library for signature verification

## Server-Side Auth Functions

Located in `src/lib/auth/server-auth.ts`:

### getAuthContext()

Primary function for Server Actions to get authenticated user context:

```typescript
export async function getAuthContext() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get user's organization from profiles table
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', userId)
    .single()

  if (!profile?.organization_id) {
    throw new Error('User organization not found')
  }

  return {
    userId,
    organizationId: profile.organization_id,
    role: profile.role,
  }
}
```

**Usage in Server Actions:**

```typescript
'use server'

export async function createGoal(input: CreateGoalInput) {
  try {
    // Get authenticated user context
    const { userId, organizationId } = await getAuthContext()

    // Use userId and organizationId in your logic
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

## OAuth Providers Configuration

### Enabling OAuth Providers

1. Go to Clerk Dashboard
2. Navigate to **User & Authentication** → **Social Connections**
3. Enable desired providers:
   - Google
   - GitHub
   - Microsoft
   - LinkedIn
   - etc.

### OAuth Provider Setup Example (Google)

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URIs:
   - Development: `http://localhost:3001/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
3. Copy Client ID and Secret to Clerk Dashboard
4. Enable Google provider in Clerk

## Customizing Clerk UI

The sign-in and sign-up pages use Clerk's appearance customization:

```typescript
<SignIn
  appearance={{
    elements: {
      rootBox: 'w-full',
      card: 'bg-white dark:bg-slate-900 backdrop-blur-xl border rounded-3xl shadow-2xl',
      headerTitle: 'text-3xl font-black text-[var(--color-base-content)] dark:text-white',
      formButtonPrimary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90',
      formFieldInput: 'bg-[var(--color-base-200)] dark:bg-slate-800/50',
    },
  }}
  routing="path"
  path="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  afterSignInUrl="/dashboard"
/>
```

## Testing Authentication

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3001/auth/sign-up`
3. Create a test account
4. Verify redirect to `/dashboard`
5. Check Supabase `profiles` table for new profile

### Testing Webhooks Locally

1. Install ngrok or similar:
   ```bash
   npm install -g ngrok
   ```

2. Create tunnel:
   ```bash
   ngrok http 3001
   ```

3. Update webhook URL in Clerk Dashboard:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

4. Create a test user and verify webhook receives events

## Troubleshooting

### Issue: Redirect loop between auth pages and dashboard

**Solution:** Ensure middleware properly checks authentication:
```typescript
const { userId } = await auth()
if (userId && url.pathname.startsWith('/auth/sign-in')) {
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
```

### Issue: Webhook not receiving events

**Checklist:**
- [ ] `CLERK_WEBHOOK_SECRET` is set correctly
- [ ] Webhook URL is publicly accessible (use ngrok for local dev)
- [ ] Events are subscribed in Clerk Dashboard
- [ ] Signature verification is working

### Issue: User profile not found after sign-in

**Solutions:**
1. Check webhook logs in Clerk Dashboard
2. Verify Supabase connection in webhook handler
3. Check `profiles` table in Supabase
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: CSP blocking Clerk resources

**Solution:** Ensure CSP headers include Clerk domains:
```typescript
"connect-src 'self' https://*.clerk.accounts.dev https://clerk.com"
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev"
```

## Production Checklist

- [ ] Set production Clerk keys in environment variables
- [ ] Configure production webhook URL in Clerk Dashboard
- [ ] Enable desired OAuth providers
- [ ] Test sign-in/sign-up flows
- [ ] Verify webhook integration
- [ ] Test protected routes
- [ ] Review security headers
- [ ] Enable MFA (optional, in Clerk Dashboard)
- [ ] Configure session settings in Clerk Dashboard
- [ ] Set up email templates in Clerk Dashboard

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Webhook Events Reference](https://clerk.com/docs/integrations/webhooks/overview)
- [Appearance Customization](https://clerk.com/docs/components/customization/overview)

## Support

For issues or questions:
1. Check [Clerk Discord](https://clerk.com/discord)
2. Review [GitHub Issues](https://github.com/clerk/javascript)
3. Contact Clerk Support through Dashboard
