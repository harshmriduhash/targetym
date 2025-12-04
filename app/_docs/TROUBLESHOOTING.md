# Troubleshooting Guide for Targetym

A comprehensive guide to diagnose and fix common issues in development and production.

## Quick Diagnosis

Run these commands to diagnose your setup:

```bash
# Check environment variables
npm run setup

# Check Clerk authentication
npm run check:auth

# Check health of application
npm run check:health
```

## Environment & Setup Issues

### Issue: "Command not found: npm/pnpm"

**Cause:** Node.js or pnpm not installed

**Solution:**
```bash
# Check versions
node --version      # Should be >= 24.0.0
pnpm --version      # Should be >= 10.0.0

# Install Node.js from https://nodejs.org/
# Install pnpm
npm install -g pnpm@10
```

### Issue: "Module not found: can't find module"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Clear cache
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Verify
npm run type-check
```

### Issue: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found"

**Cause:** Missing or incorrect environment variables

**Solution:**
```bash
# 1. Validate setup
npm run setup

# 2. Copy template
cp .env.production.example .env.local

# 3. Add values from:
# Clerk: https://dashboard.clerk.com/last-active?path=api-keys
# Supabase: https://supabase.com/dashboard

# 4. Restart dev server
npm run dev
```

## Authentication Issues

### Issue: "Failed to load Clerk" error in browser

**Cause:** CSP headers blocking Clerk, missing environment variables, or incorrect configuration

**Solution:**

1. **Verify environment variables:**
   ```bash
   npm run check:auth
   # Look for "FAIL" status
   ```

2. **Check browser console (F12):**
   - Look for CSP violations
   - Check if Clerk script is being blocked

3. **Clear cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Verify Clerk Dashboard settings:**
   - Go to https://dashboard.clerk.com
   - Check API Keys are correct
   - Verify `localhost:3001` is in Allowed Origins

5. **Check CSP headers in middleware.ts:**
   - Ensure Clerk domains are listed
   - Current version should have: `clerk.accounts.dev`, `clerk.com`

### Issue: "Invalid publishable key"

**Cause:** Wrong Clerk key or incorrect format

**Solution:**
```bash
# 1. Check key format
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Should start with: pk_test_ or pk_live_

# 2. Get correct key from Clerk Dashboard
# https://dashboard.clerk.com/last-active?path=api-keys

