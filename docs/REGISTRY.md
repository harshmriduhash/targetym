# Targetym Component Registry

> Système de registry de composants pour Targetym - Plateforme RH propulsée par l'IA

## Vue d'ensemble

Le Registry Targetym est un système complet de gestion, documentation et publication de composants réutilisables pour applications d'entreprise RH. Il inclut:

- ✅ **50+ composants** organisés en catégories
- ✅ **Documentation complète** avec exemples interactifs
- ✅ **Tests automatisés** avec >90% de couverture
- ✅ **Accessibilité WCAG 2.1 AA** sur tous les composants
- ✅ **CI/CD automatisé** via GitHub Actions
- ✅ **Système d'agents** pour développement orchestré
- ✅ **Publication automatique** vers NPM/GitHub Packages/Vercel

## Structure du Projet

```
targetym/
├── @resty.json                    # Configuration du registry
├── REGISTRY.md                    # Ce fichier
├── app/
│   └── _docs/                     # Documentation des composants
│       ├── README.md              # Index de la documentation
│       ├── ui/                    # Docs composants UI
│       ├── goals/                 # Docs Goals & OKRs
│       ├── recruitment/           # Docs Recruitment
│       ├── performance/           # Docs Performance
│       ├── charts/                # Docs Charts
│       └── dashboard/             # Docs Dashboard
├── components/                    # Composants UI de base
│   ├── ui/                        # shadcn/ui components
│   ├── landing/                   # Landing page components
│   ├── dashboard/                 # Dashboard layout components
│   ├── charts/                    # Data visualization
│   ├── goals/                     # Goals module components
│   ├── recruitment/               # Recruitment components
│   ├── performance/               # Performance components
│   ├── career/                    # Career components
│   ├── learning/                  # Learning components
│   └── team/                      # Team components
├── src/
│   └── components/                # Business logic components
│       ├── goals/                 # Goals with business logic
│       ├── recruitment/           # Recruitment with logic
│       └── performance/           # Performance with logic
├── examples/                      # Exemples d'utilisation
│   ├── ui/                        # Exemples UI
│   ├── goals/                     # Exemples Goals
│   └── ...
├── scripts/
│   ├── registry-build.ts          # Script de build du registry
│   ├── registry-validate.ts       # Validation du registry
│   └── registry-publish.ts        # Publication du registry
├── .github/
│   └── workflows/
│       ├── registry-ci.yml        # CI pour le registry
│       └── registry-publish.yml   # Publication automatique
├── .claude/
│   └── agents/
│       └── orchestrator.md        # Documentation agents
└── public/
    └── registry/                  # Build artifacts du registry
```

## Quick Start

### Installation

Le registry fait partie du monorepo Targetym:

```bash
# Cloner le repo
git clone https://github.com/targetym/targetym.git
cd targetym

# Installer les dépendances
npm install

# Démarrer le dev
npm run dev
```

### Utiliser un Composant

```typescript
// Importer depuis le registry
import { Button } from '@/components/ui/button'
import { GoalForm } from '@/src/components/goals/GoalForm'

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <GoalForm onSubmit={handleSubmit} />
    </div>
  )
}
```

### Builder le Registry

```bash
# Build complet du registry
npm run registry:build

# Valider la configuration
npm run registry:validate

# Build + Validate + Publish
npm run registry:publish
```

## Workflow de Développement

### Ajouter un Nouveau Composant

Le processus suit **4 étapes principales**:

#### 1. Ajouter le composant dans `@resty.json`

```json
{
  "components": {
    "ui": {
      "my-component": {
        "name": "MyComponent",
        "version": "1.0.0",
        "path": "components/ui/my-component.tsx",
        "description": "Description du composant",
        "dependencies": ["react"],
        "tags": ["ui", "form"],
        "accessibility": {
          "wcag": "AA",
          "ariaSupport": true,
          "keyboardNavigation": true
        },
        "documentation": "app/_docs/ui/my-component.md",
        "examples": ["examples/ui/my-component-basic.tsx"]
      }
    }
  }
}
```

#### 2. Créer la documentation dans `app/_docs/`

```markdown
# My Component

Description détaillée du composant...

## Import

\`\`\`typescript
import { MyComponent } from '@/components/ui/my-component'
\`\`\`

## Usage

\`\`\`tsx
<MyComponent prop="value" />
\`\`\`

## API Reference

...
```

