# Workflow CI/CD Complet - Targetym

## Vue d'ensemble

Ce document présente une architecture CI/CD complète pour Targetym, une plateforme RH alimentée par l'IA construite avec Next.js 15.5.4, React 19, TypeScript et Supabase.

**Date de création :** 2025-11-08
**Status :** Proposition à valider
**Version :** 1.0.0

---

## Table des matières

1. [Architecture CI/CD](#architecture-cicd)
2. [Workflows proposés](#workflows-proposés)
3. [Variables d'environnement](#variables-denvironnement)
4. [Stratégie de déploiement](#stratégie-de-déploiement)
5. [Monitoring et alertes](#monitoring-et-alertes)
6. [Sécurité](#sécurité)
7. [Roadmap d'implémentation](#roadmap-dimplémentation)

---

## Architecture CI/CD

### Principes de base

```
┌─────────────────────────────────────────────────────────────┐
│                     Git Flow Strategy                        │
├─────────────────────────────────────────────────────────────┤
│  feature/*  →  develop  →  staging  →  main (production)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline Flow                       │
├─────────────────────────────────────────────────────────────┤
│  Code Push  →  Lint & Test  →  Build  →  Deploy  →  Verify  │
└─────────────────────────────────────────────────────────────┘
```

### Environnements

| Environnement | Branche      | Déclencheur        | URL                              |
|---------------|--------------|-------------------|----------------------------------|
| Development   | develop      | Push automatique  | dev.targetym.com                 |
| Staging       | staging      | Push automatique  | staging.targetym.com             |
| Production    | main         | Manuel + Release  | app.targetym.com                 |

---

## Workflows proposés

### 1. Main CI Pipeline (`ci.yml`)

**Déclencheurs :**
- Push sur toutes les branches
- Pull requests vers develop, staging, main

**Jobs :**
1. **Setup & Dependencies** (1-2 min)
   - Cache Node.js modules
   - Install dependencies avec pnpm
   - Verify lockfile integrity

2. **Code Quality** (2-3 min)
   - ESLint check
   - TypeScript type check
   - Prettier format check
   - Code security scan (CodeQL)

3. **Unit Tests** (3-5 min)
   - Jest unit tests avec coverage
   - Coverage threshold: 80%
   - Upload coverage to Codecov
   - Generate coverage report

4. **Integration Tests** (5-7 min)
   - Start local Supabase
   - Run integration tests
   - Test Server Actions
   - Test RLS policies

5. **Build Verification** (3-5 min)
   - Next.js build avec Turbopack
   - Bundle size analysis
   - Check for build errors
   - Verify environment variables

6. **Accessibility Tests** (2-3 min)
   - jest-axe accessibility tests
   - WCAG 2.1 AA compliance
   - Generate a11y report

**Total durée estimée :** 15-25 minutes

---

### 2. Pull Request Workflow (`pr-checks.yml`)

**Déclencheurs :**
- Pull request opened/updated

**Jobs :**
1. **Labeling automatique**
   - Label par module (goals, recruitment, performance)
   - Label par type (feature, bugfix, refactor)
   - Label par taille (S, M, L, XL)

2. **Code Review Bot**
   - Vérification des conventions de commit
   - Vérification de la description PR
   - Check for breaking changes
   - Security vulnerability scan

3. **Performance Analysis**
   - Bundle size comparison
   - Build time comparison
   - Test coverage delta
   - Lighthouse CI scores

4. **Auto-merge for dependabot**
   - Auto-approve dependency updates
   - Auto-merge si tests passent

**Durée estimée :** 5-10 minutes

---

### 3. Database Migrations (`deploy-supabase.yml`) ✅ EXISTANT

**Améliorations proposées :**
- [ ] Ajouter rollback automatique en cas d'échec
- [ ] Créer un backup automatique avant migration
- [ ] Notifier l'équipe sur Slack/Discord
- [ ] Ajouter des tests de migration (dry-run)
- [ ] Générer un rapport de migration

---

### 4. Deployment Workflow (`deploy.yml`)

**Environnements cibles :**
- Render.com (application Next.js)
- Supabase (base de données)
- Vercel Edge Functions (optionnel pour CDN)

**Staging Deployment (develop → staging):**
```yaml
Trigger: Push to develop
Steps:
  1. Run full CI pipeline
  2. Deploy to Render staging
  3. Apply DB migrations (staging DB)
  4. Run smoke tests
  5. Notify team on Slack
  6. Update deployment status
```

**Production Deployment (main):**
```yaml
Trigger: Manual workflow_dispatch + Release tag
Steps:
  1. Full CI pipeline avec tests E2E
  2. Create database backup
  3. Deploy migrations (dry-run)
  4. Deploy to Render production
  5. Run smoke tests
  6. Health check verification
  7. Monitor Sentry for errors (30 min)
  8. Notify team + stakeholders
  9. Create deployment changelog
```

**Blue-Green Deployment (futur):**
- Deploy nouvelle version (green)
- Run health checks
- Switch traffic gradually (10% → 50% → 100%)
- Auto-rollback si error rate > 5%

**Durée estimée :**
- Staging: 10-15 minutes
- Production: 20-30 minutes

---

### 5. Scheduled Tasks (`scheduled.yml`)

**Cron Jobs :**

1. **Nightly Build & Test** (2:00 AM UTC)
   ```yaml
   - Run full test suite
   - Generate coverage report
   - Check for outdated dependencies
   - Security audit (npm audit, Snyk)
   - Database backup verification
   ```

2. **Weekly Dependency Updates** (Sundays 10:00 AM)
   ```yaml
   - Check for dependency updates
   - Create PR avec changements
   - Run tests automatiquement
   - Auto-merge si patch/minor
   ```

3. **Monthly Security Audit** (1st of month)
   ```yaml
   - Run OWASP dependency check
   - Check for CVE vulnerabilities
   - Review Supabase RLS policies
   - Generate security report
   ```

---

### 6. Release Workflow (`release.yml`)

**Déclencheur :**
- Tag v* (ex: v1.2.3)
- Manual workflow dispatch

**Steps :**
1. Validate semver tag
2. Generate changelog automatique
3. Build production bundle
4. Create GitHub Release
5. Deploy to production
6. Update documentation
7. Notify stakeholders
8. Create rollback plan

**Changelog automatique :**
- Parse commit messages (conventional commits)
- Categorize: Features, Fixes, Breaking Changes
- Generate release notes
- Update CHANGELOG.md

---

### 7. Rollback Workflow (`rollback.yml`)

**Déclencheurs :**
- Manual workflow dispatch
- Auto-trigger si error rate > threshold

**Steps :**
1. Identify last stable version
2. Restore database backup (optionnel)
3. Deploy previous version
4. Verify health checks
5. Notify team
6. Create incident report

**Rollback automatique :**
```yaml
Triggers:
  - Error rate > 10% (5 minutes)
  - Response time > 5s (P95)
  - Health check failed (3/3)
  - Sentry error count > 100/min
```

---

### 8. Component Registry Workflows ✅ EXISTANTS

**Workflows existants :**
- `registry-ci.yml` - Build et test du registry
- `registry-publish.yml` - Publication du registry

**Améliorations proposées :**
- [ ] Ajouter des visual regression tests (Percy, Chromatic)
- [ ] Générer une documentation Storybook
- [ ] Publier sur NPM automatiquement
- [ ] Ajouter des tests de performance

---

## Variables d'environnement

### GitHub Secrets requis

**Application :**
```bash
# Next.js
NEXT_PUBLIC_APP_URL
DATABASE_URL

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD

# Authentication (Better Auth)
AUTH_SECRET
AUTH_URL

# Monitoring
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT

# AI Services (optionnel)
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

**CI/CD :**
```bash
# Deployment
RENDER_API_KEY
RENDER_SERVICE_ID

# Notifications
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL

# Code Quality
CODECOV_TOKEN
SNYK_TOKEN

# Package Publishing
NPM_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Configuration par environnement

**Development :**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

**Staging :**
```env
NEXT_PUBLIC_APP_URL=https://staging.targetym.com
DATABASE_URL=postgresql://postgres.<staging-id>:***@supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<staging-id>.supabase.co
```

**Production :**
```env
NEXT_PUBLIC_APP_URL=https://app.targetym.com
DATABASE_URL=postgresql://postgres.<prod-id>:***@supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<prod-id>.supabase.co
```

---

## Stratégie de déploiement

### 1. Gitflow Strategy

```
main (production)
  ↑
staging (pre-production)
  ↑
develop (integration)
  ↑
feature/* (feature branches)
```

**Branch protection rules :**

**main :**
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require conversation resolution
- No force push
- No deletions

**staging :**
- Require pull request reviews (1 approval)
- Require status checks to pass
- No force push

**develop :**
- Require status checks to pass
- Allow force push (avec protection)

### 2. Deployment Strategy

**Feature Development :**
```
1. Create feature/* branch from develop
2. Develop + commit (conventional commits)
3. Open PR to develop
4. CI runs automatically
5. Code review + approval
6. Merge to develop → auto-deploy to dev env
```

**Staging Release :**
```
1. Create PR from develop to staging
2. Full CI + integration tests
3. Approval required
4. Merge to staging → auto-deploy to staging
5. QA testing on staging
6. Smoke tests automated
```

**Production Release :**
```
1. Create release tag (v1.2.3)
2. Full test suite + E2E tests
3. Create PR from staging to main
4. 2 approvals required
5. Merge to main
6. Manual deployment trigger
7. Health checks + monitoring
8. Gradual rollout (10% → 50% → 100%)
```

### 3. Hotfix Strategy

```
1. Create hotfix/* branch from main
2. Fix critical bug
3. Fast-track PR to main (1 approval)
4. Deploy immediately
5. Backport to develop & staging
```

---

## Monitoring et alertes

### 1. Sentry Configuration (✅ Déjà configuré - Phase 2 Day 1)

**Métriques surveillées :**
- Error rate (seuil: < 1%)
- Performance (P95 < 3s)
- User satisfaction (Apdex)
- Custom metrics (goals created, candidates processed, etc.)

**Alertes :**
- Error spike > 10 errors/min → Slack alert
- Performance degradation > 5s → Email + Slack
- Critical error → PagerDuty (optionnel)

### 2. Health Checks

**Endpoint `/api/health` :**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T10:30:00Z",
  "version": "1.2.3",
  "database": "connected",
  "services": {
    "supabase": "ok",
    "redis": "ok",
    "ai": "ok"
  },
  "metrics": {
    "uptime": "99.95%",
    "responseTime": "120ms"
  }
}
```

**Health check schedule :**
- Production: every 1 minute
- Staging: every 5 minutes
- Development: every 30 minutes

### 3. Performance Monitoring

**Core Web Vitals :**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

**Bundle Size Monitoring :**
- Total bundle size < 500 KB
- First Load JS < 200 KB
- Alert si augmentation > 10%

### 4. Database Monitoring

**Supabase Metrics :**
- Query performance (P95 < 100ms)
- Connection pool usage < 80%
- RLS policy violations
- Failed authentication attempts
- Database size growth

**Automated backups :**
- Daily backups (retention: 30 days)
- Pre-migration backups
- On-demand backups via API

---

## Sécurité

### 1. Security Scanning

**Automated scans :**
- `npm audit` on every PR
- Snyk vulnerability scan (weekly)
- OWASP dependency check (monthly)
- CodeQL analysis (on push)
- Secret scanning (GitHub native)

**Security policies :**
- No secrets in code (enforced)
- All dependencies up-to-date (Dependabot)
- Security updates auto-merged
- CVE alerts to Slack

### 2. Authentication & Authorization

**Supabase RLS Policies :**
- All tables have RLS enabled (✅ vérifié)
- Organization-based isolation
- Role-based access (admin, hr, manager, employee)
- Tested in CI via `npm run supabase:test`

**Better Auth :**
- Email authentication only (OAuth disabled)
- Session management
- Rate limiting (Upstash Redis)
- CSRF protection

### 3. Data Protection

**GDPR Compliance :**
- User data deletion
- Data export functionality
- Audit logging
- Encryption at rest (Supabase)
- Encryption in transit (TLS)

### 4. API Security

**Rate Limiting :**
- Global: 100 req/min per IP
- Authenticated: 1000 req/min per user
- Server Actions: custom limits per action
- Implemented with @upstash/ratelimit

**Input Validation :**
- Zod schemas for all inputs
- SQL injection prevention (Supabase parameterized queries)
- XSS protection (React automatic escaping)
- CSRF tokens

---

## Roadmap d'implémentation

### Phase 1 : Setup de base (Semaine 1) ✅ PARTIELLEMENT FAIT

- [x] Deploy Supabase workflow
- [x] Registry CI workflow
- [ ] Main CI pipeline
- [ ] PR checks workflow
- [ ] Basic deployment workflow

**Livrables :**
- CI pipeline fonctionnel
- Automated tests on PR
- Basic deployment to staging

---

### Phase 2 : Amélioration (Semaine 2-3)

- [ ] Production deployment workflow
- [ ] Rollback automation
- [ ] Performance monitoring
- [ ] Health checks implementation
- [ ] Slack/Discord notifications

**Livrables :**
- Production-ready deployment
- Automated rollback
- Real-time alerts

---

### Phase 3 : Optimisation (Semaine 4)

- [ ] Blue-Green deployment
- [ ] Canary releases
- [ ] Visual regression tests
- [ ] E2E tests avec Playwright
- [ ] Advanced security scanning

**Livrables :**
- Zero-downtime deployments
- Advanced testing coverage
- Enhanced security posture

---

### Phase 4 : Excellence (Mois 2)

- [ ] AI-powered code review
- [ ] Predictive failure detection
- [ ] Auto-scaling based on traffic
- [ ] Multi-region deployment
- [ ] Disaster recovery automation

**Livrables :**
- World-class CI/CD pipeline
- Predictive maintenance
- 99.99% uptime

---

## Métriques de succès

### KPIs CI/CD

| Métrique                    | Objectif          | Actuel |
|-----------------------------|-------------------|--------|
| Time to deploy              | < 15 min          | TBD    |
| Deployment frequency        | Multiple/day      | TBD    |
| Change failure rate         | < 5%              | TBD    |
| Mean time to recovery (MTTR)| < 1 hour          | TBD    |
| Test coverage               | > 80%             | 80%✅  |
| Build success rate          | > 95%             | TBD    |
| Security issues             | 0 critical        | TBD    |

### Application Metrics

| Métrique                    | Objectif          |
|-----------------------------|-------------------|
| Uptime                      | 99.9%             |
| Response time (P95)         | < 3s              |
| Error rate                  | < 1%              |
| User satisfaction (Apdex)   | > 0.9             |
| Core Web Vitals (LCP)       | < 2.5s            |

---

## Coûts estimés

### GitHub Actions

**Minutes utilisées :**
- CI Pipeline: ~20 min × 10 runs/day = 200 min/day
- Deployments: ~30 min × 3/day = 90 min/day
- Scheduled: ~60 min/day
- **Total:** ~350 min/day = 10,500 min/mois

**Coût GitHub Actions :**
- Free tier: 2,000 min/mois
- Dépassement: ~8,500 min × $0.008/min = **$68/mois**

### Services externes

| Service         | Plan             | Coût/mois |
|-----------------|------------------|-----------|
| Supabase        | Pro              | $25       |
| Render.com      | Starter          | $7-25     |
| Sentry          | Team             | $26       |
| Upstash Redis   | Pay as you go    | $5-10     |
| Codecov         | Free             | $0        |
| **Total**       |                  | **$131**  |

**Total CI/CD + Infrastructure:** ~$200/mois

---

## Annexes

### A. Structure des fichiers workflow

```
.github/
├── workflows/
│   ├── ci.yml                 # Main CI pipeline
│   ├── pr-checks.yml          # Pull request checks
│   ├── deploy.yml             # Deployment workflow
│   ├── deploy-supabase.yml    # Database migrations ✅
│   ├── release.yml            # Release automation
│   ├── rollback.yml           # Rollback automation
│   ├── scheduled.yml          # Scheduled tasks
│   ├── registry-ci.yml        # Component registry CI ✅
│   └── registry-publish.yml   # Registry publishing ✅
├── actions/                   # Reusable actions
│   ├── setup-node/
│   ├── deploy-render/
│   └── notify-slack/
└── CODEOWNERS                 # Code ownership

scripts/
├── apply-migrations-ci.js     ✅
├── verify-database.js         ✅
├── deploy-supabase-manual.sh  ✅
├── health-check.js            # À créer
├── rollback.js                # À créer
└── smoke-tests.js             # À créer
```

### B. Exemple de commit message (Conventional Commits)

```
feat(goals): add bulk goal creation feature

- Add bulk creation endpoint in Server Action
- Implement CSV upload in UI
- Add validation for bulk data
- Update tests for bulk operations

Breaking Changes: None
Closes: #123

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### C. Checklist de validation avant merge

**Pull Request Checklist :**
- [ ] Tests passent (unit + integration)
- [ ] Coverage ≥ 80%
- [ ] Type check passed
- [ ] Lint passed
- [ ] No security vulnerabilities
- [ ] Performance impact acceptable
- [ ] Documentation mise à jour
- [ ] Changelog updated (si release)
- [ ] Breaking changes documented
- [ ] Reviewers approved

---

## Questions pour validation

Avant d'implémenter ces workflows, veuillez valider :

1. **Stratégie de branches :** Utiliser gitflow (develop → staging → main) ?
2. **Environnements :** Confirmer dev.targetym.com, staging.targetym.com, app.targetym.com ?
3. **Déploiement :** Render.com confirmé pour hosting Next.js ?
4. **Notifications :** Slack ou Discord pour les alertes ?
5. **Budget :** Budget CI/CD de ~$200/mois acceptable ?
6. **Rollback :** Rollback automatique ou manuel pour production ?
7. **Tests E2E :** Implémenter Playwright ou Cypress ?
8. **Blue-Green deployment :** Nécessaire dès Phase 2 ou Phase 3 ?
9. **Multi-région :** Prévu dans la roadmap long-terme ?
10. **SLA :** Objectif uptime de 99.9% réaliste ?

---

## Contact & Support

**Documentation :**
- CLAUDE.md - Instructions projet
- QUICK_START.md - Guide de démarrage
- DATABASE_COMMANDS.md - Commandes Supabase
- Ce document (WORKFLOW_PROPOSAL.md)

**Équipe DevOps :**
- Lead : TBD
- SRE : TBD
- Security : TBD

**Révision :** À valider par l'équipe avant implémentation

---

**Version :** 1.0.0
**Dernière mise à jour :** 2025-11-08
**Status :** 📋 Proposition - En attente de validation
