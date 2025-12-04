# SPRINT 1 — DEPLOYMENT CHECKLIST
## Production-Ready Verification

**Target Deployment Date:** 2025-11-24  
**Environment:** Staging → Production  

---

## 🔐 PHASE 1: PRE-DEPLOYMENT SECURITY CHECKS

### Secrets Management ✓

- [ ] **SM-001:** All secrets rotated
  - [ ] Supabase keys replaced in dashboard
  - [ ] Clerk keys replaced in dashboard
  - [ ] New values added to GitHub Actions Secrets
  - [ ] Old values deleted from Actions
  - [ ] No plaintext secrets in `.env.local`
  - **Owner:** DevOps Lead
  - **Verification:** Screenshot of GitHub Actions Secrets page

- [ ] **SM-002:** `.env.local.example` matches all env vars
  - [ ] All vars in `.env.local` have placeholder in `.example`
  - [ ] Documentation includes setup instructions
  - [ ] No secrets exposed
  - **Owner:** Backend Lead
  - **Verification:** `diff <(.env.local.example keys) <(.env.local keys)`

- [ ] **SM-003:** Git history clean
  - [ ] No secrets in last 100 commits
  - [ ] `.env.local` added to `.gitignore`
  - [ ] Old commits with secrets rebased or squashed
  - **Owner:** DevOps Lead
  - **Verification:** `git log --all -p | grep -i "SUPABASE\|CLERK\|SECRET" | wc -l` = 0

### Migration Deployment ✓

- [ ] **MD-001:** `webhook_events` table deployed to Supabase
  - [ ] Run migration: `supabase/migrations/20251117_webhook_idempotency.sql`
  - [ ] Table exists: `SELECT * FROM webhook_events;` works
  - [ ] Indexes created: UNIQUE on `svix_id`
  - [ ] RLS policies applied
  - **Owner:** Backend Lead
  - **Verification:** `\d webhook_events` in psql

- [ ] **MD-002:** Soft-delete columns deployed
  - [ ] Run migration: `supabase/migrations/20251117_add_soft_delete_to_profiles.sql`
  - [ ] `profiles.deleted_at` column exists
  - [ ] `profiles.deleted_by` column exists
  - [ ] RLS policy updated to filter `deleted_at IS NULL`
  - [ ] Trigger created for audit logging
  - **Owner:** Backend Lead
  - **Verification:** `SELECT COUNT(*) FROM profiles WHERE deleted_at IS NOT NULL;` = 0

- [ ] **MD-003:** Zero downtime migration verified
  - [ ] Application continues running during migration
  - [ ] No data loss observed
  - [ ] Rollback plan tested (optional)
  - **Owner:** DevOps Lead
  - **Verification:** Application uptime logs during migration

### Code Review ✓

- [ ] **CR-001:** Webhook handler code reviewed
  - [ ] Idempotency logic correct
  - [ ] Soft-delete instead of hard-delete
  - [ ] Pino logging integration complete
  - [ ] Error handling comprehensive
  - **Owner:** Security Lead
  - **Verification:** Code review comment: "Approved for production"

- [ ] **CR-002:** Middleware security headers reviewed
  - [ ] CSP strict and correct
  - [ ] CORS limited to trusted origins
  - [ ] No security regressions
  - **Owner:** Security Lead
  - **Verification:** Code review comment: "Approved for production"

- [ ] **CR-003:** Test suite reviewed
  - [ ] Tests cover all critical paths
  - [ ] Mock data realistic
  - [ ] Assertions comprehensive
  - **Owner:** QA Lead
  - **Verification:** Code review comment: "Approved for production"

---

## 🧪 PHASE 2: TESTING VERIFICATION

### Unit Tests ✓

- [ ] **UT-001:** All security tests pass
  - [ ] Command: `npm test -- sprint1-security.test.ts`
  - [ ] Result: 100% pass rate
  - [ ] No skipped tests
  - **Owner:** QA Lead
  - **Verification:** Test output shows "Tests: 10 passed, 0 failed"