#### 3. Créer des exemples fonctionnels

```typescript
// examples/ui/my-component-basic.tsx
import { MyComponent } from '@/components/ui/my-component'

export function MyComponentBasicExample() {
  return (
    <div>
      <MyComponent />
    </div>
  )
}
```

#### 4. Builder le registry

```bash
npm run registry:build
```

### Workflow avec Agents

Le développement utilise un système d'agents spécialisés:

#### **Agent Frontend** (`frontend-developer`)
- Développe les composants UI
- Écrit les tests (>90% coverage)
- Assure l'accessibilité (WCAG AA)
- Crée la documentation

#### **Agent Backend** (`backend-architect`)
- Développe les services et API
- Configure la base de données
- Implémente la sécurité (RLS)
- Écrit les tests d'intégration

#### **Agent Intégration** (`integration-specialist`)
- Intègre les APIs tierces (Microsoft 365, Asana, Notion)
- Configure les webhooks
- Automatise les workflows

#### **Agent Orchestrateur**
- Coordonne tous les agents
- Planifie les tâches
- Valide la qualité globale
- Gère les publications

Voir [`.claude/agents/orchestrator.md`](.claude/agents/orchestrator.md) pour plus de détails.

## CI/CD Pipeline

### Registry CI (`.github/workflows/registry-ci.yml`)

Déclenché sur: `push`, `pull_request`

**Jobs**:
1. **validate** - Validation de `@resty.json`
2. **lint** - ESLint + TypeScript type check
3. **test** - Tests unitaires avec coverage
4. **accessibility** - Tests d'accessibilité (jest-axe)
5. **build-registry** - Build du registry
6. **security-scan** - Scan de sécurité (npm audit, Snyk, CodeQL)
7. **bundle-analysis** - Analyse de la taille des bundles

### Registry Publish (`.github/workflows/registry-publish.yml`)

Déclenché sur: `push to main`, `release`, `workflow_dispatch`

**Jobs**:
1. Tests complets
2. Build du registry
3. Génération du changelog
4. Bump de version
5. Publication NPM (si configuré)
6. Publication GitHub Packages
7. Déploiement Vercel (si configuré)
8. Création GitHub Release
9. Notifications (Slack, etc.)

## Configuration

### Variables d'Environnement

```bash
# GitHub
GITHUB_TOKEN                 # Auto-fourni par GitHub Actions

# NPM (optionnel)
NPM_TOKEN                    # Token pour publication NPM

# Vercel (optionnel)
VERCEL_TOKEN                 # Token Vercel
VERCEL_ORG_ID                # ID organisation Vercel
VERCEL_PROJECT_ID            # ID projet Vercel

# Sécurité
SNYK_TOKEN                   # Token Snyk pour scan sécurité

# Notifications (optionnel)
SLACK_WEBHOOK_URL            # Webhook Slack pour notifications
```

### Secrets GitHub

Configurer dans: `Settings → Secrets and variables → Actions`

- `NPM_TOKEN` (si publication NPM)
- `SNYK_TOKEN` (pour scans sécurité)
- `VERCEL_TOKEN` (si déploiement Vercel)
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SLACK_WEBHOOK_URL` (notifications)

## Standards de Qualité

### Code Quality

- ✅ **TypeScript Strict** - Mode strict obligatoire
- ✅ **ESLint** - Pas de warnings non documentés
- ✅ **Prettier** - Formatage automatique
- ✅ **Tests** - >90% de couverture requise
- ✅ **Performance** - Max 50KB par composant

### Accessibilité

Tous les composants doivent respecter:

- ✅ **WCAG 2.1 Level AA** minimum
- ✅ **ARIA** - Labels et rôles appropriés
- ✅ **Keyboard Navigation** - Navigation au clavier complète
- ✅ **Focus Management** - Gestion appropriée du focus
- ✅ **Screen Readers** - Compatible lecteurs d'écran

Tests automatisés avec `jest-axe`:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

it('should have no a11y violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Sécurité

- ✅ **Audit automatique** - npm audit + Snyk
- ✅ **Dépendances** - Scan quotidien des vulnérabilités
- ✅ **Code Analysis** - CodeQL pour détection de patterns dangereux
- ✅ **Secrets** - Jamais de secrets en dur dans le code

## Publication

### Publication Manuelle

```bash
# 1. Builder et valider
npm run registry:build
npm run registry:validate

