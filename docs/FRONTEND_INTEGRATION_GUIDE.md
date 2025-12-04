# Guide d'intégration Frontend - Modals & React Query

## Vue d'ensemble

Ce guide explique comment utiliser les composants de formulaires connectés aux Server Actions optimisés via React Query.

**Architecture:**
```
Frontend (React) → React Query Hooks → Server Actions → Services → PostgreSQL
                 ↓                    ↓
              Cache Client       Validation Zod
```

---

## Table des Matières

1. [Hooks React Query](#hooks-react-query)
2. [Composants de formulaires](#composants-formulaires)
3. [Exemples d'utilisation](#exemples-utilisation)
4. [Configuration React Query](#configuration)
5. [Gestion des erreurs](#gestion-erreurs)
6. [Performance & Caching](#performance-caching)

---

## 1. Hooks React Query {#hooks-react-query}

### Hooks disponibles

#### Employees (`src/lib/hooks/useEmployees.ts`)

```typescript
import {
  useEmployees,          // Récupération avec cache
  useCreateEmployee,     // Création
  useUpdateEmployee,     // Mise à jour
  useDeleteEmployee,     // Suppression
} from '@/src/lib/hooks/useEmployees'
```

**Exemple d'utilisation:**

```typescript
'use client'

import { useEmployees, useCreateEmployee } from '@/src/lib/hooks/useEmployees'

export function EmployeesPage() {
  // Récupération avec options de filtrage
  const { data, isLoading, error } = useEmployees({
    department: 'IT',
    status: 'active',
    search: 'john',
    limit: 20,
    offset: 0
  })

  // Mutation pour création
  const createEmployee = useCreateEmployee()

  const handleCreate = async (formData) => {
    await createEmployee.mutateAsync(formData)
    // Auto-invalidation du cache et toast de succès
  }

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div>
      <p>Total: {data.total}</p>
      <p>A plus de données: {data.hasMore ? 'Oui' : 'Non'}</p>
      {data.employees.map(emp => (
        <div key={emp.id}>{emp.first_name} {emp.last_name}</div>
      ))}
    </div>
  )
}
```

#### Notices (`src/lib/hooks/useNotices.ts`)

```typescript
import {
  useNotices,            // Récupération avec cache
  useCreateNotice,       // Création
  useUpdateNotice,       // Mise à jour
  useDeleteNotice,       // Suppression
} from '@/src/lib/hooks/useNotices'
```

#### Portal (`src/lib/hooks/usePortal.ts`)

```typescript
import {
  usePortalResources,         // Récupération avec cache
  useCreatePortalResource,    // Création
  useUpdatePortalResource,    // Mise à jour
  useDeletePortalResource,    // Suppression
  useIncrementResourceViews,  // Incrément de vues (silencieux)
} from '@/src/lib/hooks/usePortal'
```

---

## 2. Composants de formulaires {#composants-formulaires}

### Employees

#### EmployeeFormDialog (Création)

```typescript
import { EmployeeFormDialog } from '@/components/employees'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <EmployeeFormDialog
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      }
      onSuccess={() => {
        console.log('Employé créé!')
        // Actions additionnelles après succès
      }}
    />
  )
}
```

**Fonctionnalités:**
- ✅ Formulaire complet avec validation Zod
- ✅ Gestion automatique du loading state
- ✅ Toast de succès/erreur automatique
- ✅ Invalidation du cache React Query
- ✅ Fermeture automatique après succès
- ✅ Reset du formulaire

#### EmployeeEditDialog (Modification)

```typescript
import { EmployeeEditDialog } from '@/components/employees'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmployeeRow({ employee }) {
  return (
    <div>
      <span>{employee.first_name}</span>
      <EmployeeEditDialog
        employee={employee}
        trigger={
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        }
        onSuccess={() => {
          console.log('Employé modifié!')
        }}
      />
    </div>
  )
}
```

#### EmployeeDeleteDialog (Suppression)

```typescript
import { EmployeeDeleteDialog } from '@/components/employees'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmployeeActions({ employee }) {
  return (
    <EmployeeDeleteDialog
      employeeId={employee.id}
      employeeName={`${employee.first_name} ${employee.last_name}`}
      trigger={
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      onSuccess={() => {
        console.log('Employé supprimé!')
      }}
    />
  )
}
```

---

## 3. Exemples d'utilisation {#exemples-utilisation}

### Exemple complet: Page de gestion des employés

```typescript
'use client'

import { useState } from 'react'
import { useEmployees } from '@/src/lib/hooks/useEmployees'
import {
  EmployeeFormDialog,
  EmployeeEditDialog,
  EmployeeDeleteDialog
} from '@/components/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState<string | undefined>()

  // Hook React Query avec options de filtrage
  const { data, isLoading, error } = useEmployees({
    search,
    department,
    limit: 20,
    offset: 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employés</h1>
        <EmployeeFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          }
        />
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={department || ''}
              onChange={(e) => setDepartment(e.target.value || undefined)}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Tous les départements</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>
            {data ? `${data.total} employés` : 'Chargement...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Chargement...</p>}
          {error && <p className="text-red-500">Erreur: {error.message}</p>}

          {data && data.employees.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun employé trouvé
            </p>
          )}

          {data && data.employees.length > 0 && (
            <div className="space-y-3">
              {data.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.role} - {employee.department}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <EmployeeEditDialog
                      employee={employee}
                      trigger={<Button variant="outline" size="sm">Modifier</Button>}
                    />
                    <EmployeeDeleteDialog
                      employeeId={employee.id}
                      employeeName={`${employee.first_name} ${employee.last_name}`}
                      trigger={<Button variant="destructive" size="sm">Supprimer</Button>}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.hasMore && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                Charger plus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Exemple: Utilisation avec Server Component

```typescript
// app/employees/page.tsx (Server Component)
import { EmployeesClientPage } from './client-page'

export default function EmployeesPage() {
  // Server Component peut faire du prefetch si nécessaire
  return <EmployeesClientPage />
}

// app/employees/client-page.tsx (Client Component)
'use client'

import { useEmployees } from '@/src/lib/hooks/useEmployees'

export function EmployeesClientPage() {
  const { data } = useEmployees()
  // ... rendu
}
```

---

## 4. Configuration React Query {#configuration}

### Configuration actuelle

La configuration React Query est déjà en place dans `app/layout.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### Paramètres de cache par hook

| Hook | StaleTime | GCTime | Raison |
|------|-----------|--------|--------|
| `useEmployees` | 5 min | 30 min | Données stables |
| `useNotices` | 2 min | 10 min | Plus dynamiques |
| `usePortalResources` | 5 min | 30 min | Ressources statiques |

---

## 5. Gestion des erreurs {#gestion-erreurs}

### Gestion automatique

Les hooks gèrent automatiquement:
- ✅ **Toast de succès** après mutations réussies
- ✅ **Toast d'erreur** en cas d'échec
- ✅ **Invalidation du cache** après mutations
- ✅ **États de chargement** (`isPending`, `isLoading`)

### Gestion personnalisée

```typescript
const createEmployee = useCreateEmployee()

// Option 1: try/catch
try {
  await createEmployee.mutateAsync(data)
  // Succès géré automatiquement
} catch (error) {
  // Erreur déjà affichée via toast
  // Logique additionnelle si nécessaire
  console.error('Erreur création:', error)
}

// Option 2: callbacks
createEmployee.mutate(data, {
  onSuccess: (result) => {
    console.log('Succès!', result)
    // Actions additionnelles
  },
  onError: (error) => {
    console.error('Échec!', error)
    // Actions additionnelles
  },
})
```

---

## 6. Performance & Caching {#performance-caching}

### Stratégies de cache

#### 1. Invalidation automatique

Toutes les mutations invalident automatiquement les requêtes associées:

```typescript
// Après createEmployee(), useEmployees() se rafraîchit automatiquement
const createEmployee = useCreateEmployee()

await createEmployee.mutateAsync(data)
// ↓ Invalidation automatique
// ↓ useEmployees() refetch automatiquement
```

#### 2. Optimistic Updates (optionnel)

Pour une UX ultra-rapide:

```typescript
const queryClient = useQueryClient()

const updateEmployee = useMutation({
  mutationFn: updateEmployeeAction,

  // Mise à jour optimiste avant la requête serveur
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['employees'] })

    const previousData = queryClient.getQueryData(['employees'])

    queryClient.setQueryData(['employees'], (old) => ({
      ...old,
      employees: old.employees.map(emp =>
        emp.id === newData.id ? { ...emp, ...newData } : emp
      )
    }))

    return { previousData }
  },

  // Rollback en cas d'erreur
  onError: (err, newData, context) => {
    queryClient.setQueryData(['employees'], context.previousData)
  },

  // Refetch pour synchroniser
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  },
})
```

#### 3. Prefetching

```typescript
const queryClient = useQueryClient()

// Prefetch avant navigation
const handleNavigateToEmployee = (id) => {
  queryClient.prefetchQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id),
  })

  router.push(`/employees/${id}`)
}
```

#### 4. Pagination avec cache

```typescript
const [page, setPage] = useState(0)

const { data } = useEmployees({
  limit: 20,
  offset: page * 20
})

// Prefetch page suivante
useEffect(() => {
  if (data?.hasMore) {
    queryClient.prefetchQuery({
      queryKey: ['employees', { limit: 20, offset: (page + 1) * 20 }],
      queryFn: () => getEmployees({ limit: 20, offset: (page + 1) * 20 }),
    })
  }
}, [page, data, queryClient])
```

---

## Avantages de cette architecture

✅ **Performance**: Cache côté client + optimisations PostgreSQL
✅ **Developer Experience**: Hooks réutilisables, typage TypeScript complet
✅ **Maintenabilité**: Séparation claire des responsabilités
✅ **Scalabilité**: Support de millions de requêtes avec cache intelligent
✅ **UX**: Loading states, error handling et feedback automatiques
✅ **Type Safety**: Validation Zod + TypeScript strict mode

---

## Prochaines étapes

1. **Créer les formulaires pour Notices et Portal** (même pattern)
2. **Implémenter full-text search PostgreSQL** (migration ts_vector)
3. **Ajouter Redis** pour cache serveur
4. **Optimistic updates** pour UX instantanée
5. **Infinite scroll** pour pagination avancée

---

**Auteur:** Claude Code
**Date:** 25 octobre 2025
**Version:** 1.0
