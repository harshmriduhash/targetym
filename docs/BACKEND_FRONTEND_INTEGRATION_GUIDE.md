# Backend & Frontend Integration Guide

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Migrations Supabase](#migrations-supabase)
4. [Server Actions](#server-actions)
5. [Connexion Frontend](#connexion-frontend)
6. [Sécurité](#sécurité)
7. [Exemples d'utilisation](#exemples-dutilisation)

---

## Vue d'ensemble

Ce guide décrit l'intégration complète du backend Supabase avec le frontend Next.js pour toutes les nouvelles pages de Targetym:

- ✅ **Employees** - Gestion des employés
- ✅ **Notices** - Tableau d'annonces
- ✅ **Forms** - Gestion des formulaires
- ✅ **Portal** - Portail d'information
- ✅ **Security** - Sécurité et audit
- ✅ **Help** - Centre d'aide et support

---

## Architecture

### Structure des fichiers

```
targetym/
├── supabase/
│   └── migrations/
│       ├── 20251025175853_add_new_modules.sql       # Tables
│       └── 20251025175854_add_rls_policies_new_modules.sql  # RLS
├── src/
│   ├── actions/                    # Server Actions
│   │   ├── employees/
│   │   │   ├── create-employee.ts
│   │   │   ├── update-employee.ts
│   │   │   ├── delete-employee.ts
│   │   │   └── get-employees.ts
│   │   ├── notices/
│   │   ├── forms/
│   │   ├── portal/
│   │   ├── security/
│   │   └── help/
│   └── lib/
│       └── validations/           # Schémas Zod
│           ├── employees.schemas.ts
│           ├── notices.schemas.ts
│           ├── forms.schemas.ts
│           ├── portal.schemas.ts
│           └── help.schemas.ts
└── app/
    └── dashboard/
        ├── employees/page.tsx
        ├── notices/page.tsx
        ├── forms/page.tsx
        ├── portal/page.tsx
        ├── security/page.tsx
        └── help/page.tsx
```

---

## Migrations Supabase

### Application des migrations

```bash
# Démarrer Supabase local
npm run supabase:start

# Appliquer les migrations
npm run supabase:reset

# Générer les types TypeScript
npm run supabase:types
```

### Tables créées

| Table | Description | Champs clés |
|-------|-------------|-------------|
| `employees` | Gestion des employés | first_name, last_name, email, department, status |
| `notices` | Annonces et communications | title, content, type, priority, author_id |
| `form_entries` | Soumissions de formulaires | form_name, status, submitted_by_id, reviewed_by_id |
| `portal_resources` | Ressources et documents | title, type, category, featured, url |
| `security_events` | Journal de sécurité | user_id, type, status, ip_address |
| `support_tickets` | Tickets de support | subject, description, status, priority |
| `faqs` | Questions fréquentes | category, question, answer, helpful_count |

### Politiques RLS

Toutes les tables ont des politiques RLS activées pour:
- **SELECT**: Utilisateurs de la même organisation
- **INSERT**: Utilisateurs authentifiés de l'organisation
- **UPDATE**: Propriétaires ou admins
- **DELETE**: Admins uniquement (sauf pour security_events et support_tickets)

---

## Server Actions

### Pattern général

Toutes les Server Actions suivent ce pattern:

```typescript
'use server'

import { createClient } from '@/src/lib/supabase/server'
import { schema, type Input } from '@/src/lib/validations/module.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function actionName(input: Input): Promise<ActionResponse<ReturnType>> {
  try {
    // 1. Validation avec Zod
    const validated = schema.parse(input)

    // 2. Authentification
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Récupération de l'organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 4. Opération Supabase
    const { data, error } = await supabase
      .from('table')
      .operation()

    if (error) throw error

    return successResponse(data)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
```

### Actions disponibles par module

#### Employees
- `createEmployee(input)` - Créer un employé
- `updateEmployee(input)` - Mettre à jour un employé
- `deleteEmployee(input)` - Supprimer un employé
- `getEmployees(input)` - Récupérer les employés avec filtres

#### Notices
- `createNotice(input)` - Créer une annonce
- `updateNotice(input)` - Mettre à jour une annonce
- `deleteNotice(input)` - Supprimer une annonce
- `getNotices(input)` - Récupérer les annonces avec filtres

#### Forms
- `createFormEntry(input)` - Créer une soumission
- `updateFormEntry(input)` - Mettre à jour le statut
- `getFormEntries(input)` - Récupérer les soumissions

#### Portal
- `createPortalResource(input)` - Créer une ressource
- `getPortalResources(input)` - Récupérer les ressources

#### Security
- `getSecurityEvents(limit)` - Récupérer les événements de sécurité

#### Help
- `createSupportTicket(input)` - Créer un ticket
- `getSupportTickets(input)` - Récupérer les tickets
- `getFAQs(input)` - Récupérer les FAQs

---

## Connexion Frontend

### Exemple : Page Employees

```typescript
'use client';

import { useState, useTransition } from 'react';
import { createEmployee } from '@/src/actions/employees/create-employee';
import { getEmployees } from '@/src/actions/employees/get-employees';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  // Récupérer les employés
  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const result = await getEmployees({});
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    }
  });

  // Créer un employé
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    }
  });

  const handleCreate = () => {
    startTransition(async () => {
      createMutation.mutate({
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@targetym.com',
        role: 'Développeur',
        department: 'IT',
        hire_date: new Date().toISOString(),
      });
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        Créer un employé
      </button>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          {data?.employees.map(emp => (
            <div key={emp.id}>{emp.first_name} {emp.last_name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Avec formulaires React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema } from '@/src/lib/validations/employees.schemas';

const form = useForm({
  resolver: zodResolver(createEmployeeSchema),
  defaultValues: {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    department: '',
    hire_date: new Date().toISOString(),
  }
});

async function onSubmit(data) {
  const result = await createEmployee(data);
  if (result.success) {
    toast.success('Employé créé');
  } else {
    toast.error(result.error.message);
  }
}
```

---

## Sécurité

### ✅ Mesures de sécurité implémentées

1. **Gitignore configuré**
   - Exclut `.env*`, clés API, secrets
   - Exclut `.supabase/` et fichiers de base de données

2. **RLS (Row Level Security)**
   - Activé sur toutes les tables
   - Isolation par `organization_id`
   - Vérification des rôles (admin, hr, manager, employee)

3. **Validation**
   - Schémas Zod pour toutes les entrées
   - Validation côté serveur dans chaque action
   - Types TypeScript stricts

4. **Authentification**
   - Vérification de l'utilisateur dans chaque action
   - Récupération de l'`organization_id` depuis `profiles`
   - Gestion des erreurs d'authentification

5. **Audit**
   - Table `security_events` pour tracer les actions
   - Logs immutables (pas de UPDATE/DELETE)

---

## Exemples d'utilisation

### 1. Créer une annonce

```typescript
import { createNotice } from '@/src/actions/notices/create-notice';

const result = await createNotice({
  title: 'Réunion importante',
  content: 'Tous les employés sont invités...',
  type: 'announcement',
  priority: 'high',
  department: 'All',
  expires_at: '2025-12-31',
});

if (result.success) {
  console.log('Annonce créée:', result.data.id);
}
```

### 2. Soumettre un formulaire

```typescript
import { createFormEntry } from '@/src/actions/forms/create-form-entry';

const result = await createFormEntry({
  form_name: 'Demande de congés',
  department: 'IT',
  priority: 'medium',
  form_data: {
    start_date: '2025-11-01',
    end_date: '2025-11-05',
    reason: 'Vacances familiales',
  },
});
```

### 3. Créer un ticket de support

```typescript
import { createSupportTicket } from '@/src/actions/help/create-support-ticket';

const result = await createSupportTicket({
  subject: 'Problème de connexion',
  description: 'Je ne peux pas me connecter à...',
  category: 'Technique',
  priority: 'high',
});
```

### 4. Récupérer les ressources du portail

```typescript
import { getPortalResources } from '@/src/actions/portal/get-resources';

const result = await getPortalResources({
  type: 'guide',
  featured: true,
  limit: 10,
});

if (result.success) {
  console.log('Ressources:', result.data.resources);
}
```

---

## 🎉 Prochaines étapes

1. **Connecter les boutons frontend** aux Server Actions créées
2. **Tester chaque fonctionnalité** via l'interface
3. **Appliquer les migrations** en production avec `npm run supabase:push`
4. **Configurer les variables d'environnement** de production

---

## 📝 Notes importantes

- ⚠️ **Ne jamais commiter** les fichiers `.env*` ou secrets
- ✅ Toujours utiliser les Server Actions pour les opérations DB
- ✅ Les RLS policies protègent automatiquement les données
- ✅ Tous les schémas Zod valident les entrées
- ✅ Les erreurs sont gérées de manière cohérente

---

**Date**: 2025-10-25
**Version**: 1.0.0
**Auteur**: Configuration automatisée Targetym
