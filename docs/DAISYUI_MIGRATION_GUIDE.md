# Guide de Migration shadcn/ui → Daisy UI

## 📊 État Actuel

**Configuration:** Migration progressive (coexistence)
- ✅ Daisy UI installé et configuré
- ✅ shadcn/ui conservé et fonctionnel
- ✅ Préfixe `daisy-` activé pour éviter les conflits

**Statistiques:**
- **765 occurrences** de composants shadcn/ui
- **215 fichiers** à migrer potentiellement
- **~30 composants** shadcn/ui différents utilisés

## 🎯 Approche de Migration

### Option 1: Migration Graduelle (Recommandée)
Migrer page par page, module par module à votre rythme.

### Option 2: Migration Hybride
Garder shadcn/ui pour certains composants complexes, utiliser Daisy UI pour les nouveaux.

## 🔄 Mapping des Composants

### Composants de Base

| shadcn/ui | Daisy UI | Notes |
|-----------|----------|-------|
| `<Button>` | `<button className="daisy-btn">` | Variantes: `daisy-btn-primary`, `daisy-btn-secondary` |
| `<Badge>` | `<div className="daisy-badge">` | Variantes: `daisy-badge-primary`, `daisy-badge-secondary` |
| `<Card>` | `<div className="daisy-card">` | Avec `daisy-card-body` pour le contenu |
| `<Input>` | `<input className="daisy-input">` | Variantes: `daisy-input-bordered`, `daisy-input-primary` |
| `<Select>` | `<select className="daisy-select">` | Avec options natives |
| `<Alert>` | `<div className="daisy-alert">` | Variantes: `daisy-alert-info`, `daisy-alert-success` |

### Composants de Formulaire

```tsx
// shadcn/ui (AVANT)
import { Input } from '@/components/ui/input'
<Input type="text" placeholder="Email" />

// Daisy UI (APRÈS)
<input
  type="text"
  placeholder="Email"
  className="daisy-input daisy-input-bordered w-full"
/>
```

### Badges

```tsx
// shadcn/ui (AVANT)
import { Badge } from '@/components/ui/badge'
<Badge variant="default">Nouveau</Badge>
<Badge variant="destructive">Erreur</Badge>
<Badge variant="secondary">En cours</Badge>

// Daisy UI (APRÈS)
<div className="daisy-badge daisy-badge-primary">Nouveau</div>
<div className="daisy-badge daisy-badge-error">Erreur</div>
<div className="daisy-badge daisy-badge-secondary">En cours</div>
```

### Boutons

```tsx
// shadcn/ui (AVANT)
import { Button } from '@/components/ui/button'
<Button variant="default">Cliquer</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="outline">Annuler</Button>

// Daisy UI (APRÈS)
<button className="daisy-btn daisy-btn-primary">Cliquer</button>
<button className="daisy-btn daisy-btn-error">Supprimer</button>
<button className="daisy-btn daisy-btn-outline">Annuler</button>
```

### Cards

```tsx
// shadcn/ui (AVANT)
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenu</p>
  </CardContent>
</Card>

// Daisy UI (APRÈS)
<div className="daisy-card bg-base-100 shadow-xl">
  <div className="daisy-card-body">
    <h2 className="daisy-card-title">Titre</h2>
    <p>Contenu</p>
  </div>
</div>
```

### Progress Bars

```tsx
// shadcn/ui (AVANT)
import { Progress } from '@/components/ui/progress'
<Progress value={75} />

// Daisy UI (APRÈS)
<progress className="daisy-progress daisy-progress-primary w-full" value="75" max="100"></progress>
```

## 📝 Exemple de Migration: Page Forms

### Fichier: `app/dashboard/forms/page.tsx`

**Avant (shadcn/ui):**
```tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Dans le composant
<Card>
  <CardHeader>
    <CardTitle>Formulaires</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="default">Actif</Badge>
    <Button onClick={handleClick}>Nouveau</Button>
  </CardContent>
</Card>
```

**Après (Daisy UI):**
```tsx
// Pas d'imports nécessaires !

// Dans le composant
<div className="daisy-card bg-base-100 shadow-xl">
  <div className="daisy-card-body">
    <h2 className="daisy-card-title">Formulaires</h2>
    <div className="daisy-badge daisy-badge-primary">Actif</div>
    <button className="daisy-btn daisy-btn-primary" onClick={handleClick}>
      Nouveau
    </button>
  </div>
</div>
```

