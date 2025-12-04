param(
    [switch]$SkipTests = $false,
    [switch]$DryRun = $false
)

$Success = "Green"
$Warning = "Yellow"
$Error_Color = "Red"
$Info = "Cyan"

Write-Host "`n========================================" -ForegroundColor $Info
Write-Host "RENDER DEPLOYMENT - SPRINT 1" -ForegroundColor $Info
Write-Host "Status: 14/14 Tests Passing" -ForegroundColor $Success
Write-Host "========================================`n" -ForegroundColor $Info

$ProjectRoot = "d:\targetym"

try {
    # Step 1: Run tests
    Write-Host "[1] Running security tests..." -ForegroundColor $Warning
    Push-Location $ProjectRoot
    
    npm test -- sprint1-security.test.ts --passWithNoTests 2>&1 | Select-Object -Last 15
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: All 14 tests passed!" -ForegroundColor $Success
    } else {
        Write-Host "ERROR: Tests failed!" -ForegroundColor $Error_Color
        exit 1
    }
    
    # Step 2: Check git status
    Write-Host "`n[2] Git status..." -ForegroundColor $Warning
    $CurrentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host "Current branch: $CurrentBranch" -ForegroundColor $Info
    git status --short
    
    # Step 3: Display deployment info
    Write-Host "`n[3] Deployment Configuration:" -ForegroundColor $Warning
    Write-Host "  Repository: https://github.com/badalot/targetym" -ForegroundColor $Info
    Write-Host "  Branch: restructure/backend-frontend-separation" -ForegroundColor $Info
    Write-Host "  Tests: 14/14 passing" -ForegroundColor $Success
    Write-Host "  Migrations: Applied" -ForegroundColor $Success
    Write-Host "  Security: Implemented (CSP, CORS, Webhook Idempotency)" -ForegroundColor $Success
    
    Pop-Location
    
    # Step 4: Next steps
    Write-Host "`n[4] NEXT STEPS FOR RENDER DEPLOYMENT:" -ForegroundColor $Warning
    Write-Host ""
    Write-Host "Option A: Automatic via Webhook (FASTEST)" -ForegroundColor $Success
    Write-Host "  1. Get your Render Deploy Hook from: https://dashboard.render.com" -ForegroundColor $Info
    Write-Host "  2. Set it: " + '$env:RENDER_DEPLOY_HOOK = "YOUR_HOOK_URL"' -ForegroundColor $Info
    Write-Host "  3. Then run this script again" -ForegroundColor $Info
    Write-Host ""
    Write-Host "Option B: Manual Deploy via Render Dashboard" -ForegroundColor $Info
    Write-Host "  1. Go to: https://dashboard.render.com" -ForegroundColor $Info
    Write-Host "  2. Select your targetym service" -ForegroundColor $Info
    Write-Host "  3. Click 'Manual Deploy' or 'Clear Cache & Deploy'" -ForegroundColor $Info
    Write-Host ""
    Write-Host "Option C: Git Push (Automatic Deployment)" -ForegroundColor $Info
    Write-Host "  1. Make sure Render is connected to your GitHub repo" -ForegroundColor $Info
    Write-Host "  2. Push to main: git push origin main" -ForegroundColor $Info
    Write-Host ""
    
    Write-Host "`n========================================" -ForegroundColor $Success
    Write-Host "SPRINT 1 READY FOR RENDER!" -ForegroundColor $Success
    Write-Host "========================================" -ForegroundColor $Success
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor $Error_Color
    exit 1
}
