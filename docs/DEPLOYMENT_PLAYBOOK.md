# 🎬 RENDER DEPLOYMENT PLAYBOOK - STEP-BY-STEP

**Status:** ✅ Ready to Deploy  
**Date:** 2025-11-19  
**Target:** Render.com Production Environment  

---

## 🚀 Choose Your Deployment Method

### **Method 1: FASTEST - Webhook (Recommended)**

If you want the deployment to happen automatically with one command:

#### Step 1: Get Your Render Deploy Hook
1. Go to: https://dashboard.render.com
2. Sign in with your account
3. Select your `targetym` service
4. Go to **Settings** → **Deploy Hook**
5. Copy the webhook URL (looks like `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

#### Step 2: Set Environment Variable
```powershell
# Copy your webhook URL and paste it here
$env:RENDER_DEPLOY_HOOK = "https://api.render.com/deploy/srv-YOUR_HOOK_HERE"

# Verify it's set
echo $env:RENDER_DEPLOY_HOOK
```

#### Step 3: Run Deployment Script
```powershell
cd d:\targetym
.\RENDER_DEPLOY_NOW.ps1
```

#### What Happens Next:
- Script runs 14 security tests (should all pass) ✅
- Shows deployment configuration
- Calls the Render webhook
- Render starts building your app
- **Check Render Dashboard** for deployment progress

**Expected Time:** 2-5 minutes total

---

### **Method 2: EASIEST - Manual Dashboard**

If you prefer to deploy via the Render web interface:

#### Step 1: Open Render Dashboard
- Go to: https://dashboard.render.com
- Sign in

#### Step 2: Select Your Service
- Click on your `targetym` service

#### Step 3: Trigger Deployment
- Find the **Deployments** tab or **Manual Deploy** button
- Click **Manual Deploy** or **Clear Cache & Deploy**
- Confirm the branch is `main`
- Click **Deploy**

#### Step 4: Watch the Deployment
- Render starts building
- Watch the build logs in real-time
- When status turns green → deployment successful!

**Expected Time:** 5-10 minutes

---

### **Method 3: AUTOMATIC - Git Push**

If your Render service is configured to auto-deploy on git push:

#### Step 1: Push to Main Branch
```powershell
cd d:\targetym
git push origin main
```

#### Step 2: GitHub Receives Push
- Your code is now on GitHub
- Render webhook triggers automatically (if configured)

#### Step 3: Render Deploys
- Render detects the change
- Starts building automatically
- Deployment begins

#### Check Progress:
- Dashboard: https://dashboard.render.com
- Watch build logs

**Expected Time:** 5-10 minutes (includes GitHub push + Render detection)

---

## ✅ Post-Deployment Verification Checklist

Once deployment completes, verify everything works:

### 1. Check Service Status
```
✓ Go to: https://dashboard.render.com
✓ Service status should be: "Running" (green)
✓ No errors in build logs
```

### 2. Visit Your Application
```
✓ Get your Render URL from dashboard
✓ Open it in browser
✓ Page loads successfully (no errors)
✓ Basic navigation works
```

### 3. Verify Security Headers
```
✓ Press F12 to open DevTools
✓ Go to Network tab
✓ Refresh the page
✓ Click on the HTML request (first one)
✓ Go to Response Headers
✓ Look for:
  - Content-Security-Policy (CSP header)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
```

### 4. Check Database Connection
```
✓ No database connection errors in logs
✓ App loads without SQL errors
✓ Can view dashboard (if accessible)
```

### 5. Run Tests Locally
```powershell
cd d:\targetym
npm test -- sprint1-security.test.ts
# Should show: 14/14 tests passing ✅
```

### 6. Monitor Render Logs
```
✓ No ERROR messages
✓ No WARN messages about security
✓ App started successfully
```

**All green? ✅ Sprint 1 is live on Render!**

---

## 🔍 If Something Goes Wrong

### Deployment Fails

**Check these:**
1. Build logs in Render dashboard → look for error messages
2. Environment variables → are all required vars set?
3. Node version → should be 18.x
4. npm install → any package errors?

**Solutions:**
```
1. Check error in logs
2. Fix the issue locally
3. Git push the fix
4. Manual Deploy again from dashboard
```

### Health Check Failed

**Check these:**
1. Is the app starting? (check logs)
2. Is PORT set to 3000?
3. Is /health endpoint working?

**Solutions:**
```
1. Check next.config.ts for health endpoint config
2. Ensure PORT=3000 in Render environment
3. Restart the service in Render dashboard
```

### Database Connection Error

**Check these:**
1. Are env vars set?
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
2. Can you connect locally with same env vars?

**Solutions:**
```
1. Go to Render > Settings > Environment
2. Add missing SUPABASE_* variables
3. Save and redeploy
```

### Tests Fail After Deploy

**Check this:**
```powershell
# Does it pass locally?
npm test -- sprint1-security.test.ts

# If yes locally but fails on Render:
# It's likely an environment variable issue
# Make sure all env vars match between local and Render
```

---

## 📊 What You're Deploying

**Sprint 1 Complete Package:**

| Feature | Status | Tests |
|---------|--------|-------|
| Webhook Idempotency | ✅ | 3/3 |
| Soft-Delete | ✅ | 3/3 |
| CSP & CORS Hardening | ✅ | 3/3 |
| Structured Logging | ✅ | 2/2 |
| GDPR Compliance | ✅ | 2/2 |
| Security Summary | ✅ | 1/1 |
| **TOTAL** | **✅ READY** | **14/14** |

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Service status is "Running" on Render
- ✅ App loads without errors
- ✅ Security headers are present (check DevTools)
- ✅ No database connection errors
- ✅ All 14 tests still passing
- ✅ No critical errors in Render logs

---

## 📞 Quick Reference

| Item | Link |
|------|------|
| Render Dashboard | https://dashboard.render.com |
| GitHub Repo | https://github.com/badalot/targetym |
| Deployment Guide | `RENDER_START_HERE.md` |
| Full Status | `docs/DEPLOYMENT_STATUS_SPRINT1.md` |
| GitHub Branch | `restructure/backend-frontend-separation` |

---

## 🎬 Let's Do This!

### Your Next Action:
1. **Choose method** (webhook, manual, or git push)
2. **Follow the steps** for your chosen method
3. **Watch deployment** happen
4. **Verify everything** works
5. **Celebrate!** 🎉 Sprint 1 is live

---

**Pick a method above and let's deploy! 🚀**

*Questions? Check `docs/DEPLOYMENT_STATUS_SPRINT1.md` for detailed info.*

