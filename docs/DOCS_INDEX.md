# 📚 Targetym Documentation Index - Phase 2

Tous les guides et documentation pour le développement avec Targetym Phase 2.

---

## 🎯 Démarrage Rapide

### Pour Démarrer

1. **[QUICK_START.md](QUICK_START.md)** - Démarrage rapide (5 minutes)
2. **[SETUP.md](SETUP.md)** - Installation complète
3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commandes essentielles

### Documentation Principale

4. **[README_PHASE2.md](README_PHASE2.md)** - Vue d'ensemble Phase 2
5. **[PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)** - Rapport d'implémentation complet
6. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Résumé exécutif

---

## 🔧 Guides Techniques

### Base de Données

7. **[DATABASE_COMMANDS.md](DATABASE_COMMANDS.md)**
   - Commandes Supabase
   - Migrations
   - RLS Policies
   - Génération de types
   - Requêtes utiles
   - Performance monitoring

### Intelligence Artificielle

8. **[AI_SETUP.md](AI_SETUP.md)**
   - Configuration OpenAI/Anthropic
   - CV Scoring
   - Performance Synthesis
   - Career Recommendations
   - Coûts et optimisation
   - Sécurité

### Automation

9. **[CLAUDE_CODE_COMMANDS.md](CLAUDE_CODE_COMMANDS.md)**
   - Toutes les commandes `claude-code`
   - Création de composants
   - Génération de formulaires
   - Dashboards
   - CI/CD
   - Exemples concrets

---

## 📊 Progression & Status

### Suivi

10. **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Status détaillé
11. **[PHASE2_PROGRESS.md](PHASE2_PROGRESS.md)** - Progression en temps réel
12. **[NEXT_STEPS.md](NEXT_STEPS.md)** - Prochaines étapes

---

## 📖 Guides par Module

### Goals & OKRs

**Files:**
- Service: [src/lib/services/goals.service.ts](src/lib/services/goals.service.ts)
- Tests: [__tests__/unit/lib/goals/goals.service.test.ts](__tests__/unit/lib/goals/goals.service.test.ts)
- Actions: [src/actions/goals/](src/actions/goals/)
- Components: [src/components/goals/](src/components/goals/)
- Routes: [app/dashboard/goals/](app/dashboard/goals/)

**Features:**
- ✅ Create/Update/Delete goals
- ✅ Key results tracking
- ✅ Progress calculation
- ✅ OKR Dashboard
- ✅ Multiple periods

### Recruitment

**Files:**
- Service: [src/lib/services/recruitment.service.ts](src/lib/services/recruitment.service.ts)
- Tests: [__tests__/unit/lib/recruitment/recruitment.service.test.ts](__tests__/unit/lib/recruitment/recruitment.service.test.ts)
- Actions: [src/actions/recruitment/](src/actions/recruitment/)
- Components: [src/components/recruitment/](src/components/recruitment/)
- Routes: [app/dashboard/recruitment/](app/dashboard/recruitment/)

**Features:**
- ✅ Job posting management
- ✅ Candidate pipeline (Kanban)
- ✅ Interview scheduling
- ✅ AI CV scoring
- ✅ Status tracking

### Performance

**Files:**
- Service: [src/lib/services/performance.service.ts](src/lib/services/performance.service.ts)
- Tests: [__tests__/unit/lib/performance/performance.service.test.ts](__tests__/unit/lib/performance/performance.service.test.ts)
- Actions: [src/actions/performance/](src/actions/performance/)
- Components: [src/components/performance/](src/components/performance/)
- Routes: [app/dashboard/performance/](app/dashboard/performance/)

**Features:**
- ✅ Review cycles
- ✅ Performance reviews (1-5 stars)
- ✅ 360° feedback
- ✅ AI synthesis
- ✅ Career recommendations

### AI Features

**Files:**
- Service: [src/lib/services/ai.service.ts](src/lib/services/ai.service.ts)
- Actions: [src/actions/ai/](src/actions/ai/)

**Features:**
- ✅ CV Scoring (0-100)
- ✅ Performance Synthesis
- ✅ Career Recommendations
- ✅ OpenAI + Anthropic support
- ✅ Graceful fallbacks

