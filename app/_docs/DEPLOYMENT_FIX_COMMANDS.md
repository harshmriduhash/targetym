# Quick Deployment Fix Commands

## Verify Fixes Locally

### 1. Type Check (should pass for deployment-critical errors)
```bash
npm run type-check
```

### 2. Build Test (production build)
```bash
npm run build
```

### 3. Test Locally (after build)
```bash
npm start
```

---

## Commit Changes

```bash
# Add modified files
git add app/test/ab-testing/page.tsx
git add app/api/webhooks/slack/route.ts
git add next.config.ts

# Commit with descriptive message
git commit -m "fix: resolve build failures for Render deployment

- Fix UI component import paths in AB testing page
- Change Slack webhook runtime from edge to nodejs for crypto support
- Suppress OpenTelemetry bundler warnings in webpack config

Fixes:
- Module not found errors for badge, card, separator components
- Edge Runtime incompatibility with Node.js crypto module
- OpenTelemetry package bundler warnings from Sentry

All critical deployment blockers resolved."

# Push to deployment branch
git push origin restructure/backend-frontend-separation
```

---

## Monitor Deployment

### Render Build Logs
Watch for:
- ✅ Dependencies installed successfully
- ✅ TypeScript compilation passes
- ✅ Next.js build completes
- ✅ No module resolution errors
- ✅ No runtime configuration errors

### Expected Build Output
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   XXX kB        XXX kB
├ ○ /test/ab-testing                    XXX kB        XXX kB
└ ƒ /api/webhooks/slack                  0 B            0 kB

○  (Static)  prerendered as static content
ƒ  (Dynamic) server-rendered on demand
```

---

## Rollback Plan (if needed)

```bash
# Revert all changes
git checkout HEAD~1 app/test/ab-testing/page.tsx
git checkout HEAD~1 app/api/webhooks/slack/route.ts
git checkout HEAD~1 next.config.ts

# Or hard reset to previous commit
git reset --hard HEAD~1
git push origin restructure/backend-frontend-separation --force
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app.render.com/api/health
```

### 2. Test AB Testing Page
```bash
# Visit in browser (requires authentication)
https://your-app.render.com/test/ab-testing
```

### 3. Webhook Endpoint (should return 400 without webhook_id)
```bash
curl -X POST https://your-app.render.com/api/webhooks/slack
# Expected: {"error":"Missing webhook_id parameter"}
```

### 4. Check Sentry Dashboard
- Navigate to Sentry project
- Verify error tracking is active
- Check for any new deployment errors

---

## Troubleshooting

### If Build Still Fails

1. **Check Node Version**
   ```bash
   # Ensure Node.js 24.x is used
   node --version
   ```

2. **Clear Build Cache**
   - In Render dashboard: Clear build cache
   - Trigger manual deploy

3. **Verify Environment Variables**
   Required for build:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`

4. **Check Dependencies**
   ```bash
   # Verify package manager
   pnpm --version

   # Reinstall dependencies
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### If Runtime Errors Occur

1. **Check Render Logs**
   - Application logs in Render dashboard
   - Look for startup errors

2. **Verify Supabase Connection**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check Sentry for Runtime Errors**
   - Review error dashboard
   - Check error frequency and patterns

---

## Success Indicators

### Build Success
- ✅ Build completes without errors
- ✅ All routes compile successfully
- ✅ Static pages generated
- ✅ Production bundle optimized

### Runtime Success
- ✅ Application starts successfully
- ✅ Homepage loads (status 200)
- ✅ API routes respond correctly
- ✅ Database connections established
- ✅ Sentry monitoring active

---

## Next Steps After Successful Deployment

1. **Fix Pre-existing Test Errors**
   - Address TypeScript errors in test files
   - Update test mocks and data
   - Run full test suite: `npm test`

2. **Code Quality Improvements**
   - Audit path alias usage across codebase
   - Standardize import conventions
   - Add ESLint rules for path aliases

3. **Test Page Review**
   - Evaluate if `app/test/` should be in production
   - Consider route groups: `app/(testing)/`
   - Add authentication checks for test pages

4. **Performance Monitoring**
   - Review Sentry performance metrics
   - Monitor response times
   - Check database query performance

---

## Support Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Render Documentation**: https://render.com/docs
- **Sentry Documentation**: https://docs.sentry.io
- **Supabase Documentation**: https://supabase.com/docs

---

**Status**: Ready for deployment
**Estimated Build Time**: 3-5 minutes
**Risk Level**: Low - All fixes verified locally
