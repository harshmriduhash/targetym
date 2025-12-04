# 👥 COORDINATION DES AGENTS - DÉPLOIEMENT RENDER

**Date de Création:** 2025-01-XX  
**Chef de Projet:** AI Project Manager  
**Objectif:** Coordonner l'implémentation du plan de déploiement Render

---

## 🎯 VUE D'ENSEMBLE DES AGENTS

| Agent | Domaine | Responsabilités Principales | Statut |
|-------|---------|----------------------------|--------|
| **Agent 1** | Frontend React/Next.js | Composants UI, Pages, Intégration Server Actions | ⏸️ En attente |
| **Agent 2** | Backend Node.js/Server Actions | Server Actions, Services, API REST | ⏸️ En attente |
| **Agent 3** | Base de Données Supabase | Migrations, RLS, Optimisation | ⏸️ En attente |
| **Agent 4** | DevOps CI/CD Render | Configuration Render, Variables, Déploiement | 🟡 En cours |

---

## 📋 INSTRUCTIONS PAR AGENT

### Agent 1: Frontend React/Next.js 🎨

**Objectif:** Développer et intégrer les composants UI manquants

#### Contexte Technique
- **Framework:** Next.js 15 avec App Router
- **UI Library:** shadcn/ui (Radix UI) + DaisyUI
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS 4
- **TypeScript:** Strict mode activé

#### Patterns à Suivre

**1. Structure des Composants**
```typescript
// Exemple: components/kpis/KpiCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { getKpiById } from '@/src/actions/kpis/get-kpi-by-id'

interface KpiCardProps {
  kpiId: string
}

export function KpiCard({ kpiId }: KpiCardProps) {
  const { data: kpi, isLoading } = useQuery({
    queryKey: ['kpi', kpiId],
    queryFn: () => getKpiById({ id: kpiId }),
  })

  if (isLoading) return <div>Loading...</div>
  if (!kpi) return <div>KPI not found</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kpi.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenu */}
      </CardContent>
    </Card>
  )
}
```

**2. Intégration Server Actions**
- Toujours utiliser `useQuery` pour READ
- Utiliser `useMutation` pour CREATE/UPDATE/DELETE
- Ajouter optimistic updates quand approprié
- Gérer les erreurs avec `onError`

**3. Validation des Formulaires**
- Utiliser `react-hook-form` avec `@hookform/resolvers/zod`
- Schémas Zod dans `src/lib/validations/`

#### Tâches Assignées

**Phase 2.1: Module KPIs Frontend**

1. **Créer `components/kpis/KpiCard.tsx`**
   - Afficher informations KPI (nom, valeur actuelle, cible, unité)
   - Afficher graphique de tendance (Recharts)
   - Afficher statut (✅ On track, ⚠️ At risk, 🔴 Off track)
   - Props: `kpiId: string`

2. **Créer `components/kpis/KpiForm.tsx`**
   - Formulaire création/édition KPI
   - Champs: name, description, target, unit, alert_threshold
   - Validation avec Zod
   - Mode création et édition
   - Props: `kpiId?: string` (si présent = édition)

3. **Créer `components/kpis/KpiDashboard.tsx`**
   - Liste de tous les KPIs avec filtres
   - Graphiques de synthèse
   - Filtres par département, période
   - Actions: Créer, Voir détails, Éditer, Supprimer

4. **Créer `components/kpis/KpiMeasurementForm.tsx`**
   - Formulaire pour ajouter une mesure
   - Champs: value, measured_at, notes
   - Validation
   - Props: `kpiId: string`

5. **Créer `app/dashboard/kpis/page.tsx`**
   - Page principale KPIs
   - Utiliser `KpiDashboard`
   - Layout avec navigation

6. **Créer `app/dashboard/kpis/[id]/page.tsx`**
   - Page détail KPI
   - Utiliser `KpiCard`
   - Afficher historique des mesures
   - Formulaire ajout mesure

**Phase 2.2: Module Team Management Frontend**

1. **Créer `components/team/TeamCard.tsx`**
   - Afficher informations équipe
   - Liste des membres
   - Actions rapides

2. **Créer `components/team/TeamForm.tsx`**
   - Formulaire création/édition équipe
   - Sélection membres
   - Validation

3. **Créer `components/team/TeamList.tsx`**
   - Liste des équipes
   - Filtres et recherche
   - Actions CRUD

4. **Créer `app/dashboard/team/page.tsx`**
   - Page principale Team Management

#### Critères de Validation

