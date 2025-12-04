# 🗑️ Plan de Suppression Complète de Clerk

## 📊 Audit Complet - Résultats

### ✅ Packages: DÉJÀ NETTOYÉS
Aucun package Clerk n'est installé dans `package.json`. ✅

### 📁 Fichiers à Nettoyer

#### 1. Migration SQL Clerk
- `supabase/migrations/20251010000000_add_clerk_sync.sql` ❌ À SUPPRIMER

#### 2. Documentation avec Références Clerk
- `README.md` - Badge et mentions Clerk
- `CLAUDE.md` - Instructions auth Clerk
- `CLERK_SUPABASE_INTEGRATION.md` - Guide obsolète
- `BETTER_AUTH_IMPLEMENTATION.md` - Mentions Clerk
- `CLEANUP_SUMMARY.md` - Historique
- `DEPLOYMENT_CHECKLIST.md` - Variables Clerk
- `FRONTEND_OPTIMIZATIONS.md` - Références
- `HARMONIZATION_REPORT.md` - Références
- `MIGRATION_GUIDE.md` - Instructions Clerk
- `REALTIME_SYNC_GUIDE.md` - Sync Clerk
- `SUPABASE_MIGRATION_GUIDE.md` - Migration depuis Clerk
- `TESTING_GUIDE.md` - Tests Clerk

#### 3. Code Source avec Références Clerk
- `src/lib/middleware/rate-limit.ts` - Commentaires
- `src/lib/middleware/action-rate-limit.ts` - Commentaires
- `src/app/api/v1/ready/route.ts` - Commentaires
- `src/app/api/v1/health/route.ts` - Commentaires
- `app/onboarding/actions.ts` - Commentaires

#### 4. Tests avec Références Clerk
- `__tests__/integration/actions/goals.test.ts` - Commentaires
- `__tests__/integration/actions/recruitment.test.ts` - Commentaires
- `__tests__/unit/lib/middleware/action-rate-limit.test.ts` - Commentaires

#### 5. Fichiers .claude
- `.claude/agents/react-nextjs-code-reviewer.md` - Mentions
- `.claude/commands/optimized_saas_hr__integration.md` - Mentions
- `.claude/commands/new-registry.md` - Mentions

#### 6. Coverage HTML (Anciens Fichiers)
- `coverage/lcov-report/src/lib/auth/clerk-*.ts.html` - Artifacts obsolètes

---

## 🎯 Plan d'Action

### Phase 1: Nettoyage Fichiers
1. ✅ Supprimer la migration Clerk SQL
2. ✅ Supprimer `CLERK_SUPABASE_INTEGRATION.md`
3. ✅ Nettoyer les références dans documentation
4. ✅ Nettoyer les commentaires dans code source
5. ✅ Supprimer dossier coverage (sera régénéré)

### Phase 2: Correction Tests
1. ✅ Corriger mocks Supabase dans tests
2. ✅ Fixer erreurs TypeScript dans tests auth
3. ✅ Valider tous les tests passent

### Phase 3: Base de Données
1. ✅ Arrêter Supabase local
2. ✅ Reset complet base de données
3. ✅ Appliquer migrations (sans Clerk)
4. ✅ Vérifier schéma et RLS

### Phase 4: Vérification
1. ✅ Tests unitaires (couverture 80%)
2. ✅ Tests d'intégration
3. ✅ Build Next.js
4. ✅ Type-check TypeScript
5. ✅ Lint ESLint

---

## 🚀 Exécution

```bash
# Phase 1: Nettoyage
npm run clerk:remove

# Phase 2: Tests
npm run test:fix

# Phase 3: Base de données
npm run supabase:stop
npm run supabase:reset
npm run supabase:types

# Phase 4: Vérification
npm run test:coverage
npm run type-check
npm run build
```

---

## 📝 Checklist de Validation

### Nettoyage Code
- [ ] Aucune référence "clerk" dans `src/`
- [ ] Aucune référence "Clerk" dans `app/`
- [ ] Migration Clerk supprimée
- [ ] Documentation mise à jour

### Tests
- [ ] Tous les tests passent
- [ ] Couverture >= 80%
- [ ] Aucune erreur TypeScript
- [ ] Aucun warning ESLint lié à Clerk

### Base de Données
- [ ] Schéma Supabase propre
- [ ] RLS policies fonctionnent
- [ ] `profiles` table existe
- [ ] Auth Supabase fonctionne

### Build & Deploy
- [ ] `npm run build` réussit
- [ ] `npm run type-check` sans erreur
- [ ] `npm run lint` sans erreur Clerk
- [ ] Dev server démarre sans erreur

---

## 🎯 Résultat Attendu

Après l'exécution complète:
- ✅ **0 références à Clerk** dans le code
- ✅ **Authentication 100% Supabase**
- ✅ **Tests fonctionnels** avec couverture 80%
- ✅ **Build propre** sans avertissements
- ✅ **Documentation cohérente** avec Supabase uniquement

---

**Prêt pour l'exécution automatique!** 🚀