- [ ] **UT-002:** Webhook idempotency tests pass
  - [ ] Test: First webhook processed (inserted)
  - [ ] Test: Duplicate webhook idempotent (not inserted)
  - [ ] Both return HTTP 200
  - **Owner:** QA Lead
  - **Verification:** Test output: "✓ webhook idempotency"

- [ ] **UT-003:** Soft-delete tests pass
  - [ ] Test: User soft-delete creates audit log
  - [ ] Test: RLS hides soft-deleted users
  - [ ] Test: Hard-delete not called
  - **Owner:** QA Lead
  - **Verification:** Test output: "✓ soft-delete"

- [ ] **UT-004:** Security headers tests pass
  - [ ] Test: CSP header present
  - [ ] Test: No unsafe-eval in CSP
  - [ ] Test: CORS origin validation
  - **Owner:** QA Lead
  - **Verification:** Test output: "✓ security-headers"

### Integration Tests ✓

- [ ] **IT-001:** Clerk webhook → Supabase sync works end-to-end
  - [ ] Send user.created webhook
  - [ ] Verify profile created in Supabase
  - [ ] Verify webhook recorded in webhook_events
  - [ ] Send duplicate: verify no second profile
  - **Owner:** QA Lead
  - **Verification:** Manual test + screenshot of DB state

- [ ] **IT-002:** Soft-delete flow works end-to-end
  - [ ] Trigger user deletion in Clerk (delete user from dashboard)
  - [ ] Webhook received: user.deleted
  - [ ] Profile soft-deleted: `deleted_at` set
  - [ ] Audit log created
  - [ ] User not visible in queries (RLS hides)
  - **Owner:** QA Lead
  - **Verification:** Screenshots of Supabase queries

- [ ] **IT-003:** Authentication still works
  - [ ] Login flow: Clerk → Supabase sync → Authenticated
  - [ ] Dashboard accessible
  - [ ] API calls authorized
  - **Owner:** QA Lead
  - **Verification:** Navigate dashboard, make API calls

### Performance Tests ✓

- [ ] **PT-001:** Idempotency check < 100ms
  - [ ] Measure webhook processing time
  - [ ] Idempotency lookup (DB query) < 50ms
  - [ ] Total webhook response < 100ms
  - **Owner:** Backend Lead
  - **Verification:** Logs show `duration_ms < 100`

- [ ] **PT-002:** RLS soft-delete filter < 5ms overhead
  - [ ] Query with `deleted_at IS NULL` filter
  - [ ] No N+1 queries
  - [ ] Indexes working
  - **Owner:** Backend Lead
  - **Verification:** Query explain plan shows index usage

### Security Tests ✓

- [ ] **ST-001:** XSS attack vectors blocked by CSP
  - [ ] Attempt inline script injection
  - [ ] Browser blocks due to CSP
  - [ ] No console errors (expected CSP violation)
  - **Owner:** Security Lead
  - **Verification:** Browser DevTools shows CSP violation

- [ ] **ST-002:** CORS blocks untrusted origins
  - [ ] Request from `https://evil.com`
  - [ ] Server rejects with 403 (or CORS error)
  - [ ] No credentials exposed
  - **Owner:** Security Lead
  - **Verification:** curl request shows rejection

- [ ] **ST-003:** Webhook signature validation still works
  - [ ] Invalid signature → 401
  - [ ] Missing signature → 401
  - [ ] Valid signature → 200
  - **Owner:** Security Lead
  - **Verification:** Manual webhook tests (Svix CLI or equivalent)

---

## 🚀 PHASE 3: STAGING DEPLOYMENT

### Deployment Execution ✓

- [ ] **SD-001:** Code deployed to staging
  - [ ] Commit pushed to `staging` branch
  - [ ] GitHub Actions triggered
  - [ ] Build successful
  - [ ] Deployment successful
  - **Owner:** DevOps Lead
  - **Verification:** GitHub Actions workflow shows "✓ Deploy to Staging"