## 🎨 Variantes de Couleurs Daisy UI

### Boutons
- `daisy-btn-primary` - Bouton principal (bleu)
- `daisy-btn-secondary` - Bouton secondaire (violet)
- `daisy-btn-accent` - Bouton accent
- `daisy-btn-info` - Information (cyan)
- `daisy-btn-success` - Succès (vert)
- `daisy-btn-warning` - Avertissement (orange)
- `daisy-btn-error` - Erreur (rouge)
- `daisy-btn-ghost` - Fantôme (transparent)
- `daisy-btn-link` - Lien
- `daisy-btn-outline` - Contour

### Badges
- `daisy-badge-primary`
- `daisy-badge-secondary`
- `daisy-badge-accent`
- `daisy-badge-info`
- `daisy-badge-success`
- `daisy-badge-warning`
- `daisy-badge-error`
- `daisy-badge-ghost`
- `daisy-badge-outline`

### Alerts
- `daisy-alert-info`
- `daisy-alert-success`
- `daisy-alert-warning`
- `daisy-alert-error`

## 🚀 Process de Migration par Page

### 1. Choisir une page simple
Commencez par une page avec peu de composants (ex: `app/dashboard/forms/page.tsx`)

### 2. Identifier les composants utilisés
```bash
grep "from '@/components/ui/" app/dashboard/forms/page.tsx
```

### 3. Remplacer un composant à la fois
- Remplacer les imports
- Remplacer les balises JSX
- Ajuster les classes CSS

### 4. Tester visuellement
```bash
npm run dev
```

### 5. Vérifier le TypeScript
```bash
npm run type-check
```

### 6. Commit
```bash
git add app/dashboard/forms/page.tsx
git commit -m "refactor: migrate forms page from shadcn/ui to Daisy UI"
```

## ⚠️ Points d'Attention

### Conflits Potentiels
1. **Classes CSS:** Le préfixe `daisy-` évite les conflits
2. **Thèmes:** next-themes continue de gérer dark/light
3. **Types TypeScript:** Daisy UI n'a pas de types React (utilise classes CSS natives)

### Composants Complexes
Certains composants shadcn/ui sont très complexes (Dialog, Sheet, DropdownMenu). Pour ceux-ci:
- **Option A:** Garder shadcn/ui (coexistence)
- **Option B:** Utiliser les équivalents Daisy UI (Modal, Drawer, Dropdown)
- **Option C:** Créer des wrappers personnalisés

## 📦 Composants Daisy UI Disponibles

- Alert
- Avatar
- Badge
- Breadcrumbs
- Button
- Card
- Carousel
- Checkbox
- Collapse
- Countdown
- Divider
- Drawer
- Dropdown
- File Input
- Footer
- Form
- Hero
- Indicator
- Input
- Join
- Kbd (Keyboard)
- Link
- Loading
- Menu
- Modal
- Navbar
- Pagination
- Progress
- Radio
- Range
- Rating
- Select
- Skeleton
- Stack
- Stats
- Swap
- Table
- Tabs
- Textarea
- Toast
- Toggle
- Tooltip

## 🔗 Ressources

- [Daisy UI Documentation](https://daisyui.com/)
- [Daisy UI Components](https://daisyui.com/components/)
- [Daisy UI Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)

## 📊 Ordre de Migration Suggéré

1. ✅ **Configuration** - FAIT
2. 🔄 **Pages simples** - Commencer ici
   - `app/dashboard/forms/page.tsx`
   - `app/dashboard/help/page.tsx`
   - `app/dashboard/leaves/page.tsx`
3. 🔄 **Composants widgets**
   - `components/dashboard/widgets/*`
4. 🔄 **Pages complexes**
   - `app/dashboard/goals/*`
   - `app/dashboard/recruitment/*`
5. ⏳ **Composants core** - En dernier
   - `src/components/*`

## 🎯 Prochaines Étapes

1. Créer une page d'exemple (voir: `app/dashboard/daisy-ui-example/page.tsx`)
2. Migrer la première page simple
3. Tester que tout fonctionne
4. Continuer progressivement

---

**Note:** Cette migration est PROGRESSIVE. Vous pouvez prendre votre temps et migrer page par page. Les deux bibliothèques coexistent sans problème grâce au préfixe `daisy-`.
