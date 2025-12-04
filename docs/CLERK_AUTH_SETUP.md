# ✅ Clerk Authentication - Configuration Complète

## 🎯 Ce qui a été fait

### 1. **Pages d'authentification personnalisées créées**
- ✅ `/auth/sign-in` - Page de connexion Clerk avec branding Targetym
- ✅ `/auth/sign-up` - Page d'inscription Clerk avec branding Targetym
- ✅ `/auth/error` - Page d'erreur personnalisée
- ✅ `/auth/verify` - Page de vérification email

### 2. **Composants migrés vers Clerk**
- ✅ `UserMenu.tsx` - Utilise `useUser()` et `useClerk()` de Clerk
- ✅ `SignOutButton.tsx` - Utilise `useClerk()` pour la déconnexion
- ✅ `WelcomeCard.tsx` - Utilise `useUser()` pour afficher le nom

### 3. **Configuration de routage**
- ✅ `middleware.ts` - Protection des routes avec `clerkMiddleware`
- ✅ `app/layout.tsx` - ClerkProvider avec redirections configurées
- ✅ `app/dashboard/layout.tsx` - Vérification auth avec `auth()` de Clerk

### 4. **Pages supprimées (obsolètes)**
- ❌ `/auth/forgot-password` - Géré par Clerk
- ❌ `/auth/reset-password` - Géré par Clerk
- ❌ `/auth/signin.backup` - Ancien Supabase Auth
- ❌ `/auth/signup.backup` - Ancien Supabase Auth

## 🚀 Configuration requise

### Variables d'environnement (.env.local)

```bash
# Clerk (OBLIGATOIRE)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Supabase (OBLIGATOIRE pour la DB)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### Obtenir les clés Clerk

1. **Visitez** https://dashboard.clerk.com/
2. **Sélectionnez** votre projet ou créez-en un nouveau
3. **Allez dans** "API Keys"
4. **Copiez** :
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

### Configurer le Webhook Clerk

1. **Dashboard Clerk** → Webhooks → Add Endpoint
2. **URL** : `https://your-domain.com/api/webhooks/clerk`
   - En local avec ngrok : `https://xxx.ngrok.io/api/webhooks/clerk`
3. **Events à souscrire** :
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. **Copiez** le Signing Secret → `CLERK_WEBHOOK_SECRET`

## 📊 Flow d'authentification

### Inscription (Sign Up)
```
Landing Page → Clic "Démarrer" → /auth/sign-up (Clerk)
→ Création compte → Webhook sync Supabase → Redirect /dashboard
```

### Connexion (Sign In)
```
Landing Page → Clic "Se connecter" → /auth/sign-in (Clerk)
→ Authentification → Session créée → Redirect /dashboard
```

### Protection des routes
```
User non auth → /dashboard → Middleware → Redirect /auth/sign-in
User auth → /auth/sign-in → Middleware → Redirect /dashboard
```

### Déconnexion
```
Dashboard → Clic "Se déconnecter" → signOut() Clerk → Redirect /
```

## 🧪 Tester l'authentification

### 1. Démarrer le serveur
```bash
# Nettoyer le cache
rm -rf .next

# Démarrer
npm run dev
```

### 2. Tester le flow
1. **Visitez** http://localhost:3001
2. **Cliquez** sur "Démarrer gratuitement"
3. **Créez** un compte
4. **Vérifiez** redirection vers `/dashboard`
5. **Testez** la déconnexion

### 3. Vérifier le sync Supabase
```sql
-- Dans Supabase Studio
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
```

## ⚠️ Problèmes courants

### Erreur: "useAuth must be used within an AuthProvider"
**Cause:** Cache du navigateur avec ancienne version
**Solution:**
```bash
rm -rf .next
npm run dev
# Puis rafraîchir le navigateur (Ctrl+Shift+R)
```

### Erreur: "CLERK_SECRET_KEY is not defined"
**Cause:** Variables d'environnement manquantes
**Solution:**
```bash
cp .env.production.example .env.local
# Éditer .env.local avec vos vraies clés
```

### Webhook ne fonctionne pas
**Cause:** Signature invalide ou URL incorrecte
**Solution:**
1. Vérifier `CLERK_WEBHOOK_SECRET` est correct
2. Tester avec ngrok en local
3. Vérifier les logs Clerk Dashboard → Webhooks

## 📝 Utilisation dans le code

### Obtenir l'utilisateur (Client Component)
```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return null
  
  return <div>Hello {user.firstName}</div>
}
```

### Obtenir l'utilisateur (Server Component)
```typescript
import { auth } from '@clerk/nextjs/server'

export default async function MyPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/auth/sign-in')
  }
  
  return <div>User ID: {userId}</div>
}
```

### Déconnexion
```typescript
'use client'
import { useClerk } from '@clerk/nextjs'

export function LogoutButton() {
  const { signOut } = useClerk()
  
  return (
    <button onClick={() => signOut()}>
      Déconnexion
    </button>
  )
}
```

## ✅ Checklist de vérification

- [ ] Variables Clerk dans `.env.local`
- [ ] Webhook configuré dans Clerk Dashboard
- [ ] Serveur dev redémarré après config
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Test inscription fonctionne
- [ ] Test connexion fonctionne
- [ ] Test déconnexion fonctionne
- [ ] Profil créé dans Supabase après inscription
- [ ] Redirection vers dashboard après auth

## 🎉 Résultat

Après configuration, vous avez :
- ✅ Authentification sécurisée avec Clerk
- ✅ Pages d'auth avec votre branding
- ✅ Sync automatique avec Supabase
- ✅ Protection automatique des routes
- ✅ Gestion session automatique
- ✅ Support OAuth (Google, GitHub, etc.)

---

**Documentation Clerk:** https://clerk.com/docs
**Support:** https://clerk.com/support
