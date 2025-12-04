# Guide de Test de l'Authentification Supabase

## 🧪 Tests Manuels en Local

### Prérequis

1. Supabase doit être démarré :
   ```bash
   npm run supabase:start
   ```

2. Le serveur de développement Next.js doit être lancé :
   ```bash
   npm run dev
   ```

3. Accès aux URLs :
   - Application : http://localhost:3001
   - Supabase Studio : http://localhost:54323
   - Mailpit (emails de test) : http://localhost:54324

---

## ✅ Test 1 : Inscription Utilisateur (Email/Password)

### Étapes

1. **Ouvrir la page d'inscription**
   - Allez sur : http://localhost:3001/auth/signup

2. **Remplir le formulaire**
   - Email : `test@example.com`
   - Password : `Test123456!`
   - (Optionnel) First Name : `Test`
   - (Optionnel) Last Name : `User`

3. **Soumettre le formulaire**
   - Cliquez sur "Sign Up" ou "S'inscrire"

4. **Vérifier dans Supabase Studio**
   - Allez sur http://localhost:54323
   - Naviguez vers `Authentication` → `Users`
   - ✅ Vous devriez voir le nouvel utilisateur

5. **Vérifier le profil créé automatiquement**
   - Dans Supabase Studio, allez sur `Table Editor` → `profiles`
   - ✅ Vous devriez voir un profil avec :
     - `id` = ID de l'utilisateur auth
     - `email` = test@example.com
     - `organization_id` = ID d'une organisation (créée automatiquement)
     - `role` = 'employee'
     - `employment_status` = 'active'

6. **Vérifier l'organisation**
   - Dans Supabase Studio, allez sur `Table Editor` → `organizations`
   - ✅ Vous devriez voir une organisation "Default Organization"

7. **Vérifier la redirection**
   - Après inscription, vous devriez être redirigé vers `/dashboard`
   - ✅ Vérifiez que vous êtes bien connecté

---

## ✅ Test 2 : Connexion Utilisateur (Email/Password)

### Étapes

1. **Se déconnecter** (si connecté)
   - Cliquez sur votre profil → "Sign Out" ou "Déconnexion"

2. **Ouvrir la page de connexion**
   - Allez sur : http://localhost:3001/auth/signin

3. **Remplir le formulaire**
   - Email : `test@example.com`
   - Password : `Test123456!`

4. **Soumettre le formulaire**
   - Cliquez sur "Sign In" ou "Se connecter"

5. **Vérifier la redirection**
   - ✅ Vous devriez être redirigé vers `/dashboard`
   - ✅ Vous devriez voir votre nom/email dans la navbar

6. **Vérifier le cookie de session**
   - Ouvrez les DevTools (F12)
   - Allez dans `Application` → `Cookies`
   - ✅ Vous devriez voir un cookie commençant par `sb-` avec :
     - `httpOnly: true`
     - `secure: false` (en local)
     - `sameSite: lax`

---

## ✅ Test 3 : Protection des Routes (Middleware)

### Étapes

1. **Se déconnecter** (si connecté)

2. **Tenter d'accéder à une route protégée**
   - Allez sur : http://localhost:3001/dashboard

3. **Vérifier la redirection**
   - ✅ Vous devriez être redirigé vers `/auth/signin`
   - ✅ L'URL devrait contenir `?redirect=/dashboard`

4. **Se connecter**
   - Connectez-vous avec vos credentials

