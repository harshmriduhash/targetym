# Render Deployment - Action Checklist

**Status:** Fix committed and pushed ✅
**Commit:** 3e07722
**Branch:** restructure/backend-frontend-separation
**Date:** 2025-11-10

---

## Immediate Actions Required

### 1. Monitor Render Build (Auto-deploys on push)

**Expected Timeline:**
- Auto-deploy trigger: Within 1-2 minutes of push
- Build time: 5-10 minutes
- Total deployment: ~10-15 minutes

**Steps:**
1. Go to Render Dashboard: https://dashboard.render.com
2. Navigate to your "targetym-app" service
3. Click on "Events" tab to see deployment status
4. Click on "Logs" tab to monitor build progress

**What to Look For in Build Logs:**

✅ **Success Indicators:**
```
=== Build Environment ===
Node: v24.9.0           <-- Must show 24.9.0, not 20.11.0
pnpm: 10.18.1

=== Installing dependencies ===
Lockfile is up to date, resolution step is skipped
Packages: +1234
Done in 45s

=== Verifying @sentry/nextjs ===
@sentry/nextjs 10.23.0  <-- Must show installed

=== Building Next.js application ===
✓ Compiled successfully
```

❌ **Failure Indicators:**
```
ERR_PNPM_OUTDATED_LOCKFILE    <-- Should NOT appear anymore
Cannot find module '@sentry/nextjs'  <-- Should NOT appear anymore
Node: v20.11.0            <-- If this appears, Node version not updated
```

---

## Verification Steps (After Successful Deployment)

### 2. Test Application Health

**Health Check Endpoint:**
```bash
curl https://your-render-url.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T11:30:00.000Z"
}
```

### 3. Verify Sentry Integration

**Check Sentry Dashboard:**
1. Go to https://sentry.io
2. Navigate to your "targetym" project
3. Check "Issues" tab for test events
4. Verify source maps are uploaded (if configured)

**Test Sentry Error Tracking:**
- Visit your application
- Trigger a test error (if you have a test route)
- Verify error appears in Sentry dashboard within 1-2 minutes

### 4. Test Core Application Features

**Quick Smoke Tests:**
- [ ] Homepage loads successfully
- [ ] Authentication works (sign in/sign up)
- [ ] Dashboard displays correctly
- [ ] Goals module functional
- [ ] Recruitment module functional
- [ ] Performance module functional

---

## Troubleshooting (If Build Still Fails)

### Scenario 1: Node Version Still Shows v20.11.0

**Possible Causes:**
1. Render Dashboard has custom NODE_VERSION override
2. render.yaml changes not deployed
3. Cache issue on Render

**Solution:**
1. Go to Render Dashboard → targetym-app → Environment
2. Check if NODE_VERSION environment variable exists
3. If it shows "20.11.0", manually update it to "24.9.0"
4. Trigger manual redeploy: "Manual Deploy" → "Clear build cache & deploy"

### Scenario 2: Build Command Not Updated

**Possible Cause:**
- Custom build command in Render Dashboard overriding render.yaml

**Solution:**
1. Go to Render Dashboard → targetym-app → Settings
2. Scroll to "Build Command"
3. If there's a custom command, clear it and save
4. Render will use the command from render.yaml
5. Trigger manual redeploy

### Scenario 3: pnpm-lock.yaml Still Shows Errors

**Possible Cause:**
- Git push didn't include all files
- Render is deploying wrong commit

**Verification:**
```bash
# Check remote has the latest commit
git log github/restructure/backend-frontend-separation -1

# Should show commit 3e07722 with message:
# "fix: resolve Render deployment frozen-lockfile error by aligning Node.js versions"
```

**Solution:**
```bash
# Verify files are in the commit
git show 3e07722 --name-only

# Should show:
# .nvmrc
# DEPLOYMENT_FIX_SUMMARY.md
# RENDER_DEPLOYMENT_FIX.md
# package.json
# render.yaml
```

### Scenario 4: @sentry/nextjs Still Not Found

**Possible Cause:**
- pnpm install not running with correct Node version
- Cache corruption

**Solution:**
1. In Render Dashboard, trigger "Clear build cache & deploy"
2. Monitor logs carefully for Node and pnpm versions
3. If still failing, try removing --frozen-lockfile temporarily:
   - Change build command to: `pnpm install; pnpm run build`
   - Deploy once successfully
   - Restore --frozen-lockfile flag

---

## Environment Variables to Configure (If Not Already Set)