# 3. Update .env.local and restart
npm run dev
```

### Issue: User can't sign in / infinite redirect loop

**Cause:** Auth configuration mismatch or middleware conflicts

**Solution:**

1. **Check middleware.ts:**
   - Public routes must include `/auth/sign-in` and `/auth/sign-up`
   - Check for conflicting redirect logic

2. **Verify ClerkProvider configuration in app/layout.tsx:**
   ```typescript
   <ClerkProvider
     signInUrl="/auth/sign-in"
     signUpUrl="/auth/sign-up"
     afterSignInUrl="/dashboard"
     afterSignUpUrl="/dashboard"
   >
   ```

3. **Clear Clerk cache:**
   ```bash
   # Delete browser cookies
   # - In DevTools: Application → Cookies → Delete all

   # Clear local storage
   # In browser console:
   localStorage.clear()
   sessionStorage.clear()

   # Restart dev server
   npm run dev
   ```

4. **Test sign-in flow:**
   - Sign out completely
   - Try signing in again
   - Check browser console for errors

### Issue: "Webhook not working" / Users not syncing to Supabase

**Cause:** Webhook URL not configured, invalid secret, or endpoint not accessible

**Solution:**

1. **Verify webhook endpoint is running:**
   ```bash
   # Check if /api/webhooks/clerk route exists
   # File: app/api/webhooks/clerk/route.ts
   # Should exist and have POST handler
   ```

2. **For local development, expose webhook with ngrok:**
   ```bash
   # Install ngrok
   npm install -g ngrok

   # In terminal 1: Start dev server
   npm run dev

   # In terminal 2: Create tunnel
   ngrok http 3001
   # Note the HTTPS URL (e.g., https://abc123.ngrok.io)
   ```

3. **Configure webhook in Clerk Dashboard:**
   - Go to https://dashboard.clerk.com → Webhooks
   - Click "Create" or "Edit" endpoint
   - Set URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret to `CLERK_WEBHOOK_SECRET`

4. **Verify webhook secret:**
   ```bash
   # Check environment variable
   echo $CLERK_WEBHOOK_SECRET
   # Should start with: whsec_

   # Update .env.local if needed
   npm run dev
   ```

5. **Test webhook:**
   - Create a new user in Clerk Dashboard or sign up
   - Check Clerk Dashboard → Webhooks → Logs for the event
   - Check Supabase Studio → Tables → profiles for new user

6. **If webhook still fails:**
   - Check Supabase connection in webhook handler
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check Supabase logs for errors

### Issue: Profile not created in Supabase after sign-up

**Cause:** Webhook not triggered, webhook fails, or Supabase connection error

**Solution:**

1. **Verify webhook is triggered:**
   - Sign up for a new account
   - Go to Clerk Dashboard → Webhooks → Logs
   - Look for `user.created` event
   - Check if it shows "Successful" or "Failed"

2. **If webhook shows "Failed":**
   - Click the event to see error details
   - Common errors:
     - "Connection refused" → Webhook URL not accessible
     - "Unauthorized" → Invalid `CLERK_WEBHOOK_SECRET`
     - "Supabase error" → Database connection issue

3. **Check Supabase profile manually:**
   - Open Supabase Studio: http://localhost:54323
   - Go to Tables → profiles
   - Look for user with Clerk user ID
   - If not there, webhook isn't being called

4. **Verify Supabase connectivity:**
   ```bash
   # Check if Supabase is running
   npm run supabase:start

   # Check connection in webhook handler
   # File: app/api/webhooks/clerk/route.ts
   # Should have proper error logging
   ```

## Database Issues

### Issue: "Column does not exist" or type errors after migration

**Cause:** Database schema out of sync with TypeScript types

**Solution:**

1. **Regenerate TypeScript types:**
   ```bash
   npm run supabase:types

   # Clear cache
   npm run type-check:clean

   # Verify
   npm run type-check
   ```

2. **If still fails:**
   ```bash
   # Reset database with migrations
   npm run supabase:reset

   # Then regenerate types
   npm run supabase:types
   ```

### Issue: RLS policies denying access

**Cause:** User organization not set or RLS policy too restrictive

**Solution:**

1. **Check user profile in Supabase:**
   - Open Supabase Studio: http://localhost:54323
   - Go to Tables → profiles
   - Verify `organization_id` is set

2. **If organization_id is NULL:**
   - Manually update: `UPDATE profiles SET organization_id = 'default' WHERE id = 'user_id'`
   - Or ensure webhook creates organization entry

3. **Test RLS policies:**
   ```bash
   npm run supabase:test
   ```

4. **Review RLS policies:**
   - Check supabase/migrations/ for policy definitions
   - Ensure `get_user_organization_id()` function is working
   - Test with Supabase Dashboard query editor

## TypeScript & Build Issues

### Issue: TypeScript errors on build

**Cause:** Type mismatches or missing types

**Solution:**

```bash
# Check all errors
npm run type-check

# Clean and rebuild
npm run type-check:clean

# If errors persist:
# 1. Review CLAUDE.md section "Known Issues & Workarounds"
# 2. Check if @ts-expect-error comment is needed
# 3. Regenerate database types: npm run supabase:types
```

### Issue: "Cannot find module" errors

**Cause:** Path alias not resolved or module not installed

**Solution:**

```bash
# Check tsconfig.json has correct path alias
# Should have:
# "baseUrl": "."
# "paths": { "@/*": ["./*"] }

# Verify module is installed
npm list <module-name>

# If missing, install
pnpm add <module-name>

# Restart dev server
npm run dev
```

### Issue: ESLint errors on build

**Cause:** Code style violations

**Solution:**

```bash
# Check linting errors
npm run lint

# Auto-fix common issues
npx eslint --fix src/

# Verify fixes
npm run lint
```

## Performance Issues

### Issue: Dev server is very slow

**Cause:** Turbopack compilation overhead or large bundle

**Solution:**

```bash
# 1. Restart dev server
npm run dev

# 2. If still slow, check build time
npm run build

