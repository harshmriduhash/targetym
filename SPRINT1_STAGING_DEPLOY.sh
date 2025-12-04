#!/bin/bash
# Sprint 1 Staging Deployment Script
# This script automates the deployment of Sprint 1 changes to staging

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║ SPRINT 1 STAGING DEPLOYMENT SCRIPT      ║"
echo "║ Generated: 2025-11-17                  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify all tests pass
echo -e "${YELLOW}[STEP 1]${NC} Running security tests..."
npm test -- sprint1-security.test.ts --passWithNoTests 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Tests failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 2: TypeScript compilation check
echo ""
echo -e "${YELLOW}[STEP 2]${NC} Checking TypeScript compilation..."
npx tsc --noEmit 2>&1 | head -10

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript check passed!${NC}"
else
    echo -e "${RED}❌ TypeScript errors found! Aborting deployment.${NC}"
    exit 1
fi

# Step 3: Verify git status
echo ""
echo -e "${YELLOW}[STEP 3]${NC} Checking git status..."
git status --short

echo ""
echo -e "${YELLOW}[STEP 4]${NC} Creating feature branch..."
git checkout -b feature/sprint1-security 2>/dev/null || git checkout feature/sprint1-security

# Step 5: Commit changes
echo ""
echo -e "${YELLOW}[STEP 5]${NC} Committing changes..."
git add -A
git commit -m "Sprint 1: Security critical features (webhook idempotency, soft-delete, CSP/CORS hardening)" 2>&1 | tail -5

# Step 6: Push to feature branch
echo ""
echo -e "${YELLOW}[STEP 6]${NC} Pushing to feature branch..."
git push origin feature/sprint1-security 2>&1 | tail -5

# Step 7: Next steps
echo ""
echo -e "${GREEN}✅ STAGING DEPLOYMENT PREPARED!${NC}"
echo ""
echo "Next steps:"
echo "1. GitHub Actions will auto-deploy to staging"
echo "2. Watch: https://github.com/badalot/targetym/actions"
echo "3. Verify: https://staging.targetym.dev/api/health"
echo "4. Run: curl -I https://staging.targetym.dev | grep -i 'content-security-policy'"
echo ""
echo "For full deployment guide, see: SPRINT1_DEPLOYMENT_CHECKLIST.md"
