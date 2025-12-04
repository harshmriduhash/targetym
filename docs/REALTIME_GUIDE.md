# Guide Realtime Supabase - Targetym

## Vue d'ensemble

Ce guide explique comment utiliser la synchronisation en temps réel avec Supabase dans l'application Targetym.

## Configuration Réalisée

### 1. Migration Realtime (`20250109000003_enable_realtime.sql`)

**17 Tables avec Realtime Activé:**

**Priorité Haute** (mises à jour fréquentes):
- `goals` - Objectifs et OKRs
- `candidates` - Pipeline de recrutement
- `profiles` - Présence utilisateur
- `agent_activities` - Activités agents IA

**Priorité Moyenne**:
- `key_results` - Résultats clés
- `interviews` - Entretiens
- `registry_builds` - Builds du registry
- `job_postings` - Offres d'emploi

**Priorité Basse**:
- `goal_collaborators` - Collaboration
- `candidate_notes` - Notes collaboratives
- `performance_reviews` - Évaluations
- `performance_ratings` - Notes
- `peer_feedback` - Feedback pairs
- `registry_components` - Composants
- `registry_publications` - Publications
- `agent_communications` - Communication agents
- `integration_sync_logs` - Logs de sync

### 2. Hooks React Créés

**`useRealtimeSubscription`** - Hook de bas niveau
- Souscription directe aux changements Realtime
- Gestion automatique des reconnexions
- Throttling des événements
- Callbacks pour INSERT/UPDATE/DELETE

**`useRealtimeQuery`** - Hook intégré React Query
- Invalidation automatique du cache React Query
- Support des mises à jour optimistes
- Throttling intelligent
- Stratégies configurables

**`RealtimeIndicator`** - Composant UI
- Affichage du status de connexion
- Bouton de reconnexion
- Suivi des derniers événements

## Déploiement

### Étape 1: Installer Supabase CLI (si non installé)

```bash
# Via npm
npm install -g supabase

# Via Homebrew (macOS/Linux)
brew install supabase/tap/supabase

# Vérifier l'installation
supabase --version
```

### Étape 2: Lier le Projet

```bash
# Obtenir votre Project Reference ID depuis le Dashboard Supabase
# Settings → General → Reference ID

# Lier le projet
supabase link --project-ref <your-project-ref>

# Vérifier la connexion
supabase db ping
```

### Étape 3: Appliquer les Migrations

```bash
# Option A: Utiliser le script automatisé
chmod +x scripts/deploy-migrations.sh
./scripts/deploy-migrations.sh

# Option B: Manuellement
# 1. Créer un backup
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Dry run
supabase db push --dry-run

# 3. Appliquer
supabase db push

# 4. Vérifier
supabase migration list
```

### Étape 4: Générer les Types TypeScript

```bash
npm run supabase:types
```

### Étape 5: Vérifier Realtime

Connectez-vous au Dashboard Supabase:
1. Database → Replication
2. Vérifiez que `supabase_realtime` publication existe
3. Vérifiez les 17 tables sont listées

Ou via SQL:

```sql
-- Vérifier les tables avec Realtime
SELECT
  tablename,
  schemaname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Ou utiliser la vue créée
SELECT * FROM public.realtime_configuration;
```

## Utilisation

### Exemple 1: Invalidation Automatique du Cache

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useRealtimeQuery } from '@/src/lib/realtime'
import { fetchGoals } from '@/src/actions/goals'

export function GoalsList({ organizationId }: { organizationId: string }) {
  // Fetch goals with React Query
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', organizationId],
    queryFn: () => fetchGoals(organizationId)
  })

  // Auto-invalidate when goals change in database
  useRealtimeQuery({
    table: 'goals',
    queryKey: ['goals', organizationId],
    filter: `organization_id=eq.${organizationId}`,
    throttleMs: 2000, // Wait 2s before refetching
    debug: process.env.NODE_ENV === 'development',
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {goals?.map(goal => (
        <div key={goal.id}>{goal.title}</div>
      ))}
    </div>
  )
}
```

### Exemple 2: Mises à Jour Optimistes

```tsx
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRealtimeQuery } from '@/src/lib/realtime'
import type { Goal } from '@/src/types/database.types'

