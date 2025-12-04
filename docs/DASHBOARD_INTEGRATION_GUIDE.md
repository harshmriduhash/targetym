# Guide d'Intégration Dashboard - Supabase Backend

## Vue d'ensemble

Ce document détaille l'intégration complète des pages Employés, Annonces et Portail avec Supabase comme backend. Chaque bouton est maintenant connecté à la base de données avec gestion complète des opérations CRUD.

## Architecture Technique

### Pattern Utilisé

```
Frontend (React) → React Query Hook → Server Action → Service Layer → Supabase PostgreSQL
```

### Technologies

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase PostgreSQL avec RLS (Row Level Security)
- **Validation**: Zod schemas
- **UI**: shadcn/ui components (Dialog, AlertDialog, Button, etc.)

## Pages Refactorisées

### 1. Page Employés (`app/dashboard/employees/page.tsx`)

#### Fonctionnalités Implémentées

**1.1 Chargement des Données**
```typescript
const { data, isLoading, error, refetch } = useEmployees({
  search: searchQuery || undefined,
  department: filterDepartment,
  status: filterStatus,
  limit: 100,
});
```

**Hook utilisé**: `useEmployees` (`src/lib/hooks/useEmployees.ts`)
- **Action appelée**: `getEmployees` (`src/actions/employees/get-employees.ts`)
- **Service**: `EmployeesService.getEmployees()` (`src/lib/services/employees.service.ts`)
- **Table**: `employees` dans Supabase

**1.2 Bouton "Ajouter un employé"**
```typescript
<EmployeeFormDialog
  trigger={<Button>Ajouter un employé</Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `EmployeeFormDialog` (`components/employees/employee-form-dialog.tsx`)
- **Action**: `createEmployee` (`src/actions/employees/create-employee.ts`)
- **Validation**: `createEmployeeSchema` (Zod)
- **Callback**: `refetch()` pour rafraîchir la liste après création

**1.3 Bouton "Modifier" (par employé)**
```typescript
<EmployeeEditDialog
  employee={employee}
  trigger={<Button variant="ghost" size="icon"><Edit2 /></Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `EmployeeEditDialog` (`components/employees/employee-edit-dialog.tsx`)
- **Action**: `updateEmployee` (`src/actions/employees/update-employee.ts`)
- **Validation**: `updateEmployeeSchema` (Zod)

**1.4 Bouton "Supprimer" (par employé)**
```typescript
<EmployeeDeleteDialog
  employeeId={employee.id}
  employeeName={`${employee.first_name} ${employee.last_name}`}
  trigger={<Button variant="ghost" size="icon"><Trash2 /></Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `EmployeeDeleteDialog` (`components/employees/employee-delete-dialog.tsx`)
- **Action**: `deleteEmployee` (`src/actions/employees/delete-employee.ts`)
- **Type**: AlertDialog de confirmation

**1.5 Recherche et Filtres**
- **Recherche par texte**: Filtre côté client sur nom, email
- **Filtre par département**: Dropdown avec départements disponibles
- **Filtre par statut**: active, on-leave, inactive

#### Schéma Base de Données

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'on-leave', 'inactive')),
  hire_date DATE NOT NULL,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);
```

### 2. Page Annonces (`app/dashboard/notices/page.tsx`)

#### Fonctionnalités Implémentées

**2.1 Chargement des Données**
```typescript
const { data, isLoading, error, refetch } = useNotices({
  type: filterType,
  limit: 100,
});
```

**Hook utilisé**: `useNotices` (`src/lib/hooks/useNotices.ts`)
- **Action**: `getNotices` (`src/actions/notices/get-notices.ts`)
- **Service**: `NoticesService.getNotices()`
- **Table**: `notices`

**2.2 Bouton "Nouvelle annonce"**
```typescript
<NoticeFormDialog
  trigger={<Button>Nouvelle annonce</Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `NoticeFormDialog` (`components/notices/notice-form-dialog.tsx`)
- **Action**: `createNotice` (`src/actions/notices/create-notice.ts`)
- **Validation**: `createNoticeSchema`

**2.3 Bouton "Modifier" (par annonce)**
```typescript
<NoticeEditDialog
  notice={notice}
  trigger={<Button variant="ghost" size="icon"><Edit2 /></Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `NoticeEditDialog` (`components/notices/notice-edit-dialog.tsx`)
- **Action**: `updateNotice` (`src/actions/notices/update-notice.ts`)

**2.4 Bouton "Supprimer" (par annonce)**
```typescript
<NoticeDeleteDialog
  noticeId={notice.id}
  noticeTitle={notice.title}
  trigger={<Button variant="ghost" size="icon"><Trash2 /></Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `NoticeDeleteDialog` (`components/notices/notice-delete-dialog.tsx`)
- **Action**: `deleteNotice` (`src/actions/notices/delete-notice.ts`)

**2.5 Types d'Annonces**
- **info**: Informations générales (bleu)
- **warning**: Avertissements (orange)
- **urgent**: Messages urgents (rouge)
- **success**: Annonces positives (vert)

#### Schéma Base de Données

```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'urgent', 'success')),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Page Portail (`app/dashboard/portal/page.tsx`)

