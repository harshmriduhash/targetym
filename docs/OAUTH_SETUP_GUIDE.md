# Guide Complet : Configuration OAuth pour Targetym

Ce guide vous accompagne pour configurer Google OAuth et GitHub OAuth pour votre application Targetym.

---

## 🔴 PARTIE 1 : Google OAuth Configuration

### Étape 1.1 : Créer un Projet Google Cloud (si vous n'en avez pas)

1. **Allez sur** : https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Select a project"** en haut → **"New Project"**
4. Remplissez :
   - **Project name** : `Targetym`
   - **Organization** : (laisser par défaut ou sélectionner)
5. Cliquez sur **"Create"**
6. Attendez quelques secondes que le projet soit créé

### Étape 1.2 : Configurer l'Écran de Consentement OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"OAuth consent screen"**
2. Choisissez le type d'utilisateur :
   - ✅ **External** (pour tous les utilisateurs avec un compte Google)
   - ⚪ Internal (uniquement pour votre organisation Google Workspace)
3. Cliquez sur **"Create"**

4. **Remplissez les informations** :

   **Page 1 - OAuth consent screen :**
   - **App name** : `Targetym`
   - **User support email** : Votre email
   - **App logo** : (optionnel - vous pouvez skip)
   - **Application home page** : `https://targetym-production.onrender.com`
   - **Application privacy policy** : `https://targetym-production.onrender.com/privacy` (créez cette page plus tard)
   - **Application terms of service** : `https://targetym-production.onrender.com/terms` (créez cette page plus tard)
   - **Authorized domains** :
     - `onrender.com`
     - `supabase.co`
   - **Developer contact email** : Votre email

5. Cliquez sur **"Save and Continue"**

   **Page 2 - Scopes :**
   - Cliquez sur **"Add or Remove Scopes"**
   - Sélectionnez les scopes suivants :
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Cliquez sur **"Update"** puis **"Save and Continue"**

   **Page 3 - Test users :**
   - Ajoutez votre email comme utilisateur test si vous êtes en mode "External Testing"
   - Cliquez sur **"Save and Continue"**

6. Cliquez sur **"Back to Dashboard"**

### Étape 1.3 : Créer les Credentials OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ Create Credentials"** → **"OAuth client ID"**
3. Configurez :
   - **Application type** : `Web application`
   - **Name** : `Targetym Web Client`

4. **Authorized JavaScript origins** (ajoutez les 3) :
   ```
   https://targetym-production.onrender.com
   https://juuekovwshynwgjkqkbu.supabase.co
   http://localhost:3001
   ```

5. **Authorized redirect URIs** (ajoutez les 2) :
   ```
   https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```

6. Cliquez sur **"Create"**

7. **🎉 Copiez vos credentials** (vous en aurez besoin) :
   - ✅ **Client ID** : `xxxxxx.apps.googleusercontent.com`
   - ✅ **Client secret** : `GOCSPX-xxxxxx`

### Étape 1.4 : Ajouter les Credentials dans Supabase

1. **Allez sur** : https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers
2. Trouvez **"Google"** dans la liste des providers
3. Cliquez sur le chevron **">"** pour développer
4. Activez **"Enable Sign in with Google"**
5. Remplissez :
   - **Client ID (for OAuth)** : Collez votre Client ID Google
   - **Client Secret (for OAuth)** : Collez votre Client Secret Google
6. Cliquez sur **"Save"**

### ✅ Google OAuth configuré !

---

## 🔵 PARTIE 2 : GitHub OAuth Configuration

### Étape 2.1 : Créer une OAuth App sur GitHub

1. **Allez sur** : https://github.com/settings/developers
2. Connectez-vous avec votre compte GitHub
3. Dans le menu de gauche, cliquez sur **"OAuth Apps"**
4. Cliquez sur **"New OAuth App"** (ou **"Register a new application"**)

### Étape 2.2 : Remplir les Informations de l'Application

1. **Application name** : `Targetym`
2. **Homepage URL** : `https://targetym-production.onrender.com`
3. **Application description** : `AI-powered HR management platform`
4. **Authorization callback URL** :
   ```
   https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
   ```
5. Laissez **"Enable Device Flow"** décoché
6. Cliquez sur **"Register application"**

### Étape 2.3 : Générer un Client Secret

