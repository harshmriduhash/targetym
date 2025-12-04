# 🔐 Configuration Supabase Auth - Guide Rapide

**Statut:** ✅ Implémentation 100% Supabase Auth (pas Better Auth)

---

## 🚀 Étapes de Configuration (5 minutes)

### Étape 1: Exécuter le Script SQL dans Supabase

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet **juuekovwshynwgjkqkbu**

2. **Ouvrez le SQL Editor**
   - Cliquez sur **"SQL Editor"** dans le menu latéral
   - Cliquez sur **"New query"**

3. **Copiez et exécutez le script**
   - Ouvrez le fichier `supabase/auth-setup.sql`
   - Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)
   - Collez dans l'éditeur SQL
   - Cliquez sur **"Run"** (ou Ctrl+Enter)

4. **Vérifiez que tout fonctionne**
   Vous devriez voir dans les résultats:
   ```
   ✅ Tables créées:
     - organizations
     - profiles

   ✅ Triggers créés:
     - on_auth_user_created (auto-create profile)

   ✅ RLS Policies activées

   ✅ Helper functions disponibles

   🚀 Supabase Auth est prêt !
   ```

---

### Étape 2: Vérifier les Tables Créées

Dans le menu **"Table Editor"**, vous devriez voir:

- ✅ `organizations` - Table des organisations
- ✅ `profiles` - Table des profils utilisateurs

---

### Étape 3: Tester l'Authentification

#### Test 1: Inscription d'un Utilisateur

1. **Lancez votre application**
   ```bash
   npm run dev
   ```

2. **Allez sur la page d'inscription**
   - Ouvrez http://localhost:3001/auth/signup

3. **Créez un compte**
   - Nom: Votre nom
   - Email: votre-email@example.com
   - Mot de passe: minimum 8 caractères
   - Acceptez les conditions
   - Cliquez sur "Créer mon compte"

4. **Vérifiez dans Supabase Dashboard**
   - Allez dans **Authentication** → **Users**
   - Vous devriez voir votre nouvel utilisateur
   - Allez dans **Table Editor** → **profiles**
   - Vous devriez voir un profil créé automatiquement avec votre email

#### Test 2: Connexion

1. **Allez sur la page de connexion**
   - http://localhost:3001/auth/signin

2. **Connectez-vous**
   - Email: votre-email@example.com
   - Mot de passe: votre mot de passe
   - Cliquez sur "Se connecter"

3. **Vérifiez la redirection**
   - Vous devriez être redirigé vers `/dashboard`
   - Le middleware protège maintenant cette route

#### Test 3: Protection des Routes

1. **Déconnectez-vous**
   - (Implémentez un bouton de déconnexion ou supprimez les cookies manuellement)

2. **Essayez d'accéder à /dashboard**
   - Vous devriez être redirigé vers `/auth/signin`

3. **Vérifiez le paramètre redirect**
   - L'URL devrait être: `/auth/signin?redirect=/dashboard`
   - Après connexion, vous serez redirigé vers `/dashboard`

---

## 📋 Ce qui a été Implémenté

### ✅ Backend Supabase Auth

**Fichiers configurés:**
- `src/lib/supabase/server.ts` - Client serveur avec cookies
- `src/lib/supabase/client.ts` - Client navigateur
- `src/lib/supabase/middleware.ts` - Client middleware
- `src/lib/supabase/auth.ts` - Helpers d'authentification
- `src/lib/auth/server-auth.ts` - Helper getAuthContext

**Fonctionnalités disponibles:**
- ✅ Connexion email/mot de passe
- ✅ Inscription email/mot de passe
- ✅ OAuth (Google, GitHub, Microsoft) - À configurer
- ✅ Réinitialisation de mot de passe
- ✅ Mise à jour de mot de passe
- ✅ Gestion de session automatique
- ✅ Protection des routes via middleware

### ✅ Frontend

**Pages d'authentification:**
- `/auth/signin` - Page de connexion complète
- `/auth/signup` - Page d'inscription complète
- `/auth/forgot-password` - Mot de passe oublié
- `/auth/reset-password` - Réinitialisation
- `/auth/callback` - Callback OAuth

**Provider React:**
- `providers/auth-provider.tsx` - Context Provider
- Hook `useAuth()` disponible dans tous les composants
- État synchronisé automatiquement

### ✅ Middleware de Protection

**Routes protégées automatiquement:**
- `/dashboard/*` - Nécessite authentification
- `/app/*` - Nécessite authentification
- Toutes les autres routes (sauf celles listées ci-dessous)