#### Fonctionnalités Implémentées

**3.1 Chargement des Données**
```typescript
const { data, isLoading, error, refetch } = usePortalResources({
  category: filterCategory,
  limit: 100,
});
```

**Hook utilisé**: `usePortalResources` (`src/lib/hooks/usePortalResources.ts`)
- **Action**: `getPortalResources` (`src/actions/portal/get-portal-resources.ts`)
- **Service**: `PortalService.getPortalResources()`
- **Table**: `portal_resources`

**3.2 Bouton "Ajouter une ressource"**
```typescript
<PortalResourceFormDialog
  trigger={<Button>Ajouter une ressource</Button>}
  onSuccess={() => refetch()}
/>
```

- **Modal**: `PortalResourceFormDialog` (`components/portal/portal-resource-form-dialog.tsx`)
- **Action**: `createPortalResource` (`src/actions/portal/create-portal-resource.ts`)
- **Validation**: `createPortalResourceSchema`

**3.3 Bouton "Voir" (par ressource)**
```typescript
<Button onClick={() => window.open(resource.url, '_blank')}>
  <ExternalLink className="h-4 w-4 mr-1" />
  Voir
</Button>
```

Ouvre le lien de la ressource dans un nouvel onglet.

**3.4 Catégories de Ressources**
- **document**: Documents PDF, Word, etc.
- **video**: Vidéos de formation
- **link**: Liens externes
- **guide**: Guides et tutoriels

**3.5 Ressources en Vedette**
Les ressources marquées `featured: true` sont affichées en haut de la page dans une section spéciale.

#### Schéma Base de Données

```sql
CREATE TABLE portal_resources (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('document', 'video', 'link', 'guide')),
  url TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Flux de Données Complet

### Exemple: Création d'un Employé

1. **User Action**: Utilisateur clique sur "Ajouter un employé"
   - Modal `EmployeeFormDialog` s'ouvre

2. **Form Input**: Utilisateur remplit le formulaire
   - First name, last name, email, phone, role, department, status, hire_date

3. **Validation**: Soumission du formulaire
   ```typescript
   const validated = createEmployeeSchema.parse(formData);
   ```

4. **Server Action**: Appel de `createEmployee(validated)`
   ```typescript
   // src/actions/employees/create-employee.ts
   export async function createEmployee(input: CreateEmployeeInput) {
     // 1. Validate input with Zod
     // 2. Get authenticated user from Supabase Auth
     // 3. Get user's organization_id
     // 4. Call EmployeesService.createEmployee()
     // 5. Return ActionResponse
   }
   ```

5. **Service Layer**: `EmployeesService.createEmployee()`
   ```typescript
   // src/lib/services/employees.service.ts
   async createEmployee(data: CreateEmployeeData) {
     const supabase = await this.getClient();
     const { data: inserted, error } = await supabase
       .from('employees')
       .insert([data])
       .select()
       .single();
     return inserted;
   }
   ```

6. **Database**: Insertion dans PostgreSQL
   - RLS policy vérifie que l'utilisateur a accès à l'organisation
   - Trigger `updated_at` s'exécute automatiquement

7. **Response**: Retour au frontend
   ```typescript
   if (result.success) {
     toast.success('Employé créé avec succès');
     onSuccess(); // refetch() pour actualiser la liste
   }
   ```

8. **UI Update**: React Query rafraîchit automatiquement
   - `refetch()` recharge les données
   - Liste des employés se met à jour
   - Modal se ferme

## Gestion des États

### Loading State
```typescript
if (isLoading) {
  return <div>Chargement des employés...</div>;
}
```

### Error State
```typescript
if (error) {
  return <div>Erreur: {error.message}</div>;
}
```

### Empty State
```typescript
if (employees.length === 0) {
  return <div>Aucun employé trouvé</div>;
}
```

## Sécurité

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS actives:

**Employees**
```sql
-- Les utilisateurs peuvent voir les employés de leur organisation
CREATE POLICY "Users can view own org employees"
  ON employees FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Seuls les admins/HR peuvent créer des employés
