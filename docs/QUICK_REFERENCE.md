# Phase 2 Quick Reference Guide

## Essential Commands

### Local Development

```bash
# Start Supabase (first time or after restart)
npm run supabase:start

# Stop Supabase
npm run supabase:stop

# Apply all migrations (reset database)
npm run supabase:reset

# Generate TypeScript types
npm run supabase:types

# Test RLS policies
npm run supabase:test

# Check status
supabase status

# Open Studio UI
# Navigate to: http://localhost:54323
```

### Production Deployment

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations to production
npm run supabase:push

# Generate production types
supabase gen types typescript --linked > src/types/database.types.ts

# Deploy Edge Functions
supabase functions deploy ai-cv-scoring
supabase functions deploy ai-performance-synthesis

# Set secrets
supabase secrets set OPENAI_API_KEY=your-key
```

---

## Database Schema Quick Reference

### Tables Overview

**Organizations (1 table)**
- `organizations` - Company data

**Goals & OKRs (3 tables)**
- `goals` - Goal management
- `key_results` - Measurable outcomes
- `goal_collaborators` - Team members

**Recruitment (4 tables)**
- `job_postings` - Open positions
- `candidates` - Applicants
- `interviews` - Scheduling & feedback
- `candidate_notes` - Communication history

**Performance (6 tables)**
- `performance_reviews` - Review records
- `performance_criteria` - Evaluation criteria
- `performance_ratings` - Ratings per criteria
- `performance_goals` - Goals from reviews
- `peer_feedback` - 360 feedback
- `career_development` - Career planning

### User Roles

- `admin` - Full organization access
- `hr` - Recruitment and performance management
- `manager` - Team management and reviews
- `employee` - Personal data and team visibility

---

## Common Database Operations

### Helper Functions

```sql
-- Get current user's organization
SELECT get_user_organization_id();

-- Check user role
SELECT has_role('admin');
SELECT has_any_role(ARRAY['admin', 'hr']);

-- Calculate goal progress
SELECT calculate_goal_progress('goal-uuid');

-- Get team members
SELECT * FROM get_team_members('manager-uuid');

-- Check manager relationship
SELECT is_manager_of('manager-uuid', 'employee-uuid');

-- Organization hierarchy
SELECT * FROM get_organization_hierarchy('org-uuid');

-- Performance metrics
SELECT calculate_avg_performance_rating('profile-uuid', 'Q1-2025');
SELECT * FROM get_candidates_by_status('org-uuid');
```

### Views

```sql
-- Goals with progress
SELECT * FROM goals_with_progress WHERE owner_id = auth.uid();

-- Job postings with stats
SELECT * FROM job_postings_with_stats WHERE status = 'active';

-- Performance review summary
SELECT * FROM performance_review_summary WHERE reviewee_id = auth.uid();
```

---

## TypeScript Usage Examples

### Basic Queries

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Select with filtering
const { data: goals, error } = await supabase
  .from('goals')
  .select('*, key_results(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })

// Insert
const { data: newGoal, error } = await supabase
  .from('goals')
  .insert({
    organization_id: orgId,
    title: 'Increase revenue',
    owner_id: userId,
    period: 'Q1-2025',
    status: 'active'
  })
  .select()
  .single()

// Update
const { data: updatedGoal, error } = await supabase
  .from('goals')
  .update({ status: 'completed' })
  .eq('id', goalId)
  .select()
  .single()

// Delete (soft delete by setting deleted_at)
const { data, error } = await supabase
  .from('goals')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', goalId)
```

### Complex Queries

```typescript
// Join with nested relations
const { data: reviews, error } = await supabase
  .from('performance_reviews')
  .select(`
    *,
    reviewee:profiles!reviewee_id(*),
    reviewer:profiles!reviewer_id(*),
    performance_ratings(
      *,
      criteria:performance_criteria(*)
    ),
    performance_goals(*)
  `)
  .eq('status', 'completed')
  .gte('completed_date', '2025-01-01')

// Count queries
const { count, error } = await supabase
  .from('goals')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active')

// Pagination
const PAGE_SIZE = 20
const { data, count, error } = await supabase
  .from('goals')
  .select('*', { count: 'exact' })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
```

### Storage Operations

```typescript
// Upload CV
const { data: cvData, error: cvError } = await supabase.storage
  .from('cvs')
  .upload(`candidate-${candidateId}/cv.pdf`, file, {
    contentType: 'application/pdf',
    upsert: false
  })

// Get public URL
const { data: publicUrl } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`)

// Download file
const { data: fileData, error } = await supabase.storage
  .from('cvs')
  .download(`candidate-${candidateId}/cv.pdf`)

// Delete file
const { data, error } = await supabase.storage
  .from('cvs')
  .remove([`candidate-${candidateId}/cv.pdf`])
