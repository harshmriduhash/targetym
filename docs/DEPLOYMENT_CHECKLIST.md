# Deployment Checklist - Targetym Realtime

This checklist ensures all components are properly deployed and configured for Realtime synchronization.

## Prerequisites

- [ ] Supabase account created
- [ ] Supabase project created (get Project Reference ID from Dashboard)
- [ ] Supabase CLI installed (`npm install -g supabase` or `brew install supabase/tap/supabase`)
- [ ] Git repository up to date
- [ ] All environment variables configured

## Phase 1: Database Setup

### 1.1 Install Supabase CLI

```bash
# Via npm (recommended)
npm install -g supabase

# Or via Homebrew (macOS/Linux)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### 1.2 Link Project

```bash
# Get your Project Reference ID from Supabase Dashboard
# Settings → General → Reference ID

# Link the project
supabase link --project-ref <your-project-ref>

# Verify connection
supabase db ping
```

Expected output: `✅ Database is healthy`

### 1.3 Create Backup

```bash
# Create backup before migrations
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### 1.4 Dry Run Migrations

```bash
# Review what will be applied
supabase db push --dry-run
```

Review the output carefully. Expected migrations:
- ✅ `20250109000000_create_complete_schema.sql` - 25 tables
- ✅ `20250109000001_rls_policies_complete.sql` - RLS policies
- ✅ `20250109000002_views_and_functions.sql` - Views and functions
- ✅ `20250109000003_enable_realtime.sql` - Realtime configuration

### 1.5 Apply Migrations

```bash
# Apply migrations to production
supabase db push

# Verify migrations applied
supabase migration list
```

Expected output:
```
  20250109000000  create_complete_schema         Applied
  20250109000001  rls_policies_complete          Applied
  20250109000002  views_and_functions            Applied
  20250109000003  enable_realtime                Applied
```

## Phase 2: Realtime Verification

### 2.1 Verify Realtime Publication

**Option A: Via Supabase Dashboard**
1. Go to Database → Replication
2. Verify `supabase_realtime` publication exists
3. Check that 17 tables are listed:
   - High Priority: `goals`, `candidates`, `profiles`, `agent_activities`
   - Medium Priority: `key_results`, `interviews`, `registry_builds`, `job_postings`
   - Low Priority: `goal_collaborators`, `candidate_notes`, `performance_reviews`, etc.

**Option B: Via SQL**
```sql
-- Check Realtime publication
SELECT tablename, schemaname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Or use the view
SELECT * FROM public.realtime_configuration;
```

Expected: 17 rows showing all configured tables

### 2.2 Test Realtime Functions

```sql
-- Test helper functions
SELECT public.is_realtime_enabled('goals');  -- Should return TRUE
SELECT public.is_realtime_enabled('organizations');  -- Should return FALSE

-- Check user's Realtime tables
SELECT * FROM public.get_user_realtime_tables();
```

### 2.3 Verify RLS Policies

```bash
# Run RLS tests
npm run supabase:test
```

Expected: All tests pass ✅

## Phase 3: TypeScript Types

### 3.1 Generate Types

```bash
# Generate TypeScript types from database schema
npm run supabase:types
```

Expected output:
```
Connecting to project...
Generating types...
Types generated at src/types/database.types.ts
```

### 3.2 Verify Types

```bash
# Run TypeScript type checking
npm run type-check
```

Expected: No type errors ✅

## Phase 4: Client Integration

### 4.1 Verify Environment Variables

Check `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Build Application

```bash
# Build the application
npm run build
```

Expected: Build succeeds ✅

## Phase 5: Realtime Testing

### 5.1 Run Unit Tests

```bash
# Run Realtime tests
npm test -- __tests__/realtime/realtime.test.tsx
```

Expected: All tests pass ✅

### 5.2 Start Development Server

```bash
npm run dev
```

### 5.3 Manual Realtime Test

**Test 1: Goals Realtime**

1. Open application at `http://localhost:3000`
2. Navigate to Goals page
3. Open browser DevTools → Console
4. Watch for Realtime logs (if debug enabled)
5. In another tab, open Supabase Dashboard → Table Editor → `goals`
6. Insert a new goal
7. Verify the Goals page updates automatically ✅