1. Après la création, vous verrez votre **Client ID**
2. Cliquez sur **"Generate a new client secret"**
3. Confirmez votre mot de passe GitHub si demandé
4. **🎉 Copiez immédiatement vos credentials** (le secret ne sera affiché qu'une fois) :
   - ✅ **Client ID** : `Iv1.xxxxxxxxxxxxxxxx`
   - ✅ **Client Secret** : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Important** : Sauvegardez le Client Secret dans un endroit sûr, vous ne pourrez plus le revoir !

### Étape 2.4 : Ajouter les Credentials dans Supabase

1. **Allez sur** : https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers
2. Trouvez **"GitHub"** dans la liste des providers
3. Cliquez sur le chevron **">"** pour développer
4. Activez **"Enable Sign in with GitHub"**
5. Remplissez :
   - **Client ID (for OAuth)** : Collez votre Client ID GitHub
   - **Client Secret (for OAuth)** : Collez votre Client Secret GitHub
6. Cliquez sur **"Save"**

### ✅ GitHub OAuth configuré !

---

## 🧪 PARTIE 3 : Tester l'Authentification OAuth

### Étape 3.1 : Redéployer l'Application

1. Allez dans **Render Dashboard** : https://dashboard.render.com/
2. Sélectionnez votre service **targetym-production**
3. Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**
4. Attendez que le déploiement se termine (~2-3 minutes)

### Étape 3.2 : Tester Google OAuth

1. Allez sur : https://targetym-production.onrender.com/auth/signin
2. Cliquez sur **"Continuer avec Google"**
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. Vous devriez être redirigé vers le dashboard ✅

### Étape 3.3 : Tester GitHub OAuth

1. Allez sur : https://targetym-production.onrender.com/auth/signin
2. Cliquez sur **"Continuer avec GitHub"**
3. Autorisez l'application
4. Vous devriez être redirigé vers le dashboard ✅

---

## ⚠️ Troubleshooting

### Problème : "Redirect URI mismatch"

**Solution** :
- Vérifiez que les URLs de redirection sont exactement :
  - Google : `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`
  - GitHub : `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`

### Problème : "Access blocked: This app's request is invalid"

**Solution** :
- Allez dans Google Cloud Console → OAuth consent screen
- Vérifiez que `onrender.com` et `supabase.co` sont dans les "Authorized domains"

### Problème : L'utilisateur se connecte mais n'a pas d'organisation

**Solution** :
- Après la première connexion OAuth, vous devez créer une organisation et un profil
- Utilisez le script SQL fourni dans `scripts/create-test-organization.sql`

### Problème : "Application not verified"

**Solution** :
- C'est normal en mode Test
- Cliquez sur **"Advanced"** → **"Go to Targetym (unsafe)"**
- Pour la production, soumettez votre app pour vérification Google

---

## 📝 Checklist Finale

- [ ] Projet Google Cloud créé
- [ ] OAuth consent screen configuré
- [ ] Google credentials créés et ajoutés dans Supabase
- [ ] GitHub OAuth App créée
- [ ] GitHub credentials ajoutés dans Supabase
- [ ] Application redéployée sur Render
- [ ] Test de connexion Google réussi
- [ ] Test de connexion GitHub réussi
- [ ] Profil utilisateur créé avec organisation

---

## 🔒 Sécurité : Bonnes Pratiques

1. **Ne partagez JAMAIS vos Client Secrets** publiquement
2. **Ajoutez vos secrets dans un gestionnaire** comme 1Password ou LastPass
3. **Rotez vos secrets** tous les 6 mois minimum
4. **Limitez les scopes** au strict nécessaire (email et profile seulement)
5. **Activez 2FA** sur vos comptes Google et GitHub

---

## 📚 Ressources Utiles

- 📖 [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- 🔐 [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- 🐙 [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- 🎨 [OAuth Consent Screen Best Practices](https://support.google.com/cloud/answer/10311615)

---

## ✅ Configuration Complète !

Votre application Targetym supporte maintenant :
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth

**Prochaines étapes suggérées** :
1. Configurer Microsoft OAuth (optionnel)
2. Mettre en place la vérification d'email
3. Créer les pages Privacy Policy et Terms of Service
4. Soumettre votre app pour vérification Google (pour passer en production)
