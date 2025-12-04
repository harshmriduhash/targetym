#!/usr/bin/env bash
###############################################################################
# Manual Supabase Migration Deployment Script
#
# This script provides an interactive way to deploy migrations to production
# when automated deployment is not available or desired.
#
# Prerequisites:
# - Node.js 18+ installed
# - npm packages: pg, dotenv
# - Environment variables configured in .env.production
#
# Usage:
#   bash scripts/deploy-supabase-manual.sh
#
# Author: DevOps Team
# Version: 1.0.0
###############################################################################

set -euo pipefail

# Terminal colors for better UX
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly ENV_FILE="${PROJECT_ROOT}/.env.production"
readonly MIGRATION_FILE="${PROJECT_ROOT}/supabase/consolidated-migration.sql"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

###############################################################################
# Validation Functions
###############################################################################

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        log_info "Install from: https://nodejs.org/"
        exit 1
    fi
    log_success "Node.js found: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm found: $(npm --version)"

    # Check pg package
    if ! npm list pg --depth=0 &> /dev/null; then
        log_warning "pg package not found, installing..."
        npm install --no-save pg
    fi
    log_success "pg package available"
}

load_environment() {
    log_info "Loading environment variables..."

    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Create .env.production with required variables:"
        log_info "  DATABASE_URL=postgresql://..."
        log_info "  SUPABASE_SERVICE_ROLE_KEY=..."
        exit 1
    fi

    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a

    # Validate required variables
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log_error "DATABASE_URL not set in $ENV_FILE"
        exit 1
    fi

    log_success "Environment loaded"
}

check_migration_file() {
    log_info "Checking migration file..."

    if [[ ! -f "$MIGRATION_FILE" ]]; then
        log_warning "Consolidated migration not found"
        log_info "Generating migration file..."

        cd "$PROJECT_ROOT"
        npm run supabase:migrate

        if [[ ! -f "$MIGRATION_FILE" ]]; then
            log_error "Failed to generate migration file"
            exit 1
        fi
    fi

    log_success "Migration file ready: $MIGRATION_FILE"
}

###############################################################################
# Deployment Functions
###############################################################################

confirm_deployment() {
    echo ""
    log_warning "You are about to deploy migrations to PRODUCTION"
    echo ""
    echo "Project: juuekovwshynwgjkqkbu"
    echo "Database: Supabase PostgreSQL"
    echo "Migration file: $MIGRATION_FILE"
    echo ""
    read -p "Continue with deployment? (yes/no): " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Deployment cancelled by user"
        exit 0
    fi
}

backup_database() {
    log_info "Creating backup recommendation..."
    echo ""
    log_warning "IMPORTANT: Before proceeding, create a backup in Supabase Dashboard:"
    echo "  1. Go to: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/database/backups"
    echo "  2. Click 'Create Manual Backup'"
    echo "  3. Wait for backup to complete"
    echo ""
    read -p "Have you created a backup? (yes/no): " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warning "Backup not created - deployment aborted"
        log_info "Create a backup first, then run this script again"
        exit 0
    fi

    log_success "Backup confirmed"
}

apply_migrations() {
    log_info "Applying migrations to production..."
    echo ""

    cd "$PROJECT_ROOT"
    node scripts/apply-migrations-ci.js

    if [[ $? -eq 0 ]]; then
        log_success "Migrations applied successfully"
        return 0
    else
        log_error "Migration deployment failed"
        return 1
    fi
}

verify_deployment() {
    log_info "Verifying database state..."
    echo ""

    cd "$PROJECT_ROOT"
    node scripts/verify-database.js

    if [[ $? -eq 0 ]]; then
        log_success "Database verification passed"
        return 0
    else
        log_warning "Some verification checks failed"
        log_info "Review the output above for details"
        return 1
    fi
}

generate_types() {
    log_info "Generating TypeScript types..."

    cd "$PROJECT_ROOT"
    npm run supabase:types:remote

    if [[ $? -eq 0 ]]; then
        log_success "Types generated successfully"
    else
        log_warning "Type generation failed (non-critical)"
        log_info "You can generate types manually later"
    fi
}

###############################################################################
# Rollback Functions
###############################################################################

offer_rollback() {
    echo ""
    log_error "Deployment failed!"
    echo ""
    read -p "Would you like to rollback? (yes/no): " -r
    echo ""

    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        rollback_deployment
    else
        log_info "Rollback declined"
        log_info "Manual intervention required"
        exit 1
    fi
}

rollback_deployment() {
    log_warning "Initiating rollback..."
    echo ""
    log_info "To rollback, restore from backup:"
    echo "  1. Go to: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/database/backups"
    echo "  2. Select the backup created before deployment"
    echo "  3. Click 'Restore'"
    echo ""
    log_warning "Rollback must be done manually via Supabase Dashboard"
    exit 1
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "🚀 SUPABASE MIGRATION DEPLOYMENT"

    # Pre-flight checks
    check_prerequisites
    load_environment
    check_migration_file

    # Deployment confirmation
    confirm_deployment
    backup_database

    print_header "⚡ DEPLOYING MIGRATIONS"

    # Deploy migrations
    if ! apply_migrations; then
        offer_rollback
    fi

    # Post-deployment verification
    print_header "🔍 POST-DEPLOYMENT VERIFICATION"

    if ! verify_deployment; then
        log_warning "Verification completed with warnings"
    fi

    # Generate types (optional)
    print_header "📝 GENERATING TYPES"
    generate_types

    # Success summary
    print_header "🎉 DEPLOYMENT COMPLETE"

    log_success "Migration deployment successful!"
    echo ""
    log_info "Next steps:"
    echo "  1. Deploy application to Render.com"
    echo "  2. Update Supabase Auth URLs"
    echo "  3. Test authentication flow"
    echo "  4. Monitor application logs"
    echo ""
    log_info "Supabase Dashboard: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu"
    echo ""
}

# Trap errors
trap 'log_error "Script failed at line $LINENO"; exit 1' ERR

# Execute main function
main "$@"
