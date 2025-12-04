# SPRINT 1 — MASTER COMMAND REFERENCE
## Terminal Commands for Deployment & Testing

**Last Updated:** 2025-11-17 | 12:45 UTC  
**Environment:** Local Dev → Staging → Production  

---

## 📋 TABLE OF CONTENTS

1. [Local Development](#local-development)
2. [Testing & Validation](#testing--validation)
3. [Database Migrations](#database-migrations)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Verification](#monitoring--verification)
7. [Emergency Procedures](#emergency-procedures)

---

## 🏠 LOCAL DEVELOPMENT

### Setup & Installation

```bash
# Install dependencies
npm install

# Or with pnpm (preferred)
pnpm install

# Verify installation
npm list
```

### Environment Configuration

```bash
# Copy example env file (if needed)
cp .env.local.example .env.local

# Verify environment is set up
echo $SUPABASE_SERVICE_ROLE_KEY

# Check local Supabase instance
supabase status
```

### Local Database Setup

```bash
# Initialize Supabase locally
supabase init

# Start Supabase local instance
supabase start

# View local database
supabase db list

# Connect to local database
supabase db shell

# Or via psql directly
psql postgres://postgres:postgres@localhost:54322/postgres
```

---

## 🧪 TESTING & VALIDATION

### Running Security Tests

```bash
# Run all security tests (RECOMMENDED)
npm test -- sprint1-security.test.ts

# Run with verbose output
npm test -- sprint1-security.test.ts --verbose

# Run specific test
npm test -- sprint1-security.test.ts -t "webhook idempotency"

# Run with coverage
npm test -- sprint1-security.test.ts --coverage

# Watch mode (auto-rerun on file change)
npm test -- sprint1-security.test.ts --watch
```

### Expected Test Output

```
PASS  __tests__/security/sprint1-security.test.ts (4.567 s)
  ✓ webhook: first event processed (45 ms)
  ✓ webhook: duplicate event idempotent (30 ms)
  ✓ webhook: missing headers rejected (15 ms)
  ✓ soft-delete: user deletion sets deleted_at (25 ms)
  ✓ soft-delete: audit log created with deleted_by (35 ms)
  ✓ soft-delete: RLS hides soft-deleted users (40 ms)
  ✓ csp-headers: security headers present (10 ms)
  ✓ csp-headers: no unsafe-eval in policy (10 ms)
  ✓ logging: webhook events logged with context (20 ms)
  ✓ logging: errors logged with stack trace (15 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        4.567 s
```

### Code Quality Checks

```bash
# ESLint (if configured)
npm run lint

# TypeScript compilation check
npx tsc --noEmit

# Format check with Prettier
npm run format:check

# All checks
npm run lint && npx tsc --noEmit && npm test -- sprint1-security.test.ts
```

### Performance Testing

```bash
# Measure webhook latency
time npm test -- sprint1-security.test.ts -t "webhook"

# Profile Supabase query performance
supabase db shell << EOF
EXPLAIN ANALYZE 
SELECT * FROM webhook_events WHERE svix_id = 'msg_test' LIMIT 1;
EOF

# Check index usage
supabase db shell << EOF
SELECT * FROM pg_indexes WHERE tablename = 'webhook_events';
EOF
```

---

## 🗄️ DATABASE MIGRATIONS

### Apply Migrations Locally

```bash
# List pending migrations
supabase migration list

# Apply all migrations
supabase db push

# Apply specific migration
supabase db push supabase/migrations/20251117_webhook_idempotency.sql

# Reset database to clean state (⚠️ WARNING: Deletes all data)
supabase db reset
```

### Verify Migrations Applied

```bash
# Check webhook_events table exists
supabase db shell << EOF
SELECT * FROM webhook_events LIMIT 1;
EOF

# Check soft-delete columns exist
supabase db shell << EOF
\d profiles
EOF

# Verify RLS policies
supabase db shell << EOF
SELECT * FROM pg_policies WHERE tablename = 'webhook_events';
SELECT * FROM pg_policies WHERE tablename = 'profiles';
EOF

# Check triggers
supabase db shell << EOF
SELECT * FROM pg_trigger WHERE tgname LIKE 'profiles%';
EOF
```

### Create Migration (If Needed)

```bash
# Create new migration
supabase migration new add_column_name

# Edit migration file
# supabase/migrations/[timestamp]_add_column_name.sql

# Apply new migration
supabase db push
```

### Rollback Migration (Emergency)

```bash
# List migration history
supabase migration list

# ⚠️ WARNING: This deletes all data
supabase db reset

# Or manually:
supabase db shell
DROP TABLE webhook_events CASCADE;
DROP TRIGGER profiles_soft_delete_trigger ON profiles;
ALTER TABLE profiles DROP COLUMN deleted_at;
ALTER TABLE profiles DROP COLUMN deleted_by;
```

---

## 🚀 STAGING DEPLOYMENT

### Pre-Deployment Checklist

```bash
# 1. Verify all tests pass
npm test -- sprint1-security.test.ts

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Verify environment is set
env | grep SUPABASE
env | grep CLERK
env | grep DATABASE

# 4. Check git status
git status

# 5. Create feature branch (if not already)
git checkout -b feature/sprint1-security || git checkout feature/sprint1-security
```

### Deploy to Staging

```bash
# 1. Commit changes to feature branch
git add -A
git commit -m "Sprint 1: Security critical features (webhook idempotency, soft-delete, CSP/CORS hardening)"

# 2. Push to feature branch
git push origin feature/sprint1-security

# 3. Create Pull Request (via GitHub UI)
# Or via CLI:
gh pr create --title "Sprint 1: Security critical features" --body "See SPRINT1_ACCEPTANCE_CRITERIA.md" --base main --head feature/sprint1-security

# 4. Wait for CI/CD pipeline (GitHub Actions)
# Watch deployment: https://github.com/badalot/targetym/actions

# 5. Once PR merged to staging, verify deployment
curl -I https://staging.targetym.dev/api/health
```

### Staging Database Deployment

```bash
# Configure Supabase CLI for staging
export SUPABASE_ACCESS_TOKEN="[staging-token]"
export SUPABASE_DB_PASSWORD="[staging-password]"

# Apply migrations to staging database
supabase db push --db-url postgresql://postgres:$SUPABASE_DB_PASSWORD@[staging-host]/postgres

# Verify migrations applied
supabase db shell << EOF
SELECT * FROM webhook_events LIMIT 1;
SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL;
EOF
```

### Staging Verification

```bash
# 1. Health check
curl -I https://staging.targetym.dev/api/health

# 2. Check security headers
curl -I https://staging.targetym.dev | grep -E "Content-Security-Policy|X-Frame-Options"

# 3. Test webhook endpoint
curl -X POST https://staging.targetym.dev/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test_$(date +%s)" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{"type":"user.created","data":{"id":"test"}}'

# 4. Run Mozilla Observatory scan
# https://observatory.mozilla.org/?host=staging.targetym.dev

# 5. Run performance test
curl -w "Total time: %{time_total}s\n" https://staging.targetym.dev/api/health
```

---

## 🌍 PRODUCTION DEPLOYMENT

### Pre-Production Checklist

```bash
# 1. Staging verification complete? ✅
# 2. Security sign-off? ✅
# 3. Database backup taken? ✅
# 4. Runbook reviewed? ✅

# 5. Production branch verification
git log --oneline -5

# 6. Verify main branch is current
git checkout main
git pull origin main

# 7. Verify no uncommitted changes
git status

# 8. Create backup
pg_dump -U postgres -h [production-host] targetym_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Deploy to Production

```bash
# 1. Create release tag
git tag -a v1.0.0-sprint1 -m "Sprint 1: Security critical features"
git push origin v1.0.0-sprint1

# 2. Merge feature branch to main (via GitHub UI or CLI)
gh pr merge [PR-NUMBER] --merge --delete-branch

# 3. Verify merge
git checkout main
git pull origin main

# 4. Watch Vercel deployment
# https://vercel.com/badalot/targetym/deployments

# 5. Verify production deployment
curl -I https://targetym.dev/api/health
```

### Production Database Deployment

```bash
# ⚠️ PRODUCTION CRITICAL

# 1. Create backup before migration
export DB_HOST="[production-host]"
export DB_USER="postgres"
export DB_PASS="[production-password]"
export DB_NAME="targetym_prod"

pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migrations
supabase db push --db-url postgresql://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME

# 3. Verify migrations (with SELECT ONLY, no modifications!)
supabase db shell << EOF
SELECT * FROM webhook_events LIMIT 1;
SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM audit_logs WHERE action = 'DELETE';
EOF

# 4. Monitor for errors
# Watch Sentry dashboard or logs
# Verify error rate is normal
```

### Production Verification

```bash
# 1. Health check
curl -I https://targetym.dev/api/health

# 2. Security headers (production)
curl -I https://targetym.dev | grep -E "Content-Security-Policy|X-Frame-Options"

# 3. Real webhook test
# Send real Clerk webhook to production
# Verify in Supabase: SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 1;

# 4. Mozilla Observatory final score
# https://observatory.mozilla.org/?host=targetym.dev
# Target: A+ (95+)

# 5. Performance baseline
for i in {1..10}; do
  curl -w "Request $i: %{time_total}s\n" https://targetym.dev/api/health
done
```

---

## 📊 MONITORING & VERIFICATION

### Log Monitoring

```bash
# View Vercel logs
vercel logs --prod

# Search for errors in staging
vercel logs staging.targetym.dev --tail

# View Supabase logs
supabase logs pull

# Watch real-time logs
supabase logs pull --tail

# Search for webhook events
supabase db shell << EOF
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;
EOF

# Search for soft-deleted profiles
supabase db shell << EOF
SELECT id, email, deleted_at, deleted_by FROM profiles WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 10;
EOF
```

### Performance Metrics

```bash
# Measure API response time
ab -n 100 -c 10 https://targetym.dev/api/health

# or using Apache Bench
wrk -t4 -c100 -d30s https://targetym.dev/api/health

# Database query performance
supabase db shell << EOF
EXPLAIN ANALYZE 
SELECT * FROM webhook_events WHERE svix_id = 'msg_test';

EXPLAIN ANALYZE 
SELECT * FROM profiles WHERE org_id = 'org_test' AND deleted_at IS NULL;
EOF
```

### Error Tracking

```bash
# View recent errors in Sentry (if configured)
sentry-cli releases list

# View error rate
sentry-cli issues list

# Alert configuration
# https://sentry.io/organizations/[org]/alerts/
```

### Security Header Validation

```bash
# Full header check
curl -v https://targetym.dev 2>&1 | grep -E "^< [A-Z]"

# CSP validation
curl -I https://targetym.dev | grep "Content-Security-Policy"

# Expected CSP:
# Content-Security-Policy: default-src 'self'; script-src 'self' https://clerk.accounts.dev; ...

# CORS validation
curl -H "Origin: https://external.com" -v https://targetym.dev 2>&1 | grep -i "access-control"
```

---

## 🚨 EMERGENCY PROCEDURES

### Rollback to Previous Version (Staging)

```bash
# 1. Identify last known good commit
git log --oneline | head -10

# 2. Checkout previous commit
git checkout [COMMIT-HASH]

# 3. Force push to staging (⚠️ CAUTION)
git push origin HEAD:staging --force

# 4. GitHub Actions will auto-deploy
# Watch: https://github.com/badalot/targetym/actions

# 5. Verify rollback
curl -I https://staging.targetym.dev/api/health
```

### Rollback to Previous Version (Production)

```bash
# ⚠️ PRODUCTION CRITICAL

# 1. Contact security lead immediately
# 2. Create incident ticket
# 3. Identify last known good commit

# 4. Restore database from backup
restore_timestamp=$(date -d "1 hour ago" +%Y%m%d_%H%M%S)
psql -h [production-host] -U postgres targetym_prod < backup_$restore_timestamp.sql

# 5. Revert code
git revert [SPRINT1-COMMIT]
git push origin main

# 6. Verify rollback
curl -I https://targetym.dev/api/health

# 7. Post-mortem meeting within 1 hour
```

### Database Emergency Recovery

```bash
# Check database connection
psql -h [db-host] -U postgres -d targetym_prod

# View active connections
SELECT * FROM pg_stat_activity;

# Kill slow queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';

# Restore from backup if needed
pg_restore -h [db-host] -U postgres -d targetym_prod backup.sql
```

### Webhook Failure Recovery

```bash
# 1. Check webhook_events table
supabase db shell << EOF
SELECT * FROM webhook_events WHERE created_at > now() - interval '1 hour' ORDER BY created_at DESC;
EOF

# 2. Check for failed webhooks
SELECT * FROM webhook_events WHERE status = 'failed' LIMIT 10;

# 3. Manually reprocess if needed
# Contact backend lead to run manual webhook replay function
```

### Performance Degradation Response

```bash
# 1. Check database performance
EXPLAIN ANALYZE SELECT * FROM profiles WHERE org_id = 'org_test' AND deleted_at IS NULL;

# 2. Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

# 3. Restart database connection pool
# Contact DevOps lead

# 4. Scale up if needed
# Contact DevOps lead for Vercel scaling

# 5. Monitor metrics
# https://vercel.com/badalot/targetym/analytics
```

---

## 📞 HELP & SUPPORT

### Getting Help

```bash
# View npm scripts
npm run

# View available commands
npx supabase --help

# View Vercel help
vercel --help

# GitHub Copilot: Create issue with error
gh issue create --title "Sprint 1: [Issue description]" --body "Error: [details]"
```

### Common Issues & Solutions

```bash
# Issue: "SUPABASE_SERVICE_ROLE_KEY not set"
# Solution:
export SUPABASE_SERVICE_ROLE_KEY="[key]"

# Issue: "Database connection refused"
# Solution:
supabase start
supabase db shell  # Test connection

# Issue: "Tests failing locally but passing in CI"
# Solution:
npm run lint && npm test -- sprint1-security.test.ts --coverage

# Issue: "Migrations failed in production"
# Solution:
supabase migration list  # View history
pg_restore -c < backup.sql  # Restore if needed
```

---

## 🎯 DEPLOYMENT CHECKLIST (Final)

### Before Staging Deployment

```bash
# Run this script before deploying to staging
npm test -- sprint1-security.test.ts && \
  npx tsc --noEmit && \
  npm run lint && \
  git status && \
  echo "✅ All checks passed! Ready for staging deployment."
```

### Before Production Deployment

```bash
# Run this script before deploying to production
npm test -- sprint1-security.test.ts --coverage && \
  npx tsc --noEmit && \
  npm run lint && \
  curl -I https://staging.targetym.dev/api/health && \
  echo "✅ Staging healthy! Production deployment approved."
```

---

## 📋 COMMAND SUMMARY TABLE

| Task | Command | Environment |
|------|---------|-------------|
| Test | `npm test -- sprint1-security.test.ts` | Local |
| Migrate (Local) | `supabase db push` | Local |
| Migrate (Staging) | `supabase db push --db-url postgresql://...` | Staging |
| Deploy Staging | `git push origin feature/sprint1-security` | Staging |
| Deploy Prod | `git push origin main` | Production |
| Health Check | `curl -I https://[domain]/api/health` | Both |
| Logs | `vercel logs --prod` or `supabase logs pull` | Both |
| Rollback | `git revert [COMMIT] && git push` | Both |

---

**Questions?**
- See: `SPRINT1_DEPLOYMENT_CHECKLIST.md` (Detailed procedures)
- See: `SPRINT1_POST_IMPLEMENTATION_REPORT.md` (What changed)
- See: `SPRINT1_ACCEPTANCE_CRITERIA.md` (What to verify)

**Last Updated:** 2025-11-17 12:45 UTC