# 3. Check what's slow
# Open http://localhost:3000
# Check Network tab in DevTools for slow requests

# 4. If build is slow:
npm run build --verbose

# 5. Last resort: fresh start
npm run dev:fresh
```

### Issue: Hot reload not working

**Cause:** File watcher issue or Turbopack cache

**Solution:**

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear cache
npm run clean

# 3. Restart
npm run dev

# 4. If still not working:
# - Check file permissions
# - Restart VS Code
# - Restart terminal
```

## Production Deployment Issues

### Issue: "Invalid public key" in production

**Cause:** Using test keys instead of production keys

**Solution:**

```bash
# 1. Get production keys from Clerk Dashboard
# https://dashboard.clerk.com/last-active?path=api-keys
# Make sure you're on PRODUCTION instance

# 2. Update environment variables on your hosting platform
# (Vercel, Render, etc.)

# 3. Set:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
# CLERK_SECRET_KEY=sk_live_...
# CLERK_WEBHOOK_SECRET=whsec_...

# 4. Redeploy
```

### Issue: "Webhook not working in production"

**Cause:** Webhook URL not updated or incorrect signing secret

**Solution:**

1. **Update webhook URL in Clerk Dashboard:**
   - Go to https://dashboard.clerk.com → Webhooks
   - Edit endpoint
   - Set URL to your production domain: `https://your-domain.com/api/webhooks/clerk`

2. **Verify signing secret:**
   - Get from Clerk Dashboard
   - Update in production environment variables

3. **Test webhook:**
   - Create a test user
   - Check Clerk Dashboard logs
   - Verify user synced to Supabase

## Getting More Help

### Check These Resources

1. **Official Documentation:**
   - CLAUDE.md - Architecture and patterns
   - CLERK_QUICK_START.md - Auth setup
   - DEVELOPER_SETUP.md - Onboarding
   - CLERK_CONFIGURATION.md - Advanced setup

2. **External Resources:**
   - [Clerk Documentation](https://clerk.com/docs)
   - [Supabase Documentation](https://supabase.com/docs)
   - [Next.js Documentation](https://nextjs.org/docs)

3. **Community Help:**
   - [Clerk Discord](https://clerk.com/discord)
   - [Supabase Discord](https://discord.supabase.com)
   - GitHub Issues

### When Asking for Help

Include:

1. Error message (exact text)
2. Command that failed
3. Environment setup (what you configured)
4. What you tried to fix it
5. Output of `npm run check:all`
6. Relevant logs (from browser console or terminal)

Example:

```
Error: "Failed to load Clerk"
Command: npm run dev
Setup: .env.local configured with Clerk keys
Tried: Cleared cache, restarted server
Output of npm run check:all:
  ✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: OK
  ✗ Clerk API: Failed to authenticate
```

## Common Patterns

### Pattern 1: Clear Everything and Start Fresh

When things are very broken:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clean build artifacts
npm run clean:all

# 3. Reinstall dependencies
pnpm install

# 4. Reset database
npm run supabase:reset

# 5. Validate setup
npm run check:all

# 6. Start fresh
npm run dev:fresh
```

### Pattern 2: Incremental Debugging

When you're not sure what's wrong:

```bash
# 1. Check environment
npm run setup

# 2. Check auth specifically
npm run check:auth

# 3. Check code health
npm run check:health

# 4. Review the 3 failing checks and fix them

# 5. Repeat
```

### Pattern 3: Deep Dive into a Single Issue

When you need to debug specific functionality:

```bash
# 1. Start dev server with verbose output
npm run dev

# 2. Open browser DevTools (F12)
# 3. Go to Console tab
# 4. Reproduce the issue
# 5. Look for error messages
# 6. Check Network tab for failed requests
# 7. Check Sources tab to set breakpoints

# 8. Check server logs in terminal
# Look for error messages or stack traces
```

## Still Stuck?

1. **Read the error message carefully** - it often explains what's wrong
2. **Search your error message** in documentation
3. **Check the Troubleshooting sections** in relevant guides
4. **Run the diagnostic commands** above
5. **Ask for help with detailed information**

Remember: Every developer gets stuck sometimes. The key is systematic debugging!