**Test 2: Candidates Realtime**

1. Navigate to Recruitment → Candidates
2. In Supabase Dashboard, update a candidate status
3. Verify the UI updates without refresh ✅

**Test 3: Connection Status**

1. Add `<RealtimeIndicator>` component to a page:
```tsx
import { RealtimeIndicator } from '@/src/components/realtime/RealtimeIndicator'

<RealtimeIndicator
  table="goals"
  filter={`organization_id=eq.${organizationId}`}
  detailed
  showReconnect
/>
```
2. Verify indicator shows "Connected" status ✅
3. Disconnect internet → should show "Disconnected"
4. Reconnect → should show "Connected" again ✅

## Phase 6: Performance Monitoring

### 6.1 Monitor Realtime Activity

```sql
-- Check Realtime configuration
SELECT
  tablename,
  estimated_row_count,
  table_size,
  realtime_priority
FROM public.realtime_configuration
ORDER BY realtime_priority;
```

### 6.2 Enable Realtime Analytics (Optional)

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable "Realtime Analytics"
3. Monitor subscription counts
4. Watch for performance metrics

## Phase 7: Production Deployment

### 7.1 Update Environment Variables (Production)

In your hosting platform (Vercel, etc.):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key
- [ ] All Clerk keys for production

### 7.2 Deploy Application

```bash
# Build for production
npm run build

# Deploy (example for Vercel)
vercel --prod
```

### 7.3 Post-Deployment Verification

- [ ] Application loads successfully
- [ ] Realtime connections establish
- [ ] No console errors related to Realtime
- [ ] Data updates propagate in real-time
- [ ] Connection status indicator works

## Rollback Plan

If issues occur during deployment:

### Option 1: Rollback Migrations

```bash
# List migrations
supabase migration list

# Create rollback migration
supabase migration new rollback_realtime

# Add DROP statements to rollback migration
# Then apply
supabase db push
```

### Option 2: Restore from Backup

```bash
# Restore from backup created in Phase 1.3
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_YYYYMMDD_HHMMSS.sql
```

### Option 3: Disable Realtime

```sql
-- Temporarily disable Realtime on specific tables
ALTER PUBLICATION supabase_realtime DROP TABLE goals;
ALTER PUBLICATION supabase_realtime DROP TABLE candidates;
-- etc.
```

## Monitoring & Maintenance

### Weekly Checks

- [ ] Monitor Realtime subscription counts in Supabase Dashboard
- [ ] Check for connection errors in application logs
- [ ] Review database performance metrics
- [ ] Verify RLS policies are working correctly

### Monthly Tasks

- [ ] Review and optimize slow queries affecting Realtime
- [ ] Check table sizes for tables with Realtime enabled
- [ ] Update throttling settings if needed
- [ ] Review Realtime event logs

## Troubleshooting

### Issue: No Realtime Events Received

**Check:**
1. RLS policies allow SELECT on the table
2. Filter is correct in subscription
3. Table is in `supabase_realtime` publication
4. Debug mode enabled to see logs

**Solution:**
```tsx
useRealtimeQuery({
  debug: true,  // Enable detailed logs
})
```

### Issue: Too Many Refetches

**Solution:** Increase throttle
```tsx
useRealtimeQuery({
  throttleMs: 5000,  // Wait 5s between refetches
})
```

### Issue: Connection Lost

**Check:**
1. Internet connection
2. Supabase instance status
3. Auto-reconnect enabled

**Solution:**
```tsx
useRealtimeSubscription({
  autoReconnect: true,  // Default, but verify
})
```

## Success Criteria

✅ All migrations applied successfully
✅ Realtime enabled on 17 tables
✅ RLS policies enforced
✅ TypeScript types generated
✅ Unit tests passing
✅ Manual tests successful
✅ Production deployment successful
✅ No console errors
✅ Real-time updates working
✅ Connection status indicator functional

## Additional Resources

- [REALTIME_GUIDE.md](./REALTIME_GUIDE.md) - Complete usage guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Database migration guide
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Last Updated**: 2025-01-09
**Version**: 1.0.0