---

## 🗄️ Architecture & Schema

### Database

**Migrations:**
```
supabase/migrations/
├── 20250101000001_create_organizations.sql
├── 20250101000002_update_profiles_with_org.sql
├── 20250101000003_create_goals_okrs.sql
├── 20250101000004_create_recruitment.sql
├── 20250101000005_create_performance.sql
├── 20250101000006_rls_policies.sql
├── 20250101000007_storage_and_functions.sql
├── 20250102000001_add_ai_fields_candidates.sql
├── 20250102000002_add_performance_indexes.sql
└── 20250102000003_rls_ai_features.sql
```

**Types:**
- [src/types/database.types.ts](src/types/database.types.ts) (812 lines)

### Code Structure

```
src/
├── lib/
│   ├── services/          # Business logic
│   ├── validations/       # Zod schemas
│   ├── utils/             # Helpers
│   └── supabase/          # DB client
├── actions/               # Server Actions
├── components/            # React components
└── types/                 # TypeScript types

app/
└── dashboard/             # Routes
    ├── goals/
    ├── recruitment/
    └── performance/

__tests__/
└── unit/
    └── lib/               # Service tests
```

---

## 🧪 Testing

### Guides de Test

**Configuration:**
- [jest.config.ts](jest.config.ts) - Jest configuration
- [test-utils/setup.ts](test-utils/setup.ts) - Test setup
- [test-utils/test-helpers.ts](test-utils/test-helpers.ts) - Test utilities

**Commandes:**
```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests only
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

**Test Files:**
- Goals: [__tests__/unit/lib/goals/goals.service.test.ts](__tests__/unit/lib/goals/goals.service.test.ts)
- Recruitment: [__tests__/unit/lib/recruitment/recruitment.service.test.ts](__tests__/unit/lib/recruitment/recruitment.service.test.ts)
- Performance: [__tests__/unit/lib/performance/performance.service.test.ts](__tests__/unit/lib/performance/performance.service.test.ts)

---

## 🚀 Déploiement

### Environnements

**Development:**
```bash
npm run dev              # Local development
supabase start           # Local Supabase
```

**Staging:**
```bash
npm run build            # Build for staging
npm run start            # Start production server
```

**Production:**
```bash
supabase link --project-ref jwedydljuhagoeuylmrn
supabase db push         # Deploy migrations
npm run build            # Build optimized
```

---

## 🔍 Recherche Rapide

### Par Type de Tâche

**Créer un nouveau composant:**
1. Lire [CLAUDE_CODE_COMMANDS.md](CLAUDE_CODE_COMMANDS.md#1-composants--ui)
2. Utiliser shadcn-ui: `npx shadcn@latest add [component]`
3. Créer dans `src/components/`

**Ajouter une table DB:**
1. Lire [DATABASE_COMMANDS.md](DATABASE_COMMANDS.md#1-générer-une-migration)
2. Créer migration: `supabase migration new [name]`
3. Ajouter RLS policies
4. Générer types: `supabase gen types typescript --local`

**Créer un service:**
1. Écrire tests d'abord (TDD RED)
2. Implémenter service (TDD GREEN)
3. Créer Server Actions
4. Ajouter validation Zod

**Ajouter AI feature:**
1. Lire [AI_SETUP.md](AI_SETUP.md)
2. Configurer API key
3. Utiliser [src/lib/services/ai.service.ts](src/lib/services/ai.service.ts)
4. Créer Server Action

---

## 📖 Par Rôle

### Développeur Frontend

**Essentiels:**
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commandes rapides
- [src/components/](src/components/) - Composants existants
- [app/dashboard/](app/dashboard/) - Routes
- shadcn-ui documentation

**Créer un composant:**
```bash
npx shadcn@latest add [component]
# Edit in src/components/
```

### Développeur Backend

**Essentiels:**
- [DATABASE_COMMANDS.md](DATABASE_COMMANDS.md) - DB & migrations
- [src/lib/services/](src/lib/services/) - Service layers
- [src/actions/](src/actions/) - Server Actions
- [__tests__/unit/](__tests__/unit/) - Tests

**Créer un service:**
```typescript
// 1. Write tests (__tests__/unit/lib/my-service.test.ts)
// 2. Implement (src/lib/services/my-service.ts)
// 3. Create actions (src/actions/my-service/)
```

### Développeur Full-Stack

**Essentiels:**
- [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md) - Vue complète
- [CLAUDE_CODE_COMMANDS.md](CLAUDE_CODE_COMMANDS.md) - Automation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Résumé

**Workflow complet:**
1. DB migration
2. Generate types
3. Create service (TDD)
4. Create actions
5. Create components
6. Create routes
7. Tests

### Data Scientist / AI Engineer

**Essentiels:**
- [AI_SETUP.md](AI_SETUP.md) - Configuration AI
- [src/lib/services/ai.service.ts](src/lib/services/ai.service.ts) - AI service
- [src/actions/ai/](src/actions/ai/) - AI actions

**AI Features:**
- CV Scoring
- Performance Synthesis
- Career Recommendations

---

## 🆘 Troubleshooting

### Problèmes Courants

**Supabase Connection:**
```bash
# Check status
supabase status