**Routes publiques:**
- `/` - Page d'accueil
- `/auth/*` - Toutes les pages d'authentification
- `/api/auth/*` - Routes API d'authentification
- `/api/health` - Health check

**Comportement:**
- Redirection vers `/auth/signin` si non authentifié
- Préservation de l'URL d'origine pour redirection après login
- Si authentifié et essaie d'accéder à `/auth/*`, redirige vers `/dashboard`

---

## 🔧 Configuration OAuth (Optionnel)

Si vous voulez utiliser Google, GitHub ou Microsoft OAuth:

### Google OAuth

1. **Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials
   - Créer des credentials OAuth 2.0
   - Authorized redirect URI: `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**
   - Authentication → Providers → Google
   - Activer et coller Client ID et Client Secret

### GitHub OAuth

1. **GitHub Settings**
   - https://github.com/settings/developers
   - New OAuth App
   - Authorization callback URL: `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**
   - Authentication → Providers → GitHub
   - Activer et coller Client ID et Client Secret

### Microsoft OAuth

1. **Azure Portal**
   - https://portal.azure.com
   - Azure Active Directory → App registrations
   - Redirect URI: `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**
   - Authentication → Providers → Microsoft
   - Activer et coller Application ID et Secret

---

## 🐛 Dépannage

### Problème: "User not found" lors de la connexion

**Solution:**
- Vérifiez que l'email existe dans Authentication → Users
- Vérifiez que le profil existe dans Table Editor → profiles
- Si le profil n'existe pas, le trigger `on_auth_user_created` n'a pas fonctionné

### Problème: "Organization not found"

**Solution:**
```sql
-- Assigner une organisation à un utilisateur
UPDATE profiles
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org')
WHERE email = 'votre-email@example.com';
```

### Problème: Redirection infinie après connexion

**Solution:**
- Vérifiez que le middleware est bien configuré
- Vérifiez que les cookies Supabase sont bien définis
- Essayez de supprimer les cookies du navigateur et reconnectez-vous

### Problème: OAuth ne fonctionne pas

**Solution:**
1. Vérifiez que le provider est activé dans Supabase Dashboard
2. Vérifiez les credentials (Client ID et Secret)
3. Vérifiez que l'URL de callback est correcte
4. Testez en navigation privée (pour éviter les problèmes de cache)

---

## 📝 Prochaines Étapes

### 1. Créer une Page Dashboard (Recommandé)

Créez `app/dashboard/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-2">
        <p>Email: {user.email}</p>
        <p>Nom: {profile?.full_name || 'Non défini'}</p>
        <p>Rôle: {profile?.role || 'employee'}</p>
        <p>Organisation: {profile?.organization?.name || 'Non assignée'}</p>
      </div>
    </div>
  );
}
```

### 2. Ajouter un Bouton de Déconnexion

Dans votre layout ou header:
```tsx
'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Button onClick={handleSignOut} variant="outline">
      Se déconnecter
    </Button>
  );
}
```

### 3. Utiliser useAuth dans vos Composants

```tsx
'use client';

import { useAuth } from '@/providers/auth-provider';

export function UserProfile() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Non connecté</div>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
```

### 4. Utiliser getAuthContext dans Server Actions

```typescript
'use server';

import { getAuthContext } from '@/src/lib/auth/server-auth';

export async function monAction() {
  // Récupère userId, organizationId, role
  const { userId, organizationId, role } = await getAuthContext();

  // Votre logique métier...
}
```

---

## ✅ Checklist de Vérification

- [ ] Script SQL exécuté dans Supabase
- [ ] Tables `organizations` et `profiles` créées
- [ ] Trigger `on_auth_user_created` activé
- [ ] Test d'inscription réussi
- [ ] Profil créé automatiquement
- [ ] Test de connexion réussi
- [ ] Redirection vers `/dashboard` fonctionne
- [ ] Protection des routes fonctionne
- [ ] Middleware redirige vers `/auth/signin` si non authentifié

---

## 📞 Support

**Documentation Supabase:**
- Auth: https://supabase.com/docs/guides/auth
- Next.js: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- RLS: https://supabase.com/docs/guides/auth/row-level-security

**Logs Supabase:**
- Dashboard → Logs → Auth Logs
- Dashboard → Logs → Database Logs

---

**Créé le:** 2025-10-23
**Architecture:** 100% Supabase Auth (Pas Better Auth)
**Statut:** ✅ Prêt à tester