- ✅ Tous les composants suivent les patterns existants
- ✅ TypeScript strict mode (aucune erreur)
- ✅ Accessibilité (a11y) respectée
- ✅ Tests unitaires créés
- ✅ Intégration avec Server Actions fonctionnelle
- ✅ Error handling et loading states

#### Fichiers de Référence

- `components/goals/GoalCard.tsx` - Exemple de card
- `components/recruitment/CandidatePipeline.tsx` - Exemple de liste
- `src/actions/kpis/` - Server Actions à utiliser
- `src/lib/validations/kpis.schemas.ts` - Schémas de validation

---

### Agent 2: Backend Node.js/Server Actions ⚙️

**Objectif:** Développer les Server Actions et API REST manquantes

#### Contexte Technique
- **Framework:** Next.js 15 Server Actions
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **Error Handling:** Pattern standardisé dans `src/lib/utils/response.ts`

#### Patterns à Suivre

**1. Structure Server Action**
```typescript
// Exemple: src/actions/team/create-team.ts
'use server'

import { z } from 'zod'
import { createTeamSchema } from '@/src/lib/validations/team.schemas'
import { teamService } from '@/src/lib/services/team.service'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { successResponse, errorResponse } from '@/src/lib/utils/response'

export async function createTeam(input: unknown) {
  try {
    // 1. Validation
    const validated = createTeamSchema.parse(input)
    
    // 2. Authentification
    const { userId, organizationId } = await getAuthContext()
    
    // 3. Service Layer
    const team = await teamService.createTeam({
      ...validated,
      organization_id: organizationId,
      created_by: userId,
    })
    
    // 4. Response
    return successResponse({ id: team.id })
  } catch (error) {
    return errorResponse('Failed to create team', 'CREATION_FAILED')
  }
}
```

**2. Structure Service**
```typescript
// Exemple: src/lib/services/team.service.ts
import { createClient } from '@/src/lib/supabase/server'
import { handleServiceError } from '@/src/lib/utils/errors'

export const teamService = {
  async createTeam(data: CreateTeamInput) {
    const supabase = await createClient()
    
    const { data: team, error } = await supabase
      .from('teams')
      .insert(data)
      .select()
      .single()
    
    if (error) throw handleServiceError(error)
    return team
  },
  
  // ... autres méthodes
}
```

**3. Structure API Route**
```typescript
// Exemple: app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createTeam } from '@/src/actions/team/create-team'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createTeam(body)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Tâches Assignées

**Phase 2.2: Module Team Management Backend**

1. **Créer `src/lib/validations/team.schemas.ts`**
   - `createTeamSchema` - Validation création
   - `updateTeamSchema` - Validation mise à jour
   - `addTeamMemberSchema` - Validation ajout membre

2. **Créer `src/lib/services/team.service.ts`**
   - `createTeam()` - Créer équipe
   - `getTeams()` - Liste équipes avec filtres
   - `getTeamById()` - Détail équipe
   - `updateTeam()` - Mettre à jour équipe
   - `deleteTeam()` - Supprimer équipe (soft delete)
   - `addTeamMember()` - Ajouter membre
   - `removeTeamMember()` - Retirer membre

3. **Créer Server Actions**
   - `src/actions/team/create-team.ts`
   - `src/actions/team/get-teams.ts`
   - `src/actions/team/get-team-by-id.ts`
   - `src/actions/team/update-team.ts`
   - `src/actions/team/delete-team.ts`
   - `src/actions/team/add-member.ts`
   - `src/actions/team/remove-member.ts`

4. **Créer `src/actions/team/index.ts`**
   - Exports de toutes les actions

**Phase 3: API REST Complète**

1. **Routes UPDATE**
   - `PATCH /api/goals/[id]/route.ts`
   - `PATCH /api/recruitment/jobs/[id]/route.ts`
   - `PATCH /api/performance/reviews/[id]/route.ts`
   - `PATCH /api/kpis/[id]/route.ts`

2. **Routes DELETE**
   - `DELETE /api/goals/[id]/route.ts`
   - `DELETE /api/recruitment/jobs/[id]/route.ts`
   - `DELETE /api/performance/reviews/[id]/route.ts`

3. **Routes KPIs**
   - `GET /api/kpis/route.ts`
   - `GET /api/kpis/[id]/route.ts`
   - `POST /api/kpis/[id]/measurements/route.ts`

#### Critères de Validation

- ✅ Toutes les Server Actions suivent le pattern standard
- ✅ Validation Zod complète
- ✅ Error handling cohérent
- ✅ Tests unitaires (80%+ couverture)
- ✅ RLS policies respectées
- ✅ Isolation multi-tenant garantie

#### Fichiers de Référence

- `src/actions/goals/create-goal.ts` - Exemple Server Action
- `src/lib/services/goals.service.ts` - Exemple Service
- `app/api/goals/route.ts` - Exemple API Route
- `src/lib/utils/response.ts` - Helpers de réponse

---

### Agent 3: Base de Données Supabase 🗄️

**Objectif:** Gérer les migrations, RLS et optimisations

#### Contexte Technique
- **Database:** PostgreSQL via Supabase
- **Migrations:** Fichiers SQL dans `supabase/migrations/`
- **RLS:** Row Level Security activé sur toutes les tables
- **Multi-tenant:** Isolation par `organization_id`

#### Patterns à Suivre

**1. Structure Migration**
```sql
-- Exemple: supabase/migrations/YYYYMMDDHHMMSS_create_teams_table.sql
-- ============================================================================
-- Migration: Create Teams Table
-- Created: 2025-01-XX
-- Description: Teams table for team management module
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes
CREATE INDEX idx_teams_organization_id ON public.teams(organization_id);
CREATE INDEX idx_teams_manager_id ON public.teams(manager_id);
CREATE INDEX idx_teams_deleted_at ON public.teams(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organization"
  ON public.teams FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) IN ('admin', 'manager')
  );

