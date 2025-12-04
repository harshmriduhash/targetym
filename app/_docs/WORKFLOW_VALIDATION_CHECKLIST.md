# Checklist de validation - Workflows CI/CD Targetym

## À valider RAPIDEMENT

Cette checklist vous permet de valider rapidement les choix principaux du workflow CI/CD proposé dans `WORKFLOW_PROPOSAL.md`.

**Date :** 2025-11-08
**Version :** 1.0.0

---

## 1. Stratégie de branches - URGENT

**Choix proposé : Gitflow**

```
main (production) ← staging (pre-prod) ← develop (dev) ← feature/*
```

**Questions :**
- [ ] ✅ OUI - Utiliser cette stratégie
- [ ] ❌ NON - Utiliser trunk-based (main seulement)
- [ ] 🤔 AUTRE - Préciser : _______________

**Si OUI, protection de branches :**
- [ ] main : 2 approvals requis
- [ ] staging : 1 approval requis
- [ ] develop : CI checks seulement

---

## 2. Environnements - URGENT

**Proposés :**

| Env        | Branche  | URL                     | Déploiement    |
|------------|----------|-------------------------|----------------|
| Dev        | develop  | dev.targetym.com        | Auto           |
| Staging    | staging  | staging.targetym.com    | Auto           |
| Production | main     | app.targetym.com        | Manuel         |

**Questions :**
- [ ] ✅ Valider ces URLs
- [ ] 🔄 Modifier : dev → ___________, staging → ___________, prod → ___________
- [ ] Combien d'environnements ? (2 ou 3 ou autre)

---

## 3. Plateforme de déploiement - URGENT

**Choix actuel détecté : Render.com**

**Questions :**
- [ ] ✅ Confirmer Render.com
- [ ] Changer pour Vercel
- [ ] Changer pour Railway
- [ ] Changer pour AWS/GCP
- [ ] Autre : _______________

**Si Render.com :**
- [ ] Service ID disponible ?
- [ ] API Key configurée ?
- [ ] Plan : Starter ($7) ou Standard ($25) ?

---

## 4. Notifications - MOYEN

**Canaux proposés :**
- [ ] Slack (webhook requis)
- [ ] Discord (webhook requis)
- [ ] Email (GitHub native)
- [ ] MS Teams
- [ ] Aucun pour l'instant

**Webhooks à configurer :**
- Slack : `SLACK_WEBHOOK_URL`
- Discord : `DISCORD_WEBHOOK_URL`

---

## 5. Tests automatisés - URGENT

**Proposé :**

| Type                | Quand               | Durée   | Requis |
|---------------------|---------------------|---------|--------|
| Unit tests          | Chaque PR           | 3-5 min | ✅ OUI |
| Integration tests   | Chaque PR           | 5-7 min | ✅ OUI |
| E2E tests           | Avant prod          | 10 min  | 🤔 À décider |
| Accessibility tests | Chaque PR           | 2-3 min | ✅ OUI |
| Visual regression   | Optionnel (futur)   | 5 min   | ❌ NON (Phase 3) |

**Questions :**
- [ ] ✅ Valider cette stratégie
- [ ] Ajouter E2E tests dès Phase 1 (Playwright/Cypress)
- [ ] Retirer accessibility tests
- [ ] Modifier : _______________

**Coverage minimum :**
- [ ] ✅ 80% (actuel)
- [ ] 90%
- [ ] 70%
- [ ] Autre : ____%

---

## 6. Déploiement production - URGENT

**Choix proposé : Manuel avec validation**

Workflow :
1. Create release tag (v1.2.3)
2. Full CI runs
3. PR staging → main (2 approvals)
4. Manual deployment trigger
5. Health checks + monitoring

**Questions :**
- [ ] ✅ Déploiement manuel (sécurisé)
- [ ] ❌ Déploiement automatique (risqué)
- [ ] 🎯 Déploiement progressif (10% → 50% → 100%) - **recommandé Phase 3**

**Rollback :**
- [ ] Automatique si erreur > 10%/5min
- [ ] Manuel seulement
- [ ] Hybrid (manuel + auto sur critères critiques)

---

## 7. Monitoring - MOYEN

**Sentry : ✅ Déjà configuré (Phase 2 Day 1)**

**Health checks proposés :**
```
/api/health → Check DB, Redis, Services
Fréquence :
  - Production : 1 minute
  - Staging : 5 minutes
```

**Questions :**
- [ ] ✅ Valider cette config
- [ ] Modifier fréquence : prod ___ min, staging ___ min
- [ ] Ajouter endpoint : _______________

**Alertes Sentry :**
- [ ] Error rate > 10/min → Slack
- [ ] Performance > 5s → Email
- [ ] Critical error → PagerDuty (optionnel)

**Valider alertes :**
- [ ] ✅ OK
- [ ] Modifier seuils : _______________

---

## 8. Sécurité - IMPORTANT

**Proposé :**

| Scan                 | Quand              | Outil          |
|----------------------|--------------------|----------------|
| npm audit            | Chaque PR          | npm native     |
| Vulnerability scan   | Hebdomadaire       | Snyk           |
| Secret scanning      | Automatique        | GitHub native  |
| Code quality         | Chaque push        | CodeQL         |
| Dependency updates   | Automatique        | Dependabot     |

**Questions :**
- [ ] ✅ Valider cette config
- [ ] Ajouter Snyk token : `SNYK_TOKEN`
- [ ] Utiliser autre outil : _______________
- [ ] Niveau d'alerte : Moderate / High / Critical

