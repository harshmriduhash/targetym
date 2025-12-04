# Workflow : Optimized SaaS RH Integration

**Description**  
Piloter la création et intégration optimisée d’un SaaS de gestion RH avec Next.js, Supabase, Clerk, et intégration d’outils externes via agents Claude Code en workflow orchestré.

## Étapes

### 1. Planification et architecture globale
- Définir architecture modulaire API-First : Next.js frontend (Server & Client Components), backend Supabase sécurisé  
- Cartographier intégrations externes (Microsoft 365, Asana, Notion, etc.) et flux données automatisés  
- Établir normes de sécurité et conformité (OAuth 2.0, RGPD)  

### 2. Initialisation base code et configuration
- Setup Next.js (TypeScript, Tailwind), Supabase (RLS, postgreSQL), Clerk (authentification, rôles)  
- Organiser branches git (feat/fix/chore), config GitHub Actions + GitLab CI/CD  
- Préparer fichiers registry npm/Docker avec versionnage semver  

### 3. Développement et intégration continue
- Développer modules frontend/backend selon patterns testés  
- Utiliser agents Claude Code avec MCP pour génération, optimisation, recherches documentaires, corrections  
- Intégrer API externes via couche d’abstraction sécurisée  
- Écrire tests automatisés (>90% couverture), tests intégration, E2E  
- Pipelines CI/CD automatisés lint, tests, build, publication registry  

### 4. Validation et gestion des erreurs
- Implémenter gestion résilience API : retries, circuit breaker, monitoring centralisé  
- Exécuter audits sécurité (Snyk, CodeQL) et performance  
- Reviews de code humaines coordonnées par agent orchestrateur  

### 5. Déploiement et monitoring
- Préparer environnement staging avec previews Vercel  
- Exécuter sprints finaux validation qualité (sécurité, accessibilité, performance)  
- Déployer production avec monitoring continu (Sentry, analytics) et plans rollback/backup  

### 6. Automatisation et supervision continue
- Agents Claude Code surveillent intégrations, logs, alertes  
- Mise à jour continue docs, versionnage, communication proactive  
- Gestion sécurisée des secrets, rotation tokens  

## Instructions supplémentaires
- Workflow piloté par orchestration agent Claude Code, exploitation intensive MCP  
- Recherches documentaires et internet systématiques pour amélioration continue  
- Génération de rapports détaillés à chaque phase  

---

Fin du workflow
