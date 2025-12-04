# CandidateSelectorEnhanced Component

## Vue d'ensemble

`CandidateSelectorEnhanced` est un composant React avancé pour la sélection ou la création de candidats dans le module de recrutement. Il offre trois modes d'interaction :

1. **Sélectionner** : Chercher et sélectionner un candidat existant
2. **Créer** : Créer manuellement un nouveau candidat avec validation
3. **Importer CV** : Uploader un CV directement vers Supabase Storage

## Fonctionnalités

✅ **Validation complète** avec React Hook Form et Zod
✅ **Upload de CV** vers Supabase Storage (PDF, DOC, DOCX jusqu'à 10MB)
✅ **Recherche en temps réel** des candidats existants
✅ **Gestion des états de chargement** et erreurs
✅ **Intégration complète** avec les Server Actions
✅ **Interface utilisateur responsive** avec shadcn/ui
✅ **Notifications toast** pour les retours utilisateur

## Installation

Aucune installation supplémentaire requise. Le composant utilise les dépendances déjà présentes dans le projet :

- `react-hook-form` - Gestion des formulaires
- `zod` - Validation des données
- `@tanstack/react-query` - Gestion d'état serveur
- `sonner` - Notifications toast
- `shadcn/ui` - Composants UI

## Utilisation de base

```tsx
'use client';

import { useState } from 'react';
import { CandidateSelectorEnhanced } from '@/components/recruitment/CandidateSelectorEnhanced';

export default function MyPage() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateCreated = (newCandidate) => {
    setCandidates(prev => [...prev, newCandidate]);
  };

  return (
    <CandidateSelectorEnhanced
      candidates={candidates}
      jobs={jobs}
      selectedCandidate={selectedCandidate}
      onSelectCandidate={setSelectedCandidate}
      onCandidateCreated={handleCandidateCreated}
    />
  );
}
```

## Props

### `candidates` (required)
- **Type**: `Candidate[]`
- **Description**: Liste des candidats existants à afficher

```typescript
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  job_posting_id: string;
  jobTitle?: string;
  status?: string;
  current_stage?: string;
  cv_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
  source?: string;
}
```

### `jobs` (required)
- **Type**: `JobPosting[]`
- **Description**: Liste des offres d'emploi disponibles

```typescript
interface JobPosting {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
}
```

### `selectedCandidate` (required)
- **Type**: `Candidate | null`
- **Description**: Le candidat actuellement sélectionné

### `onSelectCandidate` (required)
- **Type**: `(candidate: Candidate | null) => void`
- **Description**: Callback appelé quand un candidat est sélectionné ou désélectionné

### `onCandidateCreated` (optional)
- **Type**: `(candidate: Candidate) => void`
- **Description**: Callback appelé quand un nouveau candidat est créé avec succès

## Exemple complet avec chargement de données

```tsx
'use client';

import { useState, useEffect } from 'react';
import { CandidateSelectorEnhanced } from '@/components/recruitment/CandidateSelectorEnhanced';
import { getCandidates } from '@/src/actions/recruitment/get-candidates';
import { getJobPostings } from '@/src/actions/recruitment/get-job-postings';
import { toast } from 'sonner';

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [candidatesResult, jobsResult] = await Promise.all([
        getCandidates(),
        getJobPostings({ status: 'active' })
      ]);

      if (candidatesResult.success) {
        setCandidates(candidatesResult.data.items || []);
      }

      if (jobsResult.success) {
        setJobs(jobsResult.data.items || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCandidateCreated = (newCandidate) => {
    setCandidates(prev => [...prev, newCandidate]);
    toast.success('Candidat ajouté à la liste');
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des candidats</h1>

      <CandidateSelectorEnhanced
        candidates={candidates}
        jobs={jobs}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={setSelectedCandidate}
        onCandidateCreated={handleCandidateCreated}
      />

      {selectedCandidate && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Actions disponibles</h2>
          <button onClick={() => console.log('Planifier entretien', selectedCandidate)}>
            Planifier un entretien
          </button>
        </div>
      )}
    </div>
  );
}
```

## Server Actions requises

Le composant utilise les Server Actions suivantes :

### `createCandidate`
```typescript
import { createCandidate } from '@/src/actions/recruitment/create-candidate';

const result = await createCandidate({
  job_posting_id: 'uuid',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  phone: '+33 6 12 34 56 78',
  linkedin_url: 'https://linkedin.com/in/jean',
  cv_url: 'https://...',
  cover_letter: 'Motivation...',
  source: 'linkedin'
});
```

### `uploadCV`
```typescript
import { uploadCV } from '@/src/actions/recruitment/upload-cv';

const formData = new FormData();
formData.append('file', file);

const result = await uploadCV(formData);
// result.data: { url: string, path: string }
```

### `getCandidates`
```typescript
import { getCandidates } from '@/src/actions/recruitment/get-candidates';

const result = await getCandidates({
  job_posting_id: 'uuid', // optional
  status: 'new',          // optional
  current_stage: 'applied' // optional
});
```

### `getJobPostings`
```typescript
import { getJobPostings } from '@/src/actions/recruitment/get-job-postings';

const result = await getJobPostings({
  status: 'active',       // optional
  department: 'IT',       // optional
  location: 'Paris'       // optional
});
```

## Configuration Supabase Storage

Le composant nécessite un bucket Supabase Storage nommé `cvs`. Créez-le avec :

```sql
-- Dans Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true);

-- Politique d'upload (authentifié uniquement)
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs');

-- Politique de lecture (public)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');
```

## Validation des données

Le composant utilise le schéma Zod suivant :

```typescript
const createCandidateSchema = z.object({
  job_posting_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  cv_url: z.string().optional(),
  cover_letter: z.string().max(5000).optional().or(z.literal('')),
  source: z.string().max(100).optional().or(z.literal('')),
});
```

## Gestion des erreurs

Le composant gère automatiquement les erreurs et affiche des notifications toast :

- ✅ **Succès** : Notification verte avec message de confirmation
- ❌ **Erreur** : Notification rouge avec message d'erreur détaillé
- ⚠️ **Validation** : Messages d'erreur sous chaque champ invalide

## Personnalisation

### Modifier les sources de candidats

```tsx
// Dans le composant, ligne ~520
<select id="source" {...register('source')}>
  <option value="manual">Ajout manuel</option>
  <option value="linkedin">LinkedIn</option>
  <option value="indeed">Indeed</option>
  <option value="website">Site web</option>
  <option value="referral">Recommandation</option>
  <option value="custom">Ma source custom</option>
</select>
```

### Modifier les types de fichiers acceptés

```tsx
// Dans handleCVUpload, ligne ~110
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain' // Ajouter TXT par exemple
];
```

### Modifier la taille maximale de fichier

```tsx
// Dans handleCVUpload, ligne ~118
const maxSize = 20 * 1024 * 1024; // 20MB au lieu de 10MB
```

## Accessibilité

Le composant respecte les normes d'accessibilité :

- ✅ Labels associés à tous les inputs
- ✅ Gestion du focus clavier
- ✅ Messages d'erreur liés via `aria-describedby`
- ✅ États de chargement annoncés
- ✅ Navigation au clavier complète

## Performance

Optimisations incluses :

- 🚀 Recherche locale côté client (pas d'appel API à chaque frappe)
- 🚀 Upload de CV avec feedback en temps réel
- 🚀 Validation instantanée avec React Hook Form
- 🚀 États de chargement optimistes

## Tests

Exemple de test unitaire :

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CandidateSelectorEnhanced } from './CandidateSelectorEnhanced';

describe('CandidateSelectorEnhanced', () => {
  const mockCandidates = [
    { id: '1', name: 'Jean Dupont', email: 'jean@test.com', job_posting_id: 'job1' }
  ];

  const mockJobs = [
    { id: 'job1', title: 'Developer', status: 'active' }
  ];

  it('should render candidate list', () => {
    render(
      <CandidateSelectorEnhanced
        candidates={mockCandidates}
        jobs={mockJobs}
        selectedCandidate={null}
        onSelectCandidate={jest.fn()}
      />
    );

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('should select candidate on click', async () => {
    const onSelect = jest.fn();

    render(
      <CandidateSelectorEnhanced
        candidates={mockCandidates}
        jobs={mockJobs}
        selectedCandidate={null}
        onSelectCandidate={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Jean Dupont'));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(mockCandidates[0]);
    });
  });
});
```

## Troubleshooting

### Le CV ne s'uploade pas

1. Vérifiez que le bucket `cvs` existe dans Supabase Storage
2. Vérifiez les politiques RLS sur `storage.objects`
3. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis

### Erreur "Unauthorized" lors de la création

1. Vérifiez que l'utilisateur est bien authentifié
2. Vérifiez que l'utilisateur a un `organization_id` dans la table `profiles`
3. Vérifiez les politiques RLS sur la table `candidates`

### Les candidats ne s'affichent pas

1. Vérifiez que `getCandidates()` retourne bien des données
2. Vérifiez la console pour les erreurs
3. Vérifiez que `candidates` est un array valide

## Changelog

### Version 2.0.0 (Enhanced)
- ✨ Ajout de React Hook Form avec validation Zod
- ✨ Upload de CV vers Supabase Storage
- ✨ Intégration complète avec Server Actions
- ✨ Amélioration de l'UX avec états de chargement
- ✨ Ajout des notifications toast
- 🐛 Correction de la gestion des URLs vides
- 📝 Documentation complète

### Version 1.0.0 (Original)
- Sélection de candidats existants
- Création manuelle de candidats
- Interface à onglets

## Support

Pour toute question ou problème :

1. Consultez la documentation du projet dans `/docs`
2. Vérifiez les exemples dans `/app/dashboard/recruitment`
3. Consultez le code source dans `/components/recruitment`

## License

Ce composant fait partie du projet Targetym et suit la même licence MIT.
