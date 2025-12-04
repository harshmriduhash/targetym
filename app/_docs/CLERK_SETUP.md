# Guide de Configuration Clerk

## Problème Résolu : "Failed to load Clerk"

### Corrections Apportées

1. ✅ **En-têtes CSP mis à jour** dans `middleware.ts`
   - Ajout de tous les domaines Clerk nécessaires
   - Permission pour les scripts, styles, images, websockets

2. ✅ **ClerkProvider configuré** dans `app/layout.tsx`
   - Ajout de l'option `dynamic` pour le chargement côté client
   - Configuration de l'apparence de base
   - Redirection après déconnexion

3. ✅ **Images Clerk autorisées** dans `next.config.ts`
   - `img.clerk.com`
   - `**.clerk.accounts.dev`

4. ✅ **Variables d'environnement vérifiées**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` présente
   - `CLERK_SECRET_KEY` présente

---

## Étapes pour Tester

### 1. Arrêter le serveur actuel
Appuyez sur `Ctrl+C` dans le terminal où `npm run dev` tourne

### 2. Supprimer le cache Next.js
```bash
rm -rf .next
```

### 3. Redémarrer le serveur
```bash
npm run dev
```

### 4. Vérifier dans le navigateur
- Ouvrir http://localhost:3000
- Ouvrir la console développeur (F12)
- Vérifier qu'il n'y a plus d'erreurs Clerk

---

## Si l'erreur persiste

### Vérification 1 : Format des clés
Les clés Clerk doivent avoir ce format :
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Vérification 2 : Domaine Clerk
Dans le tableau de bord Clerk, vérifiez que :
1. Le domaine de développement est configuré
2. Les URLs autorisées incluent `http://localhost:3000`

### Vérification 3 : Console du navigateur
Si vous voyez des erreurs CORS ou CSP, notez le domaine bloqué et informez-moi

### Vérification 4 : Réseau
Vérifiez dans l'onglet Network de DevTools que :
- Les requêtes vers `clerk.com` et `*.clerk.accounts.dev` passent
- Aucune requête n'est bloquée (statut 200)

---

## Création d'une page de test

Pour tester Clerk rapidement, créez `app/test-clerk/page.tsx` :

```tsx
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function TestClerkPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded bg-blue-500 px-4 py-2 text-white">
            Se connecter
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded bg-green-500 px-4 py-2 text-white">
            S'inscrire
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        <p>Vous êtes connecté !</p>
      </SignedIn>
    </div>
  )
}
```

Visitez ensuite http://localhost:3000/test-clerk

---

## Vérification de la Configuration Clerk Dashboard

1. **Aller sur** https://dashboard.clerk.com
2. **Sélectionner votre application**
3. **Onglet "API Keys"**
   - Vérifier que les clés correspondent à votre `.env.local`
4. **Onglet "Paths"**
   - Sign-in URL: `/sign-in` (ou laisser par défaut)
   - Sign-up URL: `/sign-up` (ou laisser par défaut)
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
5. **Onglet "Allowed origins"** (sous Settings)
   - Ajouter `http://localhost:3000`

---

## Support

Si le problème persiste après ces étapes :
1. Copiez l'erreur complète de la console
2. Vérifiez l'onglet Network pour les requêtes bloquées
3. Informez-moi des détails