- [ ] **SD-002:** Migrations applied to staging database
  - [ ] Supabase staging environment updated
  - [ ] Both migrations executed
  - [ ] No rollback needed
  - **Owner:** DevOps Lead
  - **Verification:** Supabase dashboard shows latest migrations

- [ ] **SD-003:** Staging environment healthy
  - [ ] Health check: `GET /api/health` → 200
  - [ ] Clerk webhook endpoint accessible
  - [ ] Supabase connection working
  - [ ] Logs flowing (Pino → Vercel logs)
  - **Owner:** DevOps Lead
  - **Verification:** Vercel dashboard shows healthy status

### Staging Verification ✓

- [ ] **SV-001:** Secrets correctly injected in staging
  - [ ] `echo $SUPABASE_SERVICE_ROLE_KEY` works
  - [ ] No hardcoded secrets in code
  - [ ] GitHub Actions Secrets used
  - **Owner:** DevOps Lead
  - **Verification:** Staging logs show correct Supabase connection

- [ ] **SV-002:** Security headers present in staging
  - [ ] curl staging app, check headers
  - [ ] CSP header present and strict
  - [ ] CORS header present
  - [ ] Other security headers present
  - **Owner:** Security Lead
  - **Verification:** curl -I https://staging.targetym.dev

- [ ] **SV-003:** Webhook test with real Clerk sandbox
  - [ ] Create test user in Clerk sandbox
  - [ ] Webhook received by staging app
  - [ ] User sync'd to staging Supabase
  - [ ] No duplicates on retry
  - **Owner:** Backend Lead
  - **Verification:** Supabase staging database shows new user

- [ ] **SV-004:** Mozilla Observatory score checked
  - [ ] Run scan: https://observatory.mozilla.org
  - [ ] Score ≥ A (90+)
  - [ ] Target A+ (95+)
  - [ ] No CSP violations
  - **Owner:** Security Lead
  - **Verification:** Screenshot showing grade

- [ ] **SV-005:** Performance baseline captured
  - [ ] Response times measured
  - [ ] Webhook processing < 100ms
  - [ ] Database queries < 50ms
  - **Owner:** Backend Lead
  - **Verification:** Performance metrics exported

---

## ✅ PHASE 4: PRODUCTION DEPLOYMENT

### Pre-Production Final Checks ✓

- [ ] **PP-001:** Database backup taken
  - [ ] Full backup of production Supabase
  - [ ] Snapshot stored securely
  - [ ] Rollback procedure documented
  - **Owner:** DevOps Lead
  - **Verification:** Backup timestamp recorded

- [ ] **PP-002:** Monitoring alerts configured
  - [ ] Alert on webhook failures
  - [ ] Alert on CSP violations
  - [ ] Alert on database errors
  - [ ] Alert on API latency spike
  - **Owner:** DevOps Lead
  - **Verification:** Sentry/monitoring dashboard shows alerts

- [ ] **PP-003:** Runbook prepared
  - [ ] Rollback procedure documented
  - [ ] Incident response plan ready
  - [ ] Escalation contacts listed
  - [ ] Emergency contacts available
  - **Owner:** DevOps Lead
  - **Verification:** Runbook shared with team

- [ ] **PP-004:** Maintenance window scheduled (if needed)
  - [ ] No maintenance window needed (zero-downtime)
  - [ ] If required: users notified 24 hours in advance
  - [ ] Communication channels prepared
  - **Owner:** DevOps Lead + Product
  - **Verification:** Communication sent / N/A

### Production Deployment ✓

- [ ] **PD-001:** Code deployed to production
  - [ ] Commit merged to `main` branch
  - [ ] GitHub Actions triggered
  - [ ] Build successful
  - [ ] Deployment successful
  - **Owner:** DevOps Lead
  - **Verification:** GitHub Actions workflow shows "✓ Deploy to Production"

- [ ] **PD-002:** Migrations applied to production
  - [ ] Both SQL migrations executed
  - [ ] Zero downtime verified
  - [ ] No data loss
  - **Owner:** DevOps Lead
  - **Verification:** Supabase production shows latest migrations

