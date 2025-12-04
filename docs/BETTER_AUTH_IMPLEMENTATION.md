# Better Auth Implementation Guide

## 🎉 Implémentation Complète de Better Auth

Better Auth a été intégré avec succès dans Targetym pour remplacer Clerk.

## 📦 Ce qui a été installé

- **better-auth** : Bibliothèque d'authentification principale
- **pg** : Client PostgreSQL (déjà installé via Supabase)

## 📁 Fichiers créés

### 1. Configuration Backend

#### `lib/auth.ts` - Instance Better Auth (Serveur)
```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: { ... },
    github: { ... },
  },
});
```

#### `lib/auth-client.ts` - Client Better Auth (Browser)
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

#### `app/api/auth/[...all]/route.ts` - Routes API
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### 2. Pages d'authentification

#### `app/auth/signin/page.tsx` - Page de connexion
- Formulaire email/password
- Boutons OAuth (Google, GitHub)
- Design moderne glassmorphism
- Gestion des erreurs
- Redirection vers /dashboard

### 3. Landing Page

#### `components/landing/LandingHero.tsx` - Boutons CTA mis à jour
- **"Démarrer gratuitement"** → `/dashboard`
- **"Se connecter"** → `/auth/signin`

## 🔧 Configuration requise

### Variables d'environnement (.env.local)

```bash
# Better Auth Secret (OBLIGATOIRE)
BETTER_AUTH_SECRET=votre-cle-secrete-generee

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# OAuth Providers (Optionnel)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
GITHUB_CLIENT_ID=votre-github-client-id
GITHUB_CLIENT_SECRET=votre-github-client-secret
```

### Générer la clé secrète

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: En ligne
# https://generate-secret.vercel.app/32
```

## 🗄️ Migration de la base de données

Better Auth nécessite des tables spécifiques dans Supabase :

```bash
# Générer le schéma Better Auth
npx @better-auth/cli generate

# Appliquer la migration
npm run supabase:reset
```

### Tables créées par Better Auth

- `user` - Utilisateurs
- `session` - Sessions actives
- `account` - Comptes liés (OAuth, email/password)
- `verification` - Tokens de vérification email
- `passkey` - Clés de passe (si activé)

## 🚀 Utilisation

### Côté Client (React Components)

```tsx
'use client';

import { authClient } from '@/lib/auth-client';

// Hook de session
const { data: session, isLoading } = authClient.useSession();

// Sign In Email/Password
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
  callbackURL: '/dashboard',
});

// Sign In avec OAuth
await authClient.signIn.social({
  provider: 'google', // ou 'github'
  callbackURL: '/dashboard',
});

// Sign Up
await authClient.signUp.email({
  name: 'John Doe',
  email: 'user@example.com',
  password: 'password123',
});

// Sign Out
await authClient.signOut();
```

### Côté Serveur (Server Actions/Components)

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Dans un Server Component
export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Welcome {session.user.name}</div>;
}

// Dans un Server Action
'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function myAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Logique métier...
}
```

## 🎨 Pages d'authentification disponibles

| Route | Description | Statut |
|-------|-------------|--------|
| `/auth/signin` | Connexion (Email + OAuth) | ✅ Créée |
| `/auth/signup` | Inscription | 🔄 À créer |
| `/auth/forgot-password` | Mot de passe oublié | 🔄 À créer |
| `/auth/verify-email` | Vérification email | 🔄 À créer |

## 🔐 Protection des routes

### Middleware Next.js

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Rediriger si pas de session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Routes protégées
};
```

## 📊 Fonctionnalités Better Auth

### ✅ Actuellement implémentées

- **Email/Password** : Authentification traditionnelle
- **OAuth Social** : Google & GitHub
- **Session Management** : Sessions sécurisées avec cookies
- **Type Safety** : TypeScript complet
- **API Routes** : `/api/auth/*` automatiques

### 🔄 À implémenter (optionnel)

- **Email Verification** : Vérification d'email
- **Password Reset** : Réinitialisation de mot de passe
- **2FA** : Authentification à deux facteurs
- **Passkeys** : WebAuthn / FIDO2
- **Magic Links** : Connexion sans mot de passe
- **Organizations** : Support multi-organisations

## 🆚 Comparaison Clerk vs Better Auth

| Fonctionnalité | Clerk | Better Auth |
|----------------|-------|-------------|
| **Prix** | 💰 Payant après 10k MAU | 🆓 Gratuit & Open Source |
| **Contrôle** | ☁️ SaaS externe | 🔧 Auto-hébergé (votre DB) |
| **Personnalisation** | ⚙️ Limitée | 🎨 Totale |
| **Dépendance** | 🔗 Vendor lock-in | 🔓 Indépendant |
| **Type Safety** | ✅ Oui | ✅ Oui |
| **OAuth Providers** | ✅ 20+ | ✅ 20+ |
| **Session** | ✅ JWT + Cookies | ✅ Cookies (recommandé) |
| **Middleware** | ✅ Built-in | ✅ Helpers fournis |

## 📖 Ressources

- **Documentation Better Auth** : https://better-auth.com
- **GitHub** : https://github.com/better-auth/better-auth
- **Discord** : https://discord.gg/better-auth
- **Examples** : https://demo.better-auth.com

## 🐛 Troubleshooting

### Erreur: "BETTER_AUTH_SECRET is not defined"
```bash
# Générer et ajouter à .env.local
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Erreur: "Database connection failed"
```bash
# Vérifier Supabase local
npm run supabase:status

# Démarrer si nécessaire
npm run supabase:start
```

### Erreur: "Tables do not exist"
```bash
# Appliquer les migrations Better Auth
npx @better-auth/cli generate
npm run supabase:reset
```

## 🎯 Prochaines étapes

1. ✅ **Configuration initiale** - Terminée
2. ✅ **Page de connexion** - Créée
3. 🔄 **Page d'inscription** - À créer
4. 🔄 **Migration des données utilisateurs** - Si migration depuis Clerk
5. 🔄 **Emails transactionnels** - Configuration SMTP/SendGrid
6. 🔄 **Tests** - Tests unitaires et e2e
7. 🔄 **Documentation utilisateur** - Guide pour les utilisateurs finaux

## ✨ Avantages de l'implémentation

### 1. **Coût réduit**
- Pas de frais mensuels
- Pas de limite d'utilisateurs
- Contrôle total des coûts

### 2. **Contrôle total**
- Base de données sous votre contrôle (Supabase)
- Pas de dépendance externe critique
- Personnalisation illimitée

### 3. **Performance**
- Pas d'appel API externe pour l'auth
- Session management optimisé
- Latence réduite

### 4. **Sécurité**
- Données sensibles dans votre infrastructure
- Conformité RGPD facilitée
- Audit complet possible

### 5. **Developer Experience**
- TypeScript de bout en bout
- API intuitive
- Documentation excellente

## 📝 Notes importantes

- ⚠️ Ne **jamais** exposer `BETTER_AUTH_SECRET` côté client
- ⚠️ Utiliser `NEXT_PUBLIC_` uniquement pour les variables publiques
- ⚠️ Configurer HTTPS en production (requis pour OAuth)
- ⚠️ Implémenter rate limiting pour prévenir les attaques
- ⚠️ Tester thoroughly avant de déployer en production

---

**Implémentation par Claude Code** - ${new Date().toLocaleDateString('fr-FR')}