# Restart
supabase stop && supabase start

# Reset
supabase db reset
```

**Type Errors:**
```bash
# Regenerate types
supabase gen types typescript --local > src/types/database.types.ts

# Type check
npm run type-check
```

**Test Failures:**
```bash
# Clear cache
npm test -- --clearCache

# Update snapshots
npm test -- -u

# Debug specific test
npm test -- path/to/test.ts
```

**Build Errors:**
```bash
# Clean build
rm -rf .next
npm run build

# Check dependencies
npm install
```

---

## 📞 Support

### Ressources

- **GitHub Issues:** Pour bugs et features
- **Documentation:** Ce fichier et guides liés
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Claude Code:** https://docs.anthropic.com/claude-code

### Contribuer

1. Fork le repo
2. Créer une branche feature
3. Suivre conventions de code
4. Écrire tests
5. Créer PR avec description

---

## 📈 Statistiques Documentation

| Document | Lignes | Sujet | Status |
|----------|--------|-------|--------|
| PHASE2_COMPLETE.md | 500+ | Rapport complet | ✅ |
| DATABASE_COMMANDS.md | 600+ | DB & Migrations | ✅ |
| CLAUDE_CODE_COMMANDS.md | 700+ | Automation | ✅ |
| AI_SETUP.md | 400+ | AI Features | ✅ |
| IMPLEMENTATION_SUMMARY.md | 500+ | Résumé | ✅ |
| README_PHASE2.md | 300+ | Overview | ✅ |
| NEXT_STEPS.md | 200+ | Guide impl | ✅ |
| QUICK_REFERENCE.md | 150+ | Ref rapide | ✅ |
| **Total** | **3,350+** | **Complete** | ✅ |

---

## ✅ Checklist Documentation

- [x] ✅ Quick start guide
- [x] ✅ Installation guide
- [x] ✅ Architecture overview
- [x] ✅ Database documentation
- [x] ✅ AI features guide
- [x] ✅ Claude Code commands
- [x] ✅ Testing guide
- [x] ✅ Deployment guide
- [x] ✅ Troubleshooting
- [x] ✅ API documentation (in code)
- [x] ✅ Examples & tutorials
- [x] ✅ Best practices

---

## 🎯 Navigation Rapide

### Par Besoin

**Je veux...**

- **Démarrer le projet** → [QUICK_START.md](QUICK_START.md)
- **Comprendre l'architecture** → [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)
- **Créer une migration** → [DATABASE_COMMANDS.md](DATABASE_COMMANDS.md)
- **Configurer l'IA** → [AI_SETUP.md](AI_SETUP.md)
- **Automatiser avec Claude** → [CLAUDE_CODE_COMMANDS.md](CLAUDE_CODE_COMMANDS.md)
- **Voir le status** → [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Commandes essentielles** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Suivre la progression** → [PHASE2_PROGRESS.md](PHASE2_PROGRESS.md)

---

**📚 Documentation complète pour Targetym Phase 2**

*Dernière mise à jour: 2 Janvier 2025*
*Status: 100% Complete*