# 2. Créer un commit avec conventional commits
git add .
git commit -m "feat(registry): add new component MyComponent"

# 3. Push vers main (déclenche auto-publish)
git push origin main
```

### Publication Automatique

Le workflow `registry-publish.yml` se déclenche automatiquement:

1. **Sur push vers `main`** - Publie la version courante
2. **Sur création de release** - Publie la version de la release
3. **Manuellement** via workflow_dispatch

### Versioning

Le registry suit le **Semantic Versioning**:

- `MAJOR.MINOR.PATCH` (ex: 1.2.3)
- **MAJOR** - Breaking changes
- **MINOR** - Nouvelles fonctionnalités
- **PATCH** - Bug fixes

Changelog généré automatiquement via **Conventional Commits**.

## Monitoring & Métriques

### Métriques Collectées

Le registry génère des statistiques à chaque build:

```json
{
  "totalComponents": 50,
  "categories": [
    { "name": "ui", "count": 15 },
    { "name": "goals", "count": 10 }
  ],
  "tags": [
    { "tag": "form", "count": 12 },
    { "tag": "accessibility", "count": 50 }
  ],
  "accessibility": {
    "wcagAA": 50,
    "ariaSupport": 48,
    "keyboardNavigation": 45
  }
}
```

Disponible dans: `public/registry/stats.json`

### Rapports

- **Coverage Report** - Généré à chaque CI run
- **Bundle Analysis** - Taille des composants
- **Accessibility Report** - Résultats jest-axe
- **Security Report** - Vulnérabilités détectées

## Troubleshooting

### Build Registry Échoue

```bash
# Vérifier la configuration
npm run registry:validate

# Vérifier que tous les fichiers existent
node -e "
  const config = require('./@resty.json');
  const fs = require('fs');
  Object.entries(config.components).forEach(([cat, comps]) => {
    Object.entries(comps).forEach(([key, comp]) => {
      if (!fs.existsSync(comp.path)) {
        console.error('Missing:', comp.path);
      }
    });
  });
"

# Rebuilder depuis zéro
rm -rf public/registry
npm run registry:build
```

### Tests Échouent

```bash
# Run tests avec mode verbose
npm test -- --verbose

# Check coverage
npm run test:coverage

# Run specific test
npm test -- ComponentName
```

### CI/CD Échoue

1. Vérifier les secrets GitHub sont configurés
2. Vérifier les permissions du workflow
3. Consulter les logs détaillés dans Actions tab
4. Vérifier la configuration `@resty.json`

## Ressources

### Documentation

- [CLAUDE.md](./CLAUDE.md) - Guide de développement principal
- [Registry Docs](./app/_docs/README.md) - Documentation des composants
- [Agent Orchestrator](./.claude/agents/orchestrator.md) - Système d'agents

### Liens Utiles

- **Repository**: https://github.com/targetym/targetym
- **Documentation**: https://docs.targetym.dev
- **Registry**: https://registry.targetym.dev
- **Issues**: https://github.com/targetym/targetym/issues

### Références Techniques

- [Next.js](https://nextjs.org) - Framework React
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Radix UI](https://www.radix-ui.com) - Primitives accessibles
- [React Hook Form](https://react-hook-form.com) - Gestion de formulaires
- [Zod](https://zod.dev) - Validation de schémas
- [Jest](https://jestjs.io) - Testing framework
- [Testing Library](https://testing-library.com) - React testing utilities

## Contribution

### Guidelines

1. **Fork** le repository
2. **Créer une branche** feature (`git checkout -b feat/amazing-component`)
3. **Développer** en suivant les standards
4. **Tester** (>90% coverage requis)
5. **Documenter** dans `app/_docs/`
6. **Commit** avec conventional commits
7. **Push** et créer une **Pull Request**

### Conventional Commits

```
feat(scope): add new component
fix(scope): fix bug in component
docs(scope): update documentation
test(scope): add tests
chore(scope): update dependencies
```

### Code Review

Toutes les PRs doivent:
- ✅ Passer les tests CI
- ✅ Avoir >90% coverage
- ✅ Être reviewées par au moins 1 mainteneur
- ✅ Respecter les standards de code
- ✅ Inclure documentation et exemples

## License

MIT License - voir [LICENSE](./LICENSE) pour détails

---

**Maintenu par**: Targetym Team
**Version Registry**: 1.0.0
**Dernière mise à jour**: 2025-01-09
