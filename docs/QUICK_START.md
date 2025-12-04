# Quick Start Guide - Phase 2 Supabase Setup

Get up and running with Supabase for Phase 2 Core HR Modules in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Git repository initialized

## Step-by-Step Setup

### 1. Install Dependencies (1 min)

```bash
cd D:\targetym
npm install
```

### 2. Setup Supabase Project (2 min)

**Option A: Use Existing Supabase Project**

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Get your project URL and keys from Supabase Dashboard
# Dashboard > Settings > API
```

**Option B: Local Development (Recommended for Testing)**

```bash
# Initialize Supabase locally
supabase init

# Start local Supabase (includes PostgreSQL, Studio, Edge Functions)
npm run supabase:start

# Note the API URL and anon key from output
```

### 3. Configure Environment Variables (1 min)

Create `.env.local` in project root:

```bash
# For local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start

# For production (from Supabase Dashboard)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations (2 min)

```bash
# Apply all migrations to create tables, RLS policies, functions
npm run supabase:reset

# This will:
# - Create organizations table
# - Update profiles with organization relationships
# - Create goals, key_results tables
# - Create job_postings, candidates, interviews tables
# - Create performance_reviews and related tables
# - Apply all RLS policies
# - Setup storage buckets
# - Create database functions and views
```

### 5. Generate TypeScript Types (1 min)

```bash
# Generate types from database schema
npm run supabase:types

# Types will be generated at: src/types/database.types.ts
```

### 6. Verify Setup (2 min)

```bash
# Test RLS policies
npm run supabase:test

# Open Supabase Studio
# Visit: http://localhost:54323 (local) or your project dashboard (cloud)

# Verify:
# - All tables created (organizations, profiles, goals, etc.)
# - RLS enabled on all tables
# - Storage buckets created (cvs, avatars, organization-logos)
```

### 7. Create Test Data (Optional, 1 min)

```sql
-- Open Supabase Studio SQL Editor or use psql

-- Create test organization
INSERT INTO organizations (id, name, slug)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corp', 'acme-corp');

-- Create test admin user (after authentication)
INSERT INTO profiles (id, organization_id, email, full_name, role)
VALUES (
  'your-user-id-from-auth',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@acme.com',
  'Admin User',
  'admin'
);
```

### 8. Start Development (30 sec)

```bash
# Start Next.js development server
npm run dev

# Visit: http://localhost:3000
```

## Verification Checklist

After setup, verify these items:

- [ ] Supabase is running (local or cloud)
- [ ] Environment variables are set in `.env.local`
- [ ] All 7 migrations have been applied
- [ ] TypeScript types generated in `src/types/database.types.ts`
- [ ] RLS policies are active (run test script)
- [ ] Storage buckets created (cvs, avatars, organization-logos)
- [ ] Next.js dev server starts without errors

## Next Steps

### For Development

1. **Authentication Setup** (Phase 1)
   - Implement sign up/login flows
   - Create profile on user registration
   - Assign users to organizations

2. **Create UI Components**
   - Goals & OKRs management interface
   - Recruitment pipeline
   - Performance review forms

3. **Test RLS Policies**
   - Create multiple test users with different roles
   - Verify data isolation between organizations
   - Test role-based permissions

### For Production Deployment

1. **Create Production Supabase Project**
   ```bash
   # Create new project in Supabase Dashboard
   # Then link and push migrations
   supabase link --project-ref your-prod-ref
   npm run supabase:push
   ```

2. **Deploy Edge Functions**
   ```bash
   # Deploy AI functions
   supabase functions deploy ai-cv-scoring
   supabase functions deploy ai-performance-synthesis

   # Set secrets
   supabase secrets set OPENAI_API_KEY=your-key
   ```

3. **Update Production Environment Variables**
   - Set production Supabase URL and keys
   - Configure AI API keys
   - Setup environment variables in hosting platform

4. **Enable Additional Security**
   - Configure email authentication
   - Setup custom SMTP
   - Enable MFA (Multi-Factor Authentication)
   - Configure rate limiting
   - Review and adjust RLS policies

## Troubleshooting

### Issue: Migrations fail to apply

**Solution:**
```bash
# Reset local database
npm run supabase:stop
npm run supabase:start
npm run supabase:reset
```

### Issue: RLS policies blocking all queries

**Solution:**
- Ensure user is authenticated
- Check user has `organization_id` set in profiles table
- Verify user role is valid: 'admin', 'manager', 'employee', or 'hr'
- Run RLS test script to identify specific policy issues

### Issue: Type generation fails

**Solution:**
```bash
# Ensure Supabase is running
npm run supabase:start

# Regenerate types
npm run supabase:types

# If still fails, manually run:
# supabase gen types typescript --local > src/types/database.types.ts
```

### Issue: Cannot connect to local Supabase

**Solution:**
- Check Docker is running (required for local Supabase)
- Verify no port conflicts (54321, 54322, 54323)
- Restart Supabase: `npm run supabase:stop && npm run supabase:start`

### Issue: Edge Functions not working

**Solution:**
- Ensure Deno is installed (required for Edge Functions)
- Check function logs: `supabase functions logs ai-cv-scoring`
- Verify environment variables: `supabase secrets list`
- Test locally: `supabase functions serve ai-cv-scoring`

## Useful Commands

```bash
# Supabase
npm run supabase:start         # Start local Supabase
npm run supabase:stop          # Stop local Supabase
npm run supabase:reset         # Reset DB and apply migrations
npm run supabase:push          # Push migrations to remote
npm run supabase:types         # Generate TypeScript types
npm run supabase:deploy        # Deploy Edge Functions
npm run supabase:test          # Run RLS tests

# Development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm run lint                   # Run ESLint

# Database Access
psql -h localhost -p 54322 -U postgres -d postgres  # Connect to local DB
```

## Resources

- **Documentation**: `docs/SUPABASE_SETUP.md` - Complete setup guide
- **Integration Examples**: `docs/INTEGRATION_EXAMPLES.md` - Code examples
- **Migrations**: `supabase/migrations/` - SQL migration files
- **Types**: `src/types/database.types.ts` - Generated TypeScript types
- **Queries**: `src/lib/supabase/queries.ts` - Type-safe query functions
- **Storage**: `src/lib/supabase/storage.ts` - File upload utilities

## Support

If you encounter issues:

1. Check migration files for schema details
2. Review RLS policies in `supabase/migrations/20250101000006_rls_policies.sql`
3. Run test script: `npm run supabase:test`
4. Consult documentation in `docs/` folder
5. Check Supabase logs: `supabase status` and function logs

## Security Reminder

**IMPORTANT**: Before deploying to production:

1. Review and test all RLS policies
2. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
3. Use environment variables for sensitive data
4. Enable rate limiting on API routes
5. Configure proper CORS settings
6. Review storage bucket policies
7. Enable email confirmation for sign-ups
8. Consider implementing audit logging

---

**Congratulations!** Your Supabase Phase 2 setup is complete. You now have:

- Multi-tenant database architecture
- Row Level Security policies
- Goals & OKRs module
- Recruitment module with AI CV scoring
- Performance management module
- Type-safe database queries
- Storage for file uploads
- AI-powered Edge Functions

Start building your HR management features! 🚀