---

## 9. Budget CI/CD - IMPORTANT

**Estimation mensuelle :**

| Service           | Coût/mois  |
|-------------------|------------|
| GitHub Actions    | $68        |
| Render.com        | $7-25      |
| Sentry (Team)     | $26        |
| Upstash Redis     | $5-10      |
| **TOTAL**         | **~$130**  |

**Questions :**
- [ ] ✅ Budget acceptable
- [ ] ❌ Trop élevé → réduire à : $___/mois
- [ ] 💰 Pas de limite budgétaire

**Optimisations possibles :**
- [ ] Utiliser GitHub Actions cache aggressif (-20%)
- [ ] Réduire fréquence scheduled tasks (-15%)
- [ ] Self-hosted runners (gratuit mais maintenance)

---

## 10. Planning d'implémentation - URGENT

**Roadmap proposée :**

| Phase   | Durée      | Livrables                           | Priority |
|---------|------------|-------------------------------------|----------|
| Phase 1 | Semaine 1  | CI pipeline, PR checks, staging     | 🔥 HIGH  |
| Phase 2 | Semaine 2-3| Prod deployment, rollback, alerts   | 🔥 HIGH  |
| Phase 3 | Semaine 4  | Blue-Green, E2E, visual regression  | 🟡 MED   |
| Phase 4 | Mois 2     | AI code review, multi-region, DR    | 🟢 LOW   |

**Questions :**
- [ ] ✅ Valider ce planning
- [ ] ⚡ Accélérer : tout en 2 semaines
- [ ] 🐌 Ralentir : Phase 1 seulement pour l'instant
- [ ] Modifier : _______________

**Démarrage :**
- [ ] Immédiatement (dès validation)
- [ ] Dans 1 semaine
- [ ] Dans 1 mois
- [ ] Date précise : ___/___/2025

---

## 11. Workflows à créer - TECHNIQUE

**À implémenter (Phase 1) :**

- [ ] `.github/workflows/ci.yml` - Main CI pipeline
- [ ] `.github/workflows/pr-checks.yml` - PR validation
- [ ] `.github/workflows/deploy.yml` - Deployment automation
- [ ] Améliorer `deploy-supabase.yml` (rollback, backup)

**À implémenter (Phase 2) :**

- [ ] `.github/workflows/release.yml` - Release automation
- [ ] `.github/workflows/rollback.yml` - Rollback automation
- [ ] `.github/workflows/scheduled.yml` - Cron jobs

**Scripts à créer :**

- [ ] `scripts/health-check.js`
- [ ] `scripts/rollback.js`
- [ ] `scripts/smoke-tests.js`

---

## 12. Secrets GitHub à configurer - URGENT

**Requis immédiatement :**

```bash
# Application (déjà configurés ?)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_PROJECT_ID
- [ ] SUPABASE_DB_PASSWORD
- [ ] DATABASE_URL

# Deployment
- [ ] RENDER_API_KEY
- [ ] RENDER_SERVICE_ID

# Monitoring
- [ ] SENTRY_AUTH_TOKEN (déjà fait ?)
- [ ] SENTRY_ORG
- [ ] SENTRY_PROJECT
```

**Optionnels (Phase 2) :**

```bash
- [ ] SLACK_WEBHOOK_URL
- [ ] CODECOV_TOKEN
- [ ] SNYK_TOKEN
- [ ] NPM_TOKEN (si publish registry)
```

---

## Décisions RAPIDES

**Pour démarrer Phase 1 AUJOURD'HUI, valider :**

1. [ ] Stratégie de branches : Gitflow (develop → staging → main)
2. [ ] Environnements : 3 (dev, staging, prod)
3. [ ] Déploiement : Render.com
4. [ ] Tests : Unit + Integration + A11y (80% coverage)
5. [ ] Prod deployment : Manuel avec 2 approvals
6. [ ] Budget : ~$130/mois acceptable
7. [ ] Planning : Phase 1 cette semaine

**Si TOUT validé ci-dessus :**
→ Commencer implémentation immédiate de `ci.yml` et `pr-checks.yml`

---

## Prochaines étapes

**Une fois validé :**

1. ✅ Créer `.github/workflows/ci.yml`
2. ✅ Créer `.github/workflows/pr-checks.yml`
3. ✅ Créer `.github/workflows/deploy.yml`
4. ✅ Configurer GitHub Secrets
5. ✅ Mettre en place branch protection
6. ✅ Tester sur une feature branch
7. ✅ Déployer staging
8. ✅ Documentation équipe

**Estimation temps d'implémentation Phase 1 :**
- Configuration : 2-3 heures
- Tests & debugging : 3-4 heures
- Documentation : 1 heure
- **Total : 1 jour de travail**

---

## Validation finale

**Approuvé par :**
- [ ] Tech Lead : _____________ (Date : ___/___/2025)
- [ ] DevOps : _____________ (Date : ___/___/2025)
- [ ] Product Owner : _____________ (Date : ___/___/2025)

**Commentaires / Modifications :**

_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

**Documents liés :**
- `WORKFLOW_PROPOSAL.md` - Proposition complète détaillée
- `CLAUDE.md` - Instructions projet
- `.github/workflows/` - Workflows existants

**Contact :** Pour questions, voir `WORKFLOW_PROPOSAL.md` section Contact & Support