```

---

## Storage Buckets

| Bucket | Max Size | Access | MIME Types |
|--------|----------|--------|------------|
| `cvs` | 10MB | HR/Admin | PDF, DOC, DOCX, TXT |
| `avatars` | 2MB | Own Profile | JPEG, PNG, WEBP, GIF |
| `organization-logos` | 5MB | Admin | JPEG, PNG, WEBP, SVG |

---

## Edge Functions

### ai-cv-scoring

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-cv-scoring`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      cv_text: extractedText,
      job_requirements: jobPosting.requirements
    })
  }
)
```

### ai-performance-synthesis

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-performance-synthesis`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      review_id: reviewId,
      profile_id: profileId,
      include_historical: true
    })
  }
)
```

---

## RLS Testing

### Manual RLS Testing

```sql
-- Switch to a specific user
SELECT set_config('request.jwt.claim.sub', 'user-uuid', true);

-- Verify user context
SELECT auth.uid();  -- Should return user UUID
SELECT get_user_organization_id();  -- Should return org UUID
SELECT has_role('admin');  -- Should return role status

-- Test queries (will respect RLS)
SELECT * FROM goals;  -- Only see own org's goals
SELECT * FROM candidates;  -- Only if HR/Admin
SELECT * FROM performance_reviews;  -- Only if participant

-- Test cross-tenant isolation
SELECT * FROM goals WHERE organization_id != get_user_organization_id();
-- Should return 0 rows

-- Test unauthorized update
UPDATE goals SET title = 'Hacked' WHERE owner_id != auth.uid();
-- Should fail or update 0 rows
```

### Automated Testing

```bash
# Run comprehensive RLS test suite
npm run supabase:test

# Expected output:
# ✓ Organization isolation
# ✓ Role-based access control
# ✓ Cross-tenant protection
# ✓ Data validation
# ✓ Helper functions
```

---

## Troubleshooting Quick Fixes

### Problem: Migrations fail

```bash
npm run supabase:stop
npm run supabase:start
npm run supabase:reset
```

### Problem: RLS blocks everything

```sql
-- Check authentication
SELECT auth.uid();  -- Should NOT be NULL

-- Check organization
SELECT get_user_organization_id();  -- Should return UUID

-- Check role
SELECT role FROM profiles WHERE id = auth.uid();
```

### Problem: Types are outdated

```bash
# Regenerate types
npm run supabase:types

# Or manually
supabase gen types typescript --local > src/types/database.types.ts
```

### Problem: Storage upload fails

1. Check file size (under limit)
2. Verify MIME type is allowed
3. Ensure user has correct role
4. Verify bucket exists: `SELECT * FROM storage.buckets;`

---

## URLs and Ports (Local)

- **API:** http://localhost:54321
- **Studio:** http://localhost:54323
- **Database:** postgresql://postgres:postgres@localhost:54322/postgres
- **Inbucket (Email):** http://localhost:54324

---

## Environment Variables

### Required (.env.local)

```bash
# Get these from: supabase status
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for AI features)
OPENAI_API_KEY=your-openai-key
```

### Security Rules

- ✅ Use `anon key` for client-side
- ❌ NEVER expose `service_role key` to browser
- ✅ Use `service_role key` only in server-side API routes

---

## File Locations

### Important Files

- **Migrations:** `D:\targetym\supabase\migrations\`
- **Types:** `D:\targetym\src\types\database.types.ts`
- **Config:** `D:\targetym\supabase\config.toml`
- **Tests:** `D:\targetym\supabase\tests\test_rls.sql`
- **Functions:** `D:\targetym\supabase\functions\`

### Client Libraries

- **Browser Client:** `D:\targetym\src\lib\supabase\client.ts`
- **Server Client:** `D:\targetym\src\lib\supabase\server.ts`
- **Middleware:** `D:\targetym\src\lib\supabase\middleware.ts`
- **Storage Utils:** `D:\targetym\src\lib\supabase\storage.ts`
- **Query Helpers:** `D:\targetym\src\lib\supabase\queries.ts`

---

## Documentation Links

### Project Docs

- **Implementation Guide:** `D:\targetym\PHASE2_IMPLEMENTATION_GUIDE.md`
- **Supabase README:** `D:\targetym\supabase\README.md`
- **RLS Policies:** `D:\targetym\supabase\policies\README.md`
- **Quick Reference:** `D:\targetym\QUICK_REFERENCE.md` (this file)

### Official Docs

- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

## Quick Checklist

### Initial Setup

- [ ] `npm run supabase:start`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update environment variables
- [ ] `npm run supabase:reset`
- [ ] `npm run supabase:types`
- [ ] `npm run supabase:test`

### Daily Development

- [ ] `npm run supabase:start` (if not running)
- [ ] `npm run dev`
- [ ] Make changes
- [ ] Test locally
- [ ] Generate types if schema changed

### Before Deployment

- [ ] Test all features locally
- [ ] Run RLS tests: `npm run supabase:test`
- [ ] Backup production database
- [ ] `npm run supabase:push`
- [ ] Generate production types
- [ ] Verify in production

---

**Last Updated:** 2025-10-01
**Version:** 1.0
**Project:** TargetYM HR Platform
