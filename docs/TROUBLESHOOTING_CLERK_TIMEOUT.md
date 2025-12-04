# 🔧 Dépannage : Erreur "Clerk: Failed to load Clerk" (Timeout)

## Erreur

```
ClerkRuntimeError: Clerk: Failed to load Clerk
(code="failed_to_load_clerk_js_timeout")
```

## Causes Possibles

### 1. Variable d'environnement manquante

**Symptôme** : L'erreur apparaît immédiatement au chargement de la page.

**Solution** :
1. Vérifiez que votre fichier `.env.local` contient :
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

2. Vérifiez le format de la clé :
   - Doit commencer par `pk_test_` (développement) ou `pk_live_` (production)
   - Doit avoir au moins 50 caractères

3. Redémarrez le serveur de développement :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   # ou
   pnpm dev
   ```

### 2. Problème de réseau / Timeout

**Symptôme** : L'erreur apparaît après quelques secondes.

**Solutions** :

1. **Vérifiez votre connexion internet** : Clerk doit télécharger des scripts depuis leurs serveurs.

2. **Vérifiez les bloqueurs de publicité** : Certains bloqueurs peuvent bloquer les scripts Clerk.

3. **Vérifiez les extensions de navigateur** : Désactivez temporairement les extensions pour tester.

4. **Vérifiez la console du navigateur** : Ouvrez les DevTools (F12) et regardez l'onglet Network pour voir si les requêtes vers Clerk échouent.

### 3. Problème de Content Security Policy (CSP)

**Symptôme** : L'erreur apparaît et la console montre des erreurs CSP.

**Solution** : La configuration CSP a été mise à jour dans `middleware.ts` pour permettre :
- `https://accounts.clerk.com`
- `https://*.clerk.accounts.dev`
- `https://api.clerk.dev`
- `https://img.clerk.com`

Si vous avez modifié le middleware, assurez-vous que ces domaines sont autorisés.

### 4. Problème avec Turbopack

**Symptôme** : L'erreur n'apparaît qu'avec Turbopack activé.

**Solution** : Essayez de désactiver Turbopack temporairement :
```bash
# Dans package.json, changez :
"dev": "next dev --turbopack"
# en :
"dev": "next dev"
```

## Vérification Rapide

### 1. Vérifier les variables d'environnement

Exécutez le script de validation :
```bash
npm run setup
# ou
pnpm setup
```

### 2. Vérifier la configuration Clerk

Exécutez :
```bash
npm run check:auth
# ou
pnpm check:auth
```

### 3. Vérifier dans le navigateur

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet **Console**
3. Recherchez les erreurs liées à Clerk
4. Allez dans l'onglet **Network**
5. Filtrez par "clerk"
6. Vérifiez si les requêtes échouent (statut rouge)

## Solutions Appliquées

Les corrections suivantes ont été appliquées :

1. ✅ **Validation explicite de la clé** dans `app/layout.tsx`
   - La prop `publishableKey` est maintenant explicitement passée au `ClerkProvider`
   - Un message d'erreur est affiché dans la console si la clé est manquante

2. ✅ **Amélioration de la CSP** dans `middleware.ts`
   - Ajout de tous les domaines Clerk nécessaires
   - Autorisation de `unsafe-eval` pour les scripts Clerk (nécessaire pour leur fonctionnement)

3. ✅ **Page SignIn simplifiée**
   - La page utilise maintenant directement le composant `SignIn` de Clerk
   - Pas de logique de détection complexe qui pourrait causer des problèmes

## Prochaines Étapes

Si l'erreur persiste :

1. **Vérifiez votre compte Clerk** :
   - Allez sur [Clerk Dashboard](https://dashboard.clerk.com)
   - Vérifiez que votre application est active
   - Vérifiez que les clés API sont valides

2. **Testez avec une nouvelle application Clerk** :
   - Créez une nouvelle application de test dans Clerk
   - Utilisez les nouvelles clés dans `.env.local`
   - Redémarrez le serveur

3. **Vérifiez les logs du serveur** :
   - Regardez la console où vous avez lancé `npm run dev`
   - Recherchez les erreurs ou warnings

4. **Contactez le support Clerk** :
   - Si rien ne fonctionne, contactez le support Clerk avec les détails de l'erreur

## Références

- [Documentation Clerk Next.js](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Troubleshooting](https://clerk.com/docs/troubleshooting)
- [Configuration CSP pour Clerk](https://clerk.com/docs/security/content-security-policy)