5. **Vérifier la redirection après connexion**
   - ✅ Vous devriez être redirigé vers `/dashboard` (l'URL originale)

---

## ✅ Test 4 : Réinitialisation de Mot de Passe

### Étapes

1. **Ouvrir la page de réinitialisation**
   - Allez sur : http://localhost:3001/auth/forgot-password

2. **Entrer votre email**
   - Email : `test@example.com`

3. **Soumettre le formulaire**
   - Cliquez sur "Send Reset Link"

4. **Vérifier l'email dans Mailpit**
   - Allez sur : http://localhost:54324
   - ✅ Vous devriez voir un email "Reset Your Password"
   - Cliquez dessus pour l'ouvrir

5. **Cliquer sur le lien de reset**
   - Cliquez sur le lien dans l'email
   - ✅ Vous devriez être redirigé vers `/auth/reset-password`

6. **Définir un nouveau mot de passe**
   - Entrez le nouveau mot de passe : `NewPassword123!`
   - Confirmez le mot de passe
   - Cliquez sur "Update Password"

7. **Vérifier la connexion avec le nouveau mot de passe**
   - Déconnectez-vous
   - Reconnectez-vous avec le nouveau mot de passe
   - ✅ La connexion devrait fonctionner

---

## ✅ Test 5 : Politiques RLS (Row Level Security)

### Étapes

1. **Créer un deuxième utilisateur**
   - Inscrivez un autre utilisateur : `test2@example.com`

2. **Vérifier l'isolation des profils**
   - Dans Supabase Studio, allez sur `SQL Editor`
   - Exécutez cette requête en étant connecté comme `test@example.com` :
     ```sql
     SELECT * FROM profiles;
     ```
   - ✅ Vous devriez voir uniquement les profils de votre organisation

3. **Vérifier les permissions de lecture**
   - Essayez de lire un profil d'une autre organisation :
     ```sql
     SELECT * FROM profiles WHERE email = 'test2@example.com';
     ```
   - ✅ Si `test2@example.com` est dans une autre org, vous ne devriez rien voir

4. **Vérifier les permissions de mise à jour**
   - Essayez de mettre à jour votre propre profil :
     ```sql
     UPDATE profiles
     SET job_title = 'Software Engineer'
     WHERE id = auth.uid();
     ```
   - ✅ La mise à jour devrait fonctionner

5. **Vérifier qu'on ne peut pas modifier un autre profil**
   - Essayez de mettre à jour le profil de quelqu'un d'autre :
     ```sql
     UPDATE profiles
     SET job_title = 'Hacker'
     WHERE email = 'test2@example.com' AND id != auth.uid();
     ```
   - ✅ La mise à jour devrait échouer (permission denied)

---

## ✅ Test 6 : Headers de Sécurité

### Étapes

1. **Ouvrir les DevTools** (F12)

2. **Aller dans l'onglet Network**

3. **Recharger la page**

4. **Sélectionner la requête principale** (document)

5. **Vérifier les Response Headers**
   - ✅ `X-Frame-Options: DENY`
   - ✅ `X-Content-Type-Options: nosniff`
   - ✅ `Referrer-Policy: strict-origin-when-cross-origin`
   - ✅ `Content-Security-Policy: ...` (doit être présent)
   - ✅ `Permissions-Policy: ...` (doit être présent)

---

## ✅ Test 7 : Gestion de Session

### Étapes

1. **Se connecter**
   - Connectez-vous normalement

2. **Vérifier l'état de la session**
   - Dans la console browser :
     ```javascript
     const { data } = await supabase.auth.getSession()
     console.log(data.session)
     ```
   - ✅ Vous devriez voir un objet session avec `access_token`, `refresh_token`, etc.

3. **Vérifier l'utilisateur**
   - Dans la console :
     ```javascript
     const { data } = await supabase.auth.getUser()
     console.log(data.user)
     ```
   - ✅ Vous devriez voir vos informations utilisateur

4. **Fermer et rouvrir l'onglet**
   - Fermez l'onglet
   - Rouvrez http://localhost:3001/dashboard
   - ✅ Vous devriez toujours être connecté (session persistée)

5. **Vérifier l'expiration automatique**
   - Attendez 1 heure (ou modifiez `jwt_expiry` dans `supabase/config.toml`)
   - Rechargez la page
   - ✅ Vous devriez être déconnecté et redirigé vers `/auth/signin`

---

## 🔧 Dépannage

### Problème : Utilisateur non redirigé après connexion

**Vérifications :**
1. Vérifiez que le middleware est actif dans `middleware.ts`
2. Vérifiez les cookies dans DevTools
3. Vérifiez les logs de la console browser

### Problème : Profil non créé automatiquement

**Vérifications :**
1. Vérifiez que le trigger existe :
   ```sql
   SELECT * FROM pg_trigger
   WHERE tgname = 'on_auth_user_created';
   ```
2. Vérifiez les logs Supabase dans le terminal
3. Réappliquez les migrations : `npm run supabase:reset`

### Problème : RLS bloque toutes les requêtes

**Vérifications :**
1. Vérifiez que vous êtes bien connecté : `supabase.auth.getUser()`
2. Vérifiez les politiques RLS dans Supabase Studio
3. Testez les requêtes dans le SQL Editor avec l'utilisateur connecté

### Problème : Email non reçu (reset password)

**Vérifications :**
1. Vérifiez Mailpit : http://localhost:54324
2. Vérifiez que `enable_confirmations = false` dans `supabase/config.toml`
3. Vérifiez les logs de Supabase dans le terminal

---

## 📊 Checklist de Test Complet

Avant de déployer en production, assurez-vous que tous ces tests passent :

- [ ] Inscription utilisateur fonctionne
- [ ] Profil créé automatiquement
- [ ] Organisation assignée
- [ ] Connexion email/password fonctionne
- [ ] Déconnexion fonctionne
- [ ] Middleware protège les routes
- [ ] Redirection après connexion fonctionne
- [ ] Réinitialisation de mot de passe fonctionne
- [ ] Emails reçus dans Mailpit
- [ ] RLS isole les données par organisation
- [ ] Headers de sécurité présents
- [ ] Session persistée après fermeture onglet
- [ ] Expiration de session fonctionne
- [ ] Mise à jour du profil fonctionne
- [ ] Impossible de modifier le profil d'un autre utilisateur

---

## 🚀 Prêt pour les Tests en Production

Une fois tous les tests locaux passés, vous pouvez passer aux tests en production en suivant le guide `AUTH_PRODUCTION_GUIDE.md`.

**Points d'attention pour la production :**
1. Configurer les URLs de redirection OAuth
2. Activer la confirmation par email si nécessaire
3. Configurer un serveur SMTP pour les emails
4. Vérifier les headers de sécurité
5. Activer HTTPS
6. Tester avec de vrais utilisateurs

---

Bon test ! 🎉