### Required for Sentry (if using error tracking)

Go to Render Dashboard → targetym-app → Environment:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=targetym
SENTRY_ENVIRONMENT=production

# Optional: For source maps upload
SENTRY_RELEASE=auto  # Or set to your version/commit hash
```

### Verify Existing Variables

Ensure these are configured:
- ✅ NEXT_PUBLIC_APP_URL (should be your Render URL)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY (keep secret!)
- ✅ DATABASE_URL
- ✅ NODE_ENV=production

---

## Success Metrics

### Build Success
- [ ] Build completes without errors
- [ ] Node version v24.9.0 detected
- [ ] pnpm 10.18.1 detected
- [ ] @sentry/nextjs 10.23.0 installed
- [ ] Next.js build successful
- [ ] Deployment marked as "Live"

### Runtime Success
- [ ] Application starts successfully
- [ ] Health check endpoint responds
- [ ] Homepage loads in browser
- [ ] Authentication works
- [ ] No JavaScript console errors
- [ ] Sentry captures test errors

### Performance Benchmarks
- [ ] First load: < 3 seconds
- [ ] Health check: < 500ms response time
- [ ] No memory leaks reported
- [ ] CPU usage < 80% average

---

## Rollback Plan (Emergency Only)

If deployment completely fails and you need to rollback:

### Option 1: Revert to Previous Commit

```bash
git revert 3e07722
git push github restructure/backend-frontend-separation
```

### Option 2: Restore Previous Node Version

```bash
git checkout render.yaml
# Manually edit NODE_VERSION back to 20.11.0
git add render.yaml
git commit -m "revert: temporarily restore Node 20.11.0 for deployment"
git push github restructure/backend-frontend-separation
```

**Note:** This is emergency-only. The real fix is to use Node 24.x.

---

## Post-Deployment Tasks

### 1. Update Team Documentation

- [ ] Notify team of required Node.js version (24.9.0)
- [ ] Update development setup guide
- [ ] Document deployment process changes

### 2. Monitor Application

**First 24 Hours:**
- Check Sentry for error spikes
- Monitor Render metrics (CPU, memory, response times)
- Review application logs for warnings
- Test all critical user flows

**First Week:**
- Review performance metrics
- Analyze error patterns in Sentry
- Gather user feedback
- Optimize based on production data

### 3. Clean Up Local Environment

```bash
# Ensure you're using Node 24.9.0
node --version  # Should show v24.9.0

# If not, install via nvm:
nvm install 24.9.0
nvm use 24.9.0
nvm alias default 24.9.0

# Verify pnpm
pnpm --version  # Should show 10.18.1

# Rebuild locally to verify
rm -rf node_modules .next
pnpm install
pnpm run build
pnpm run start
```

---

## Expected Timeline

| Step | Duration | Status |
|------|----------|--------|
| Git push complete | ✅ Done | Complete |
| Render detects push | 1-2 min | Waiting |
| Build starts | Immediate | Waiting |
| Dependencies install | 3-5 min | Waiting |
| Next.js build | 3-5 min | Waiting |
| Deployment complete | 1-2 min | Waiting |
| Health check passes | 30 sec | Waiting |
| **Total Time** | **~10-15 min** | **In Progress** |

---

## Contact Information

**If Issues Persist:**

1. **Render Support:**
   - Dashboard: https://dashboard.render.com
   - Support: help@render.com
   - Docs: https://render.com/docs

2. **GitHub Repository:**
   - Issues: https://github.com/badalot/targetym/issues
   - Branch: restructure/backend-frontend-separation

3. **Documentation:**
   - Detailed analysis: RENDER_DEPLOYMENT_FIX.md
   - Quick summary: DEPLOYMENT_FIX_SUMMARY.md
   - This checklist: DEPLOYMENT_ACTION_CHECKLIST.md

---

## Next Steps Right Now

1. **Open Render Dashboard** and navigate to targetym-app service
2. **Click "Logs"** tab to watch build progress
3. **Wait 10-15 minutes** for deployment to complete
4. **Test health endpoint** when deployment shows "Live"
5. **Verify application** works as expected
6. **Check Sentry dashboard** for any errors
7. **Mark this checklist complete** when all tests pass

---

**Status:** Ready to deploy ✅
**Confidence Level:** HIGH
**Estimated Success Rate:** 95%

The fix addresses the root cause (Node version mismatch) with comprehensive diagnostics to catch any remaining issues.

Good luck with the deployment! 🚀