CREATE POLICY "Admins can create employees"
  ON employees FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND has_role(auth.uid(), 'admin', 'hr')
  );
```

**Notices & Portal Resources**
- Même pattern avec `organization_id`
- Isolation complète entre organisations
- Vérification des rôles pour opérations sensibles

### Validation

Tous les inputs sont validés côté serveur avec Zod avant insertion:

```typescript
export const createEmployeeSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  status: z.enum(['active', 'on-leave', 'inactive']),
  // ...
});
```

## Performance

### React Query Cache

Configuration des hooks:
```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 10 * 60 * 1000,     // 10 minutes
```

### Pagination

Toutes les requêtes supportent la pagination:
```typescript
{
  limit: 100,
  offset: 0
}
```

### Indexes Base de Données

```sql
-- Index sur organization_id pour performance
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_notices_org ON notices(organization_id);
CREATE INDEX idx_portal_resources_org ON portal_resources(organization_id);

-- Index sur status pour filtres
CREATE INDEX idx_employees_status ON employees(status);
```

## Testing

### Test en Développement

1. **Démarrer Supabase Local**
   ```bash
   npm run supabase:start
   ```

2. **Démarrer le Serveur Dev**
   ```bash
   npm run dev
   ```

3. **Accéder aux Pages**
   - Employés: http://localhost:3000/dashboard/employees
   - Annonces: http://localhost:3000/dashboard/notices
   - Portail: http://localhost:3000/dashboard/portal

4. **Tester les Opérations**
   - ✅ Créer un employé
   - ✅ Modifier un employé
   - ✅ Supprimer un employé
   - ✅ Rechercher et filtrer
   - ✅ Même chose pour Notices et Portal

### Vérifier les Données

Supabase Studio: http://localhost:54323
- Table `employees`: Voir les employés créés
- Table `notices`: Voir les annonces
- Table `portal_resources`: Voir les ressources

## Troubleshooting

### Problème: Modal ne se ferme pas après soumission

**Solution**: Vérifier que `onSuccess()` est bien appelé dans le modal.

### Problème: Données ne se rafraîchissent pas

**Solution**:
1. Vérifier que `refetch()` est appelé dans `onSuccess`
2. Vérifier les `queryKey` dans React Query
3. Regarder la console pour erreurs

### Problème: Erreur RLS "permission denied"

**Solution**:
1. Vérifier que l'utilisateur est authentifié
2. Vérifier que `organization_id` est correct
3. Vérifier les politiques RLS dans Supabase Studio

### Problème: Validation échoue

**Solution**:
1. Vérifier les messages d'erreur Zod
2. Vérifier que les champs requis sont remplis
3. Vérifier les formats (email, dates, etc.)

## Prochaines Améliorations

### Court Terme
- [ ] Pagination avec curseur pour grandes listes
- [ ] Export CSV des employés
- [ ] Filtres avancés multi-critères
- [ ] Tri par colonnes

### Moyen Terme
- [ ] Upload de photos d'employés (avatar_url)
- [ ] Pièces jointes pour annonces
- [ ] Prévisualisation des documents portail
- [ ] Notifications en temps réel (Supabase Realtime)

### Long Terme
- [ ] Import CSV d'employés en masse
- [ ] Templates d'annonces
- [ ] Versioning des ressources portail
- [ ] Analytics et rapports

## Commandes Utiles

```bash
# Démarrage
npm run dev                    # Dev server
npm run supabase:start         # Supabase local

# Base de données
npm run supabase:reset         # Reset DB + migrations
npm run supabase:types         # Générer types TypeScript
npm run supabase:test          # Tester politiques RLS

# Build & Tests
npm run build                  # Build production
npm run type-check             # Vérifier types
npm test                       # Run tests
```

## Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React Query](https://tanstack.com/query/latest)
- [Documentation Zod](https://zod.dev)
- [Documentation shadcn/ui](https://ui.shadcn.com)

---

**Date de dernière mise à jour**: 25 octobre 2025
**Version**: 1.0.0
**Auteur**: Claude Code AI Assistant
