# Supabase Setup Guide - Phase 2 Core HR Modules

This guide covers the complete Supabase configuration for Phase 2, including Goals & OKRs, Recruitment, and Performance modules with multi-tenant architecture.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Migrations](#database-migrations)
4. [Row Level Security](#row-level-security)
5. [Storage Configuration](#storage-configuration)
6. [Edge Functions](#edge-functions)
7. [Type Generation](#type-generation)
8. [Testing](#testing)
9. [Security Best Practices](#security-best-practices)

## Prerequisites

- Supabase account ([sign up](https://supabase.com))
- Supabase CLI installed: `npm install -g supabase`
- Node.js 18+ and npm/pnpm
- PostgreSQL knowledge (basic)

## Environment Setup

### 1. Create Supabase Project

```bash
# Login to Supabase CLI
supabase login

# Link to your project (or create new one)
supabase link --project-ref your-project-ref

# Or initialize locally for development
supabase init
supabase start
```

### 2. Environment Variables

Create or update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API Keys (for Edge Functions)
OPENAI_API_KEY=your-openai-key  # Optional
ANTHROPIC_API_KEY=your-anthropic-key  # Optional
```

**IMPORTANT**: Never commit `.env.local` to version control!

## Database Migrations

### 1. Run Migrations

Migrations are located in `supabase/migrations/` and should be run in order:

```bash
# Apply all migrations to local database
supabase db reset

# Or apply to remote database
supabase db push

# Create a new migration (if needed)
supabase migration new your_migration_name
```

### Migration Order

1. `20250101000001_create_organizations.sql` - Organizations table
2. `20250101000002_update_profiles_with_org.sql` - Add org relationships to profiles
3. `20250101000003_create_goals_okrs.sql` - Goals & Key Results
4. `20250101000004_create_recruitment.sql` - Job postings, candidates, interviews
5. `20250101000005_create_performance.sql` - Performance reviews
6. `20250101000006_rls_policies.sql` - Row Level Security policies
7. `20250101000007_storage_and_functions.sql` - Storage buckets and functions

### 2. Verify Migrations

```bash
# Check migration status
supabase migration list

# Verify database schema
supabase db diff
```

## Row Level Security

### Multi-Tenant Isolation

All tables are protected with Row Level Security (RLS) policies that ensure:

- **Organization Isolation**: Users can only access data from their organization
- **Role-Based Access**: Different permissions for admin, manager, employee, hr roles
- **Data Ownership**: Users have special access to their own data

### Key RLS Policies

**Goals Module**:
- All users can view goals in their organization
- Goal owners and managers can update goals
- Only admins can delete goals

**Recruitment Module**:
- HR and admins can manage candidates
- Hiring managers can view candidates for their job postings
- Interviewers can view and update their assigned interviews

**Performance Module**:
- Reviewees can view their own reviews
- Reviewers can update assigned reviews
- Managers can view their team's reviews
- HR and admins have full access

### Testing RLS Policies

```sql
-- Test as different users
SET request.jwt.claim.sub = 'user-id-here';

-- Verify user can only see their org data
SELECT * FROM goals;  -- Should only return org-specific data

-- Test role-based access
-- (User should have role in their profile)
```

## Storage Configuration

### Buckets

Three storage buckets are configured:

1. **cvs** (Private) - CV/Resume uploads
   - Max size: 10MB
   - Allowed types: PDF, DOC, DOCX, TXT
   - Access: HR and admins only

2. **avatars** (Public) - User profile pictures
   - Max size: 2MB
   - Allowed types: JPEG, PNG, WEBP, GIF
   - Access: Users can upload/update their own

3. **organization-logos** (Public) - Organization logos
   - Max size: 5MB
   - Allowed types: JPEG, PNG, WEBP, SVG
   - Access: Admins only

### Usage Example

```typescript
import { uploadCV, uploadAvatar } from '@/lib/supabase/storage'

// Upload CV
const cvUrl = await uploadCV(candidateId, cvFile)

// Upload avatar
const avatarUrl = await uploadAvatar(userId, avatarFile)
```

## Edge Functions

### AI CV Scoring

Location: `supabase/functions/ai-cv-scoring/`

**Deploy**:
```bash
supabase functions deploy ai-cv-scoring

# Set secrets
supabase secrets set OPENAI_API_KEY=your-key
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('ai-cv-scoring', {
  body: {
    candidate_id: 'uuid',
    cv_text: 'extracted CV text',
    job_requirements: 'job description',
  },
})
```

### AI Performance Synthesis

Location: `supabase/functions/ai-performance-synthesis/`

**Deploy**:
```bash
supabase functions deploy ai-performance-synthesis
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('ai-performance-synthesis', {
  body: {
    review_id: 'uuid',
    profile_id: 'uuid',
    include_historical: true,
  },
})
```

### Testing Edge Functions Locally

```bash
# Start local Supabase (includes Edge Functions)
supabase start

# Test function
supabase functions serve ai-cv-scoring

# Invoke locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-cv-scoring' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"candidate_id":"test","cv_text":"test","job_requirements":"test"}'
```

## Type Generation

### Generate TypeScript Types

```bash
# From local database
supabase gen types typescript --local > src/types/database.types.ts

# From remote database
supabase gen types typescript --project-ref your-ref > src/types/database.types.ts

# Add to package.json scripts
npm pkg set scripts.types="supabase gen types typescript --local > src/types/database.types.ts"
```

### Type-Safe Queries

Use generated types with Supabase client:

```typescript
import { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(url, key)

// Fully typed queries
const { data } = await supabase
  .from('goals')
  .select('*')
  .eq('status', 'active')
```

## Testing

### Test Data Setup

```sql
-- Create test organization
INSERT INTO organizations (name, slug)
VALUES ('Test Corp', 'test-corp')
RETURNING id;

-- Create test users with different roles
INSERT INTO profiles (id, organization_id, email, full_name, role)
VALUES
  ('admin-id', 'org-id', 'admin@test.com', 'Admin User', 'admin'),
  ('manager-id', 'org-id', 'manager@test.com', 'Manager User', 'manager'),
  ('employee-id', 'org-id', 'employee@test.com', 'Employee User', 'employee');
```

### RLS Testing Script

Create `supabase/tests/test_rls.sql`:

```sql
-- Test RLS policies
BEGIN;

-- Set session as employee
SELECT set_config('request.jwt.claim.sub', 'employee-id', true);

-- Should only see own organization's data
SELECT COUNT(*) FROM goals WHERE organization_id != (SELECT organization_id FROM profiles WHERE id = 'employee-id');
-- Expected: 0

-- Try to update another user's goal (should fail)
UPDATE goals SET title = 'Hacked' WHERE owner_id != 'employee-id';
-- Expected: 0 rows affected

ROLLBACK;
```

Run with: `psql -h localhost -p 54322 -U postgres -d postgres -f supabase/tests/test_rls.sql`

## Security Best Practices

### 1. API Key Management

**NEVER expose service role key to client!**

- ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side
- ❌ DON'T use `SUPABASE_SERVICE_ROLE_KEY` in browser code
- ✅ Use service role key only in server-side code or Edge Functions

### 2. Row Level Security

**Always enable RLS on all tables:**

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

**Test policies thoroughly** before deploying to production.

### 3. Multi-Tenant Isolation

- Always include `organization_id` in queries
- Use RLS helper functions: `get_user_organization_id()`, `has_role()`
- Test cross-tenant access attempts

### 4. Input Validation

- Validate data at database level with CHECK constraints
- Use strong typing with TypeScript
- Sanitize user inputs before passing to AI APIs

### 5. Rate Limiting

Consider implementing rate limiting for:
- Edge Functions (AI calls are expensive)
- File uploads
- Authentication endpoints

Use Supabase's built-in rate limiting or implement custom middleware.

### 6. Storage Security

- Set appropriate file size limits
- Restrict allowed MIME types
- Use signed URLs for private content
- Scan uploaded files for malware (consider external service)

### 7. Audit Logging

All tables include audit fields:
- `created_at`: When record was created
- `updated_at`: When record was last modified
- `deleted_at`: Soft delete timestamp

Consider adding more detailed audit logging for sensitive operations.

## Development Workflow

### Local Development

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db reset

# Generate types
npm run types

# Start Next.js dev server
npm run dev
```

### Deploying Changes

```bash
# 1. Create migration for schema changes
supabase migration new your_change

# 2. Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_your_change.sql

# 3. Test locally
supabase db reset

# 4. Push to remote
supabase db push

# 5. Deploy Edge Functions
supabase functions deploy ai-cv-scoring
supabase functions deploy ai-performance-synthesis

# 6. Generate and commit types
npm run types
git add src/types/database.types.ts
git commit -m "Update database types"
```

## Troubleshooting

### Common Issues

**1. RLS Policy Denials**
- Check user's organization_id in profiles table
- Verify role is correct
- Test policies with different user contexts

**2. Migration Errors**
- Ensure migrations run in order
- Check for conflicting constraints
- Use `supabase db reset` to start fresh locally

**3. Type Mismatches**
- Regenerate types after schema changes
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

**4. Edge Function Errors**
- Check function logs: `supabase functions logs ai-cv-scoring`
- Verify environment variables: `supabase secrets list`
- Test locally before deploying

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## Support

For issues specific to this implementation:
1. Check migration files for schema details
2. Review RLS policies in `20250101000006_rls_policies.sql`
3. Test with provided SQL test scripts
4. Consult type definitions in `src/types/`

For Supabase platform issues:
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
