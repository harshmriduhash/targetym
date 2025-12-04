# Projet Next.js avec Supabase, Clerk, GitHub, GitLab, Vercel, Registry et Agents MCP - Prompt Complet Agile & DevOps

## Objectif du projet
Construire une application web fullstack performante, scalable, sécurisée et modulaire avec Next.js (dernière version), Supabase pour backend, Clerk pour authentification, déploiement continu via Vercel, gestion du code & CI/CD sur GitHub et GitLab, et gestion avancée des artefacts via registry.

## Architecture & Technologies
- Frontend : Next.js 15+ avec TypeScript strict, React 18+, TailwindCSS, shadcn/ui, composants add-ons pour accessibilité et performance
- Backend : Supabase (auth/authz, PostgreSQL, fonctions edge, RLS strict)
- Authentification : Clerk pour gestion utilisateurs et sessions, couplé à Supabase pour gestion des données et règles d’accès
- Déploiement : Vercel avec previews deploys, analytics, monitoring auto
- Gestion des sources : GitHub principal, GitLab CI/CD avancé (tests, scans sécurité)
- Registry : npm package privé sur GitHub/GitLab/Vercel, Docker registry si besoin containers
- Add-ons spécifiques : intégration d’analytics, monitoring, tests e2e additionnels, sécurité renforcée

## Normes et standards
- Code : TypeScript strict, ESLint custom + Prettier (formatage rigoureux)
- Git : Branches `feat/<objet>`, PR templates avec checklist qualité renforcée (tests, sécurité, doc)
- Commits : Conventionnels, changelog auto généré (Semantic Release)
- Tests : Couverture > 90%, avec intégration continue des tests unitaires, d’intégration et end-to-end (Jest, Playwright)
- Accessibilité & performances : suivies via outils intégrés (Lighthouse, axe-core)
- Sécurité : analyses statiques et dynamiques intégrées (Snyk, Dependabot, CodeQL)

## Authentification avec Clerk couplé à Supabase
- Clerk comme fournisseur principal d’authentification et gestion des utilisateurs, avec interfaces sécurisées et gestion des sessions
- Synchronisation des identités Clerk avec Supabase pour gérer les profils utilisateurs et règles d’accès RLS
- Protection des routes frontend via hooks et composants Clerk dans Next.js
- Gestion des rôles et permissions via métadonnées Clerk intégrées dans Supabase
- Workflows utilisateur (inscription, connexion, récupération mot de passe) via Clerk, données métiers dans Supabase
- Documentation et tests automatisés spécifiques à cette intégration

## Organisation du développement et responsabilités des agents
- Développement en deux phases principales :
  1. **Frontend** : UI complète avec Next.js, intégration UI/UX, tests frontend
  2. **Backend** : API, logique métier, base Supabase, règles sécurité, tests backend
- Agents spécifiques Claude Code :
  - **Agent Frontend** : génération, optimisation, tests UI
  - **Agent Backend** : gestion Supabase, modèle données, sécurité backend
  - **Agent Expert Intégration** : Microsoft 365, Asana, Notion, autres apps, récupération et échanges données, automatisation workflows inter-applications
  - **Agent Orchestrateur** : coordination, planification, consolidation livrables
- **Validateur Final** : revue humaine finale avant merge production (qualité, documentation, conformité)
- **Utilisation des MCP** :
  - Tous les agents utilisent les MCP fournis pour guider leurs actions avec cohérence et efficacité
  - Ils réalisent des recherches documentaires internes et sur internet pour optimiser leurs tâches
  - L’Orchestrateur centralise et supervise l’ensemble

## Gestion du code source sur GitHub
- Hébergement principal sur GitHub
- Branches strictes : `main`/`master` pour prod, branches `feat/<fonction>`, `fix/<bug>`, `chore/<tâche>`
- PRs obligatoires avec description claire, captures UI, résultats tests, références issues
- GitHub Actions CI pour lint, tests, build automatiques
- Secrets via GitHub Secrets, accès limité
- Collaboration via issues, projets, discussions
- Fusion après validation complète et revue humaine
- Releases automatisées avec changelog généré via commits conventionnels

## Registry et gestion des artefacts

### Overview : Création d’un composant dans le registry
La création d’un composant registry suit 4 étapes principales :

1. **Ajouter le composant dans `@resty.json`**  
   - Déclarer le composant avec métadonnées, version, dépendances, respectant la structure

2. **Ajouter la documentation dans `app/_docs/`**  
   - Détailler usage, API, configuration, bonnes pratiques en Markdown avec exemples si nécessaire

3. **Créer des exemples fonctionnels**  
   - Fournir exemples concrets dans `examples/` pour tests et démonstrations d’usage

4. **Construire le registry avec `pnpm registry:build`**  
   - Commande qui génère automatiquement les fichiers publics pour consommation

### Workflow complet pour le registry

1. Initialisation  
   - Préparer `package.json` pour npm privés  
   - Configurer Dockerfile et Docker registry  
   - Définir règles versionnage semver  
   - Gérer accès sécurité via tokens

2. Développement et validation locales  
   - Tester > 90% couverture, conformité sécurité dependencies  
   - Validation automatique des fichiers de configuration

3. Automatisation CI/CD  
   - Pipeline pour build, test, publication automatique  
   - Versionnage auto (Semantic Release)  
   - Notifications post-publication

4. Intégration artefacts  
   - Consommation dans backend/frontend pipelines  
   - Mise à jour documentation et compatibilité versions

5. Sécurité & maintenance  
   - Scans automatisés (Snyk, npm audit)  
   - Rotation régulière des tokens  
   - Backups critiques planifiés

6. Supervision  
   - Logs détaillés, rapports qualité et sécurité  
   - Suivi agent orchestrateur Claude Code

## Automatisation & Sécurité
- Hooks Git pour lint, tests, build, scans vulnérabilités
- Rotation secrets, audits accès
- RLS strict sur Supabase
- MFA pour accès critiques
- Backups automatiques et versionning migrations

## Add-ons et extensions
- Monitoring (Sentry, Vercel Analytics)
- Tests E2E (Playwright)
- Notifications Slack/Teams CI/CD
- Rapports automatiques sécurité
- Workflow agile suivi via Claude Code

## Préparation finale mise en production
- Sprints finaux back/front testés
- Validation tests globaux
- Revue doc, sécurité, performance, accessibilité
- Validation staging previews Vercel
- Déploiement production avec monitoring et rollback

## Meilleures pratiques Fullstack & DevOps avec Approche Agile
- Méthodologie Scrum/Kanban, sprints courts
- Daily stand-ups, feedback continus
- TDD, revue de code obligatoire et automatisations
- Couverture tests élevée, analyses sécurité proactives
- Déploiements progressifs avec monitoring
- Collaboration fluide, documentation accessible et communication active

---

# Fin du fichier CLAUDE.md
