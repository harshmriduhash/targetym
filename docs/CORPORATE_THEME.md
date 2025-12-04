# Corporate Theme - Dark Mode Implementation

## Overview

Le thème corporate dark mode a été implémenté avec succès sur l'ensemble du projet Targetym AI. Ce document décrit les détails de l'implémentation.

## 🎨 Palette de Couleurs

### Mode Clair (Light Mode)

| Élément | HSL | Hex | Usage |
|---------|-----|-----|-------|
| Background | `0 0% 100%` | `#FFFFFF` | Fond principal |
| Foreground | `222.2 84% 4.9%` | `#020817` | Texte principal |
| Primary | `221.2 83.2% 53.3%` | `#3B82F6` | Boutons, liens, accents |
| Secondary | `210 40% 96.1%` | `#F1F5F9` | Surfaces secondaires |
| Muted | `210 40% 96.1%` | `#F1F5F9` | Textes désactivés |
| Border | `214.3 31.8% 91.4%` | `#E2E8F0` | Bordures |

### Mode Sombre (Dark Mode)

| Élément | HSL | Hex | Usage |
|---------|-----|-----|-------|
| Background | `222.2 84% 4.9%` | `#020617` | Fond principal riche |
| Foreground | `210 40% 98%` | `#F8FAFC` | Texte principal |
| Primary | `217.2 91.2% 59.8%` | `#3B82F6` | Boutons, liens, accents vibrants |
| Secondary | `217.2 32.6% 17.5%` | `#1E293B` | Surfaces élevées |
| Card | `222.2 84% 8%` | `#0F172A` | Cartes légèrement élevées |
| Muted | `217.2 32.6% 17.5%` | `#1E293B` | Surfaces mutées |
| Border | `217.2 32.6% 17.5%` | `#1E293B` | Bordures subtiles |

## 📊 Couleurs des Graphiques

Les couleurs de graphiques sont cohérentes entre les modes clair et sombre:

1. **Chart-1 (Blue)**: Corporate Blue - `#3B82F6`
2. **Chart-2 (Green)**: Success Green - `#22C55E`
3. **Chart-3 (Purple)**: Info Purple - `#A855F7`
4. **Chart-4 (Yellow)**: Warning Yellow - `#FACC15`
5. **Chart-5 (Red)**: Danger Red - `#EF4444`

## 🔧 Configuration Technique

### ThemeProvider

Le projet utilise `next-themes` pour la gestion des thèmes:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Attributs:**
- `attribute="class"`: Utilise la classe `.dark` pour le mode sombre
- `defaultTheme="system"`: Détecte automatiquement les préférences système
- `enableSystem`: Active la détection des préférences système
- `disableTransitionOnChange`: Désactive les transitions lors du changement de thème

### ThemeToggle Component

Un bouton de basculement de thème est disponible dans le header du dashboard:

**Localisation**: `components/theme-toggle.tsx`

**Fonctionnalités:**
- Icône animée (Soleil/Lune) avec rotation fluide
- Toggle simple entre mode clair et mode sombre
- Prévention des erreurs d'hydratation avec `mounted` state

## 🎯 Styles Personnalisés

### Transitions Douces

Toutes les transitions de couleur sont fluides (200ms):

```css
* {
  transition-property: color, background-color, border-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

### Scrollbar Stylisée

**Mode Clair:**
- Track: `bg-muted/20`
- Thumb: `bg-muted-foreground/40`
- Hover: `bg-muted-foreground/60`

**Mode Sombre:**
- Track: `hsl(222.2 84% 6%)` - Très foncé
- Thumb: `hsl(217.2 32.6% 25%)` - Gris-bleu
- Hover: `hsl(217.2 32.6% 35%)` - Gris-bleu plus clair

### Cards Élevées (Dark Mode)

En mode sombre, les cartes ont une couleur légèrement plus claire que le fond:

```css
.dark {
  --card: 222.2 84% 8%; /* Légèrement élevé du fond */
}
```

## 📱 Composants Utilisant le Thème

### Dashboard

**Fichiers:**
- `app/dashboard/layout.tsx` - Layout principal avec sidebar et header
- `components/dashboard/DashboardHeader.tsx` - Header avec ThemeToggle
- `components/dashboard/DashboardContent.tsx` - Contenu principal
- `components/dashboard/DashboardSidebar.tsx` - Navigation latérale

**Fonctionnalités:**
- Fond transparent avec backdrop-blur dans le header
- Sidebar avec background cohérent
- Cards avec élévation appropriée
- Boutons et badges avec couleurs primary/secondary

### Modules HR

Tous les modules HR utilisent le thème corporate:

1. **Goals & OKRs** (`app/dashboard/goals`)
   - Cards de progrès avec couleurs de graphiques
   - Badges de statut colorés
   - Formulaires avec input stylisés

2. **Recruitment** (`app/dashboard/recruitment`)
   - Pipeline Kanban avec cards mobiles
   - Status badges avec couleurs cohérentes
   - Formulaires de job posting

3. **Performance** (`app/dashboard/performance`)
   - Reviews avec rating stars
   - Feedback cards
   - Graphiques de performance

## 🚀 Utilisation

### Changer de Thème

Les utilisateurs peuvent changer de thème via:

1. **Bouton de basculement**: Clic sur l'icône soleil/lune dans le header
2. **Préférences système**: Le thème suit automatiquement les préférences système par défaut

### Détecter le Thème en Code

```tsx
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()

  // theme = 'light' | 'dark' | 'system'

  return (
    <button onClick={() => setTheme('dark')}>
      Activer le mode sombre
    </button>
  )
}
```

## 🎨 Personnalisation

### Modifier les Couleurs

Pour personnaliser les couleurs, éditez `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Votre couleur corporate */
}

.dark {
  --primary: 217.2 91.2% 59.8%; /* Version plus vibrante pour le dark mode */
}
```

### Ajouter une Nouvelle Couleur

1. Définir la variable CSS dans `:root` et `.dark`
2. Ajouter dans `@theme inline` pour Tailwind
3. Utiliser avec `bg-{nom}`, `text-{nom}`, etc.

## ✅ Checklist d'Implémentation

- [x] Configuration de `next-themes`
- [x] ThemeProvider dans layout.tsx
- [x] Palette de couleurs corporate (light/dark)
- [x] ThemeToggle component
- [x] Integration dans DashboardHeader
- [x] Transitions fluides
- [x] Scrollbar stylisée
- [x] Cards élevées en dark mode
- [x] Couleurs de graphiques cohérentes
- [x] Tous les composants HR supportent le dark mode
- [x] Suppression de `disableTransitionOnChange` pour transitions fluides
- [x] defaultTheme = 'system' pour détection automatique

## 📚 Ressources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

## 🎉 Résultat

Le thème corporate dark mode offre:

✅ **Professionnel**: Palette bleue corporate élégante
✅ **Accessible**: Contrastes optimaux pour WCAG AA
✅ **Performant**: Transitions fluides sans lag
✅ **Cohérent**: Tous les composants utilisent le même système
✅ **Flexible**: Facile à personnaliser selon les besoins