- [ ] **PD-003:** Production health verified
  - [ ] `GET /api/health` → 200
  - [ ] Clerk webhook receiving events
  - [ ] Supabase connection healthy
  - [ ] Logs flowing
  - **Owner:** DevOps Lead
  - **Verification:** Vercel dashboard + monitoring dashboard green

### Post-Deployment Verification ✓

- [ ] **PPD-001:** Secrets correctly set in production
  - [ ] No hardcoded secrets in logs
  - [ ] Environment variables injected correctly
  - [ ] GitHub Actions Secrets used
  - **Owner:** Security Lead
  - **Verification:** Log review shows no leaks

- [ ] **PPD-002:** Security headers verified in production
  - [ ] curl production app
  - [ ] CSP header correct
  - [ ] CORS validated
  - **Owner:** Security Lead
  - **Verification:** curl -I https://targetym.dev

- [ ] **PPD-003:** Webhook processing live
  - [ ] Create real user in Clerk production
  - [ ] Webhook received
  - [ ] User synced to production Supabase
  - [ ] Audit log recorded
  - **Owner:** Backend Lead
  - **Verification:** Supabase logs show webhook event

- [ ] **PPD-004:** Mozilla Observatory score in production
  - [ ] Run scan on production domain
  - [ ] Score ≥ A (90+)
  - [ ] Maintain A+ target
  - **Owner:** Security Lead
  - **Verification:** Screenshot of production score

- [ ] **PPD-005:** Performance monitoring active
  - [ ] Metrics flowing to dashboard
  - [ ] No performance regressions
  - [ ] Webhook processing < 100ms
  - **Owner:** Backend Lead
  - **Verification:** Monitoring dashboard shows metrics

- [ ] **PPD-006:** 24-hour stability monitoring
  - [ ] No errors in first hour
  - [ ] No errors in first 24 hours
  - [ ] User activity normal
  - [ ] No customer complaints
  - **Owner:** DevOps Lead + On-call
  - **Verification:** Monitoring dashboard, support tickets

---

## 📊 SIGN-OFF

### Team Sign-Off

| Role | Name | Status | Date |
|------|------|--------|------|
| **Backend Lead** | _________________ | ⏳ Pending | _____ |
| **Frontend Lead** | _________________ | ⏳ Pending | _____ |
| **DevOps Lead** | _________________ | ⏳ Pending | _____ |
| **Security Lead** | _________________ | ⏳ Pending | _____ |
| **QA Lead** | _________________ | ⏳ Pending | _____ |
| **Product Manager** | _________________ | ⏳ Pending | _____ |

### Deployment Timeline

```
Timeline:
┌─ 2025-11-20 (T-4 days)
│  └─ Staging deployment + verification
├─ 2025-11-22 (T-2 days)
│  └─ Final staging sign-off
├─ 2025-11-24 (T-0 Production Deployment)
│  ├─ 09:00 UTC: Backup + Pre-checks
│  ├─ 09:30 UTC: Deploy to production
│  ├─ 10:00 UTC: Post-deployment verification
│  └─ 10:30 UTC: Monitoring + On-call active
└─ 2025-11-25 (T+1 day)
   └─ 24-hour stability check
```

### Emergency Rollback

**If critical issue detected:**
1. Alert DevOps + Security leads immediately
2. Check logs for root cause
3. If rollback needed:
   - Revert to previous commit
   - Restore database from backup
   - Notify stakeholders
4. Post-mortem meeting within 1 hour

**Contact on-call engineer:** [PHONE/SLACK HANDLE]

---

## 📋 CHECKLIST COMPLETION TRACKING

- **Total Items:** 40
- **Completed:** ✅ 0
- **In Progress:** 🔄 0
- **Pending:** ⏳ 40
- **Blocked:** 🚫 0

**Overall Readiness:** 0% 🔴

Next Step: Begin Phase 1 security checks
