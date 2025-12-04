# 🔄 Régénération des Types TypeScript Supabase

## Problème

Lorsqu'une nouvelle table est ajoutée à Supabase via une migration, les types TypeScript ne sont pas automatiquement mis à jour. Cela cause des erreurs de compilation TypeScript.

## Solution Temporaire

Pour permettre le build immédiatement, on utilise `@ts-ignore` :

```typescript
// @ts-ignore: webhook_events table exists but is not in generated types yet
await supabase.from('webhook_events').insert({...})
```

**Note:** On utilise `@ts-ignore` plutôt que `@ts-expect-error` car `@ts-expect-error` échoue si l'erreur n'existe pas (ce qui peut arriver selon la configuration TypeScript).

## Solution Permanente : Régénérer les Types

### Option 1 : Via Supabase CLI (Recommandé)

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login

# Lier votre projet local au projet Supabase
supabase link --project-ref your-project-ref

# Générer les types depuis la base de données distante
supabase gen types typescript --linked > src/types/database.types.ts
```

### Option 2 : Via Script NPM

```bash
# Générer les types depuis Supabase distant
npm run supabase:types:remote

# Ou depuis Supabase local
npm run supabase:types
```

### Option 3 : Via Dashboard Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez le **Project URL** et **anon key**
5. Utilisez le script de génération :

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  --schema public > src/types/database.types.ts
```

## Quand Régénérer les Types

Régénérez les types après :

- ✅ Ajout d'une nouvelle table
- ✅ Ajout de nouvelles colonnes
- ✅ Modification de types de colonnes
- ✅ Ajout de nouvelles vues (views)
- ✅ Modification de fonctions RPC
- ✅ Ajout de nouvelles policies RLS

## Vérification

Après régénération, vérifiez que :

1. Le fichier `src/types/database.types.ts` a été mis à jour
2. Les erreurs TypeScript liées aux types Supabase ont disparu
3. Le build passe sans erreurs

## Commandes Utiles

```bash
# Vérifier les types TypeScript
npm run type-check

# Build avec vérification des types
npm run build

# Générer les types et vérifier
npm run supabase:types:remote && npm run type-check
```

## Tables Actuellement Manquantes dans les Types

- `webhook_events` - Table pour l'idempotence des webhooks Clerk
  - Migration: `supabase/migrations/20251117_webhook_idempotency.sql`
  - Solution temporaire: `@ts-expect-error` ajouté dans `app/api/webhooks/clerk/route.ts`

## Notes

- Les types sont générés depuis la **base de données réelle**, pas depuis les migrations
- Assurez-vous que toutes les migrations ont été appliquées avant de régénérer
- En production, régénérez les types après chaque déploiement de migration