export function OptimisticGoalsList({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  const { data: goals } = useQuery({
    queryKey: ['goals', organizationId],
    queryFn: () => fetchGoals(organizationId)
  })

  // Optimistic updates - cache is updated directly
  useRealtimeQuery<Goal>({
    table: 'goals',
    queryKey: ['goals', organizationId],
    filter: `organization_id=eq.${organizationId}`,
    strategy: 'optimistic',

    onOptimisticInsert: (newGoal) => {
      queryClient.setQueryData<Goal[]>(
        ['goals', organizationId],
        (old = []) => [...old, newGoal]
      )
    },

    onOptimisticUpdate: (oldGoal, newGoal) => {
      queryClient.setQueryData<Goal[]>(
        ['goals', organizationId],
        (old = []) => old.map(g => g.id === newGoal.id ? newGoal : g)
      )
    },

    onOptimisticDelete: (oldGoal) => {
      queryClient.setQueryData<Goal[]>(
        ['goals', organizationId],
        (old = []) => old.filter(g => g.id !== oldGoal.id)
      )
    },
  })

  return <div>{/* ... */}</div>
}
```

### Exemple 3: Subscription Directe avec Callbacks

```tsx
'use client'

import { useState } from 'react'
import { useRealtimeSubscription } from '@/src/lib/realtime'
import { toast } from 'sonner'

export function CandidatePipeline({ jobPostingId }: { jobPostingId: string }) {
  const [newCandidateCount, setNewCandidateCount] = useState(0)

  useRealtimeSubscription({
    table: 'candidates',
    filter: `job_posting_id=eq.${jobPostingId}`,

    onInsert: (payload) => {
      const candidate = payload.new
      toast.success(`Nouveau candidat: ${candidate.full_name}`)
      setNewCandidateCount(c => c + 1)
    },

    onUpdate: (payload) => {
      const candidate = payload.new
      toast.info(`Candidat mis à jour: ${candidate.full_name}`)
    },

    onDelete: (payload) => {
      toast.error(`Candidat supprimé`)
    },

    throttleMs: 1000, // Max 1 event per second
    debug: true,
  })

  return (
    <div>
      {newCandidateCount > 0 && (
        <Badge>{newCandidateCount} nouveaux candidats</Badge>
      )}
      {/* ... */}
    </div>
  )
}
```

### Exemple 4: Indicateur de Connexion

```tsx
'use client'

import { RealtimeIndicator } from '@/src/components/realtime/RealtimeIndicator'

export function Dashboard({ organizationId }: { organizationId: string }) {
  return (
    <div>
      <header className="flex justify-between items-center">
        <h1>Dashboard</h1>

        {/* Show Realtime status */}
        <RealtimeIndicator
          table="goals"
          filter={`organization_id=eq.${organizationId}`}
          detailed
          showReconnect
        />
      </header>

      {/* ... */}
    </div>
  )
}
```

### Exemple 5: Présence Utilisateur

```tsx
'use client'

import { useEffect } from 'react'
import { useRealtimeSubscription } from '@/src/lib/realtime'
import { createClient } from '@/src/lib/supabase/client'

export function useUserPresence(goalId: string) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`presence:goal:${goalId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Online users:', state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [goalId])
}
```

## Best Practices

### 1. Filtrage des Événements

Toujours filtrer par `organization_id` pour la sécurité multi-tenant:

```tsx
useRealtimeQuery({
  table: 'goals',
  filter: `organization_id=eq.${organizationId}`, // ✅ Bon
  // Sans filter ❌ Recevrait tous les goals de toutes les orgs
})
```

### 2. Throttling

Utiliser le throttling pour éviter trop de mises à jour:

```tsx
useRealtimeQuery({
  table: 'agent_activities',
  throttleMs: 5000, // Max 1 update toutes les 5s
  // Idéal pour les tables avec updates fréquents
})
```

### 3. Stratégie d'Invalidation

Choisir entre `invalidate` (safe) et `optimistic` (rapide):

```tsx
// Invalidate (par défaut) - Plus sûr, refetch complet
useRealtimeQuery({
  strategy: 'invalidate', // Recommandé pour débuter
})

// Optimistic - Plus rapide mais nécessite gestion manuelle
useRealtimeQuery({
  strategy: 'optimistic',
  onOptimisticInsert: (data) => {
    // Mettre à jour le cache manuellement
  },
})
```

### 4. Debugging

Activer le debug en développement:

```tsx
useRealtimeQuery({
  debug: process.env.NODE_ENV === 'development',
})
```

### 5. Gestion des Erreurs

Toujours gérer les erreurs de connexion:

```tsx
const { status, error } = useRealtimeSubscription({
  table: 'goals',
  onError: (error) => {
    console.error('Realtime error:', error)
    toast.error('Erreur de synchronisation')
  },
})

if (status === 'error') {
  return <div>Erreur de connexion Realtime</div>
}
```

## Performance

### Limiter les Subscriptions

Ne s'abonner qu'aux données visibles:

```tsx
// ✅ Bon - S'abonner seulement à la page actuelle
const { data: goals } = useQuery(['goals', page])
useRealtimeQuery({ table: 'goals', filter: `page=eq.${page}` })

// ❌ Mauvais - S'abonner à tout
useRealtimeQuery({ table: 'goals' }) // Trop large!
```

### Désabonner Quand Invisible

```tsx
const [isVisible, setIsVisible] = useState(true)

useRealtimeQuery({
  table: 'goals',
  enabled: isVisible, // Désactive quand pas visible
})
```

### Monitorer la Performance

```tsx
// Vérifier les tables avec Realtime actif
SELECT * FROM public.realtime_configuration;

// Voir les métriques de performance
SELECT
  tablename,
  estimated_row_count,
  table_size,
  realtime_priority
FROM public.realtime_configuration
ORDER BY realtime_priority;
```

## Troubleshooting

### Problème: Pas d'Événements Reçus

**Solutions:**
1. Vérifier RLS policies permettent SELECT
2. Vérifier le filtre est correct
3. Vérifier la table est dans `supabase_realtime` publication
4. Activer debug mode

```tsx
useRealtimeQuery({
  debug: true, // Affiche les logs détaillés
})
```

### Problème: Trop de Refetch

**Solution:** Augmenter le throttle

```tsx
useRealtimeQuery({
  throttleMs: 5000, // Attendre 5s entre les refetch
})
```

### Problème: Connexion Perdue

**Solution:** Auto-reconnect est activé par défaut

```tsx
useRealtimeSubscription({
  autoReconnect: true, // Activé par défaut
})
```

### Problème: Événements Manqués

**Solution:** Utiliser `invalidate` plutôt qu'`optimistic`

```tsx
useRealtimeQuery({
  strategy: 'invalidate', // Toujours en sync avec DB
})
```

## Sécurité

### RLS Policies

Les événements Realtime respectent les RLS policies. Un utilisateur ne recevra QUE les événements pour lesquels il a la permission SELECT.

### Filtrage Multi-Tenant

Toujours filtrer par `organization_id`:

```tsx
useRealtimeQuery({
  filter: `organization_id=eq.${user.organizationId}`,
})
```

### Données Sensibles

Ne pas envoyer de données sensibles via Realtime. Utiliser l'invalidation et refetch depuis le serveur:

```tsx
useRealtimeQuery({
  strategy: 'invalidate', // Refetch complet, pas d'exposition de données
})
```

## Monitoring

### Dashboard Realtime

1. Aller sur Supabase Dashboard
2. Database → Replication
3. Voir les tables et leur activité

### Logs

```sql
-- Voir la config Realtime
SELECT * FROM public.realtime_configuration;

-- Vérifier les tables enabled
SELECT * FROM public.get_user_realtime_tables();

-- Check si table a Realtime
SELECT public.is_realtime_enabled('goals'); -- true/false
```

## Ressources

- **Supabase Realtime Docs**: https://supabase.com/docs/guides/realtime
- **React Query Docs**: https://tanstack.com/query/latest
- **Code Examples**: `examples/realtime/`

---

**Version**: 1.0.0
**Date**: 2025-01-09
**Auteur**: Targetym Team