-- Trigger updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**2. RLS Policy Pattern**
- Toujours filtrer par `organization_id`
- Vérifier le rôle utilisateur pour INSERT/UPDATE/DELETE
- Utiliser `auth.uid()` pour l'utilisateur actuel

#### Tâches Assignées

**Phase 1: Préparation**

1. **Vérifier Migrations Existantes**
   - [ ] Lister toutes les migrations dans `supabase/migrations/`
   - [ ] Vérifier qu'elles sont appliquées en production
   - [ ] Tester connexion Supabase production

2. **Vérifier RLS Policies**
   - [ ] Audit de toutes les tables
   - [ ] Vérifier isolation multi-tenant
   - [ ] Tester permissions par rôle

3. **Générer Types TypeScript**
   - [ ] Exécuter: `pnpm run supabase:types:remote`
   - [ ] Vérifier `src/types/database.types.ts` à jour

**Phase 2: Module Team Management**

1. **Créer Migration Teams** (si table manquante)
   - [ ] Table `teams`
   - [ ] Table `team_members` (junction)
   - [ ] Indexes
   - [ ] RLS policies
   - [ ] Triggers

2. **Créer RLS Policies**
   - [ ] SELECT - Voir équipes de son organisation
   - [ ] INSERT - Créer équipe (admin/manager)
   - [ ] UPDATE - Modifier équipe (admin/manager/owner)
   - [ ] DELETE - Supprimer équipe (admin seulement, soft delete)

3. **Optimiser Performance**
   - [ ] Indexes sur colonnes fréquemment queryées
   - [ ] Indexes composites si nécessaire
   - [ ] Vérifier requêtes lentes

**Phase 3: Optimisation**

1. **Audit Indexes**
   - [ ] Vérifier indexes sur toutes les tables
   - [ ] Identifier indexes manquants
   - [ ] Créer indexes manquants

2. **Optimiser Requêtes**
   - [ ] Analyser requêtes lentes
   - [ ] Optimiser avec EXPLAIN ANALYZE
   - [ ] Créer vues matérialisées si nécessaire

#### Critères de Validation

- ✅ Toutes les migrations appliquées
- ✅ RLS activé sur toutes les tables
- ✅ Isolation multi-tenant garantie
- ✅ Indexes optimaux
- ✅ Types TypeScript à jour
- ✅ Tests de sécurité passants

#### Commandes Utiles

```bash
# Appliquer migrations
pnpm run supabase:push

# Générer types
pnpm run supabase:types:remote

# Tester RLS
pnpm run supabase:test

# Connexion locale
pnpm run supabase:start
```

---

### Agent 4: DevOps CI/CD Render 🚀

**Objectif:** Configurer et déployer sur Render

#### Contexte Technique
- **Platform:** Render.com
- **Build Tool:** pnpm 10.18.1
- **Node Version:** 24.9.0
- **Health Check:** `/api/health`

#### Tâches Assignées

**Phase 1: Préparation Immédiate**

1. **Vérifier `render.yaml`**
   ```yaml
   # Points à vérifier:
   - branch: doit être 'main' ou configurée correctement
   - buildCommand: doit inclure pnpm install et pnpm run build
   - startCommand: doit être 'pnpm run start'
   - healthCheckPath: doit être '/api/health'
   - envVars: toutes les variables documentées
   ```

2. **Préparer Variables d'Environnement**
   
   Créer checklist complète:
   
   **Variables Requises:**
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL` (URL Render, sera fourni)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (SECRET)
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY` (SECRET)
   - `CLERK_WEBHOOK_SECRET` (SECRET)
   
   **Variables Optionnelles:**
   - `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   
   **Où Obtenir:**
   - Supabase: Dashboard → Settings → API
   - Clerk: Dashboard → API Keys
   - Render: URL fournie après création du service

3. **Tester Build Local**
   ```bash
   # Nettoyer
   pnpm run clean
   
   # Installer dépendances
   pnpm install
   
   # Build production
   pnpm run build
   
   # Démarrer serveur
   pnpm run start
   
   # Tester health check
   curl http://localhost:3000/api/health
   ```

4. **Créer Service Render**
   - Aller sur https://dashboard.render.com
   - New → Web Service
   - Connecter repository GitHub/GitLab
   - Render détectera `render.yaml` automatiquement
   - Configurer variables d'environnement
   - Déployer

**Phase 5: Optimisation**

1. **Créer Dockerfile** (Optionnel)
   ```dockerfile
   # Multi-stage build
   FROM node:24-alpine AS base
   RUN corepack enable && corepack prepare pnpm@10.18.1 --activate
   
   FROM base AS deps
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --frozen-lockfile
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN pnpm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/node_modules ./node_modules
   EXPOSE 3000
   CMD ["pnpm", "run", "start"]
   ```

2. **Configuration Avancée**
   - Scaling automatique
   - Health checks avancés
   - Monitoring et alertes

#### Critères de Validation

- ✅ Configuration Render fonctionnelle
- ✅ Toutes les variables d'environnement configurées
- ✅ Build réussi sur Render
- ✅ Service démarré (status: "Running")
- ✅ Health check répond 200 OK
- ✅ Application accessible

#### Checklist Déploiement

- [ ] Service Render créé
- [ ] Repository connecté
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Service démarré
- [ ] Health check OK
- [ ] Application accessible
- [ ] Tests fonctionnels passants

---

## 🔄 PROCESSUS DE COORDINATION

### Communication Entre Agents

**1. Dépendances**
- Agent 3 (DB) doit créer migrations avant Agent 2 (Backend)
- Agent 2 (Backend) doit créer Server Actions avant Agent 1 (Frontend)
- Agent 4 (DevOps) peut travailler en parallèle

**2. Validation Croisée**
- Agent 1 valide avec Agent 2 que les Server Actions fonctionnent
- Agent 2 valide avec Agent 3 que les migrations sont correctes
- Agent 4 valide que tout fonctionne en production

**3. Reporting**
- Chaque agent met à jour `RENDER_DEPLOYMENT_TRACKING.md`
- Rapport quotidien de progression
- Blocages documentés immédiatement

### Ordre d'Exécution Recommandé

1. **Phase 1** (Parallèle)
   - Agent 4: Configuration Render
   - Agent 3: Vérification migrations

2. **Phase 2** (Séquentiel)
   - Agent 3: Créer migrations Team (si nécessaire)
   - Agent 2: Créer Server Actions Team
   - Agent 1: Créer composants UI Team
   - Agent 1: Créer composants UI KPIs (en parallèle)

3. **Phase 3** (Parallèle)
   - Agent 2: Créer routes API REST

4. **Phase 4** (Parallèle)
   - Tous: Améliorer tests

5. **Phase 5** (Parallèle)
   - Agent 4: Optimisation Render

---

## 📊 MÉTRIQUES DE SUCCÈS

### Par Agent

**Agent 1 (Frontend):**
- ✅ 8 composants créés
- ✅ 3 pages créées
- ✅ Tests passants
- ✅ Intégration Server Actions fonctionnelle

**Agent 2 (Backend):**
- ✅ 7 Server Actions créées
- ✅ 1 service créé
- ✅ 10 routes API créées
- ✅ 80%+ couverture tests

**Agent 3 (Database):**
- ✅ Migrations créées/appliquées
- ✅ RLS policies créées
- ✅ Indexes optimisés
- ✅ Types TypeScript à jour

**Agent 4 (DevOps):**
- ✅ Configuration Render validée
- ✅ Variables d'environnement configurées
- ✅ Déploiement réussi
- ✅ Health checks fonctionnels

### Global

- ✅ Tous les modules fonctionnels
- ✅ 80%+ couverture de tests
- ✅ Application déployée et accessible
- ✅ Performance acceptable
- ✅ Sécurité validée

---

**Document créé le:** 2025-01-XX  
**Dernière mise à jour:** 2025-01-XX  
**Prochaine révision:** Après chaque phase

