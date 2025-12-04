# 🚀 OAuth Quick Start - Configuration Rapide

## ⏱️ Temps total : 15-20 minutes

---

## 🎯 Option 1 : Assistant Interactif (Recommandé)

**La façon la plus simple de configurer OAuth !**

```bash
npm run oauth:setup
```

L'assistant interactif vous guidera étape par étape à travers le processus de configuration. Il vérifiera automatiquement votre configuration et vous aidera à sauvegarder vos credentials de manière sécurisée.

**OU**

## 📋 Option 2 : Configuration Manuelle

Ce guide vous permet de configurer manuellement Google OAuth et GitHub OAuth pour votre application Targetym.

### Ce dont vous avez besoin :

- ✅ Un compte Google
- ✅ Un compte GitHub
- ✅ Accès à Supabase Dashboard
- ✅ Accès à Render Dashboard
- ⏱️ 15-20 minutes de votre temps

---

## 🎯 Checklist Globale

### Préparation (5 min)
- [ ] Lire ce guide en entier
- [ ] Préparer un fichier texte pour sauvegarder les credentials
- [ ] Avoir 3 onglets ouverts :
  - Google Cloud Console
  - GitHub Settings
  - Supabase Dashboard

### Google OAuth (10 min)
- [ ] Créer un projet Google Cloud
- [ ] Configurer OAuth consent screen
- [ ] Créer OAuth client ID
- [ ] Copier Client ID et Secret
- [ ] Ajouter dans Supabase
- [ ] Tester la connexion

### GitHub OAuth (5 min)
- [ ] Créer une OAuth App GitHub
- [ ] Générer Client Secret
- [ ] Copier Client ID et Secret
- [ ] Ajouter dans Supabase
- [ ] Tester la connexion

### Finalisation (5 min)
- [ ] Vérifier avec `check-oauth-config.js`
- [ ] Ajouter credentials dans Render
- [ ] Redéployer l'application
- [ ] Tester end-to-end

---

## 🔴 GOOGLE OAUTH - 10 Minutes

### URLs Important à Avoir Sous la Main

```
Google Cloud Console:
https://console.cloud.google.com/

OAuth Consent Screen:
https://console.cloud.google.com/apis/credentials/consent

Credentials:
https://console.cloud.google.com/apis/credentials

Supabase Auth Providers:
https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers
```

### Configuration Express

**1. Créer un projet Google Cloud** (2 min)
- Nom : `Targetym`
- Cliquez "Create"

**2. OAuth consent screen** (4 min)
- Type : External
- App name : `Targetym`
- Support email : votre email
- Authorized domains : `onrender.com`, `supabase.co`
- Scopes : `userinfo.email`, `userinfo.profile`, `openid`
- Save

**3. Create Credentials** (2 min)
- Type : OAuth client ID → Web application
- Name : `Targetym Web Client`
- Authorized origins :
  - `https://targetym-production.onrender.com`
  - `https://juuekovwshynwgjkqkbu.supabase.co`
- Redirect URIs :
  - `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`
- Create

**4. Copier les credentials** (1 min)
```
Client ID: xxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxx
```

**5. Ajouter dans Supabase** (1 min)
- Providers → Google → Enable
- Paste Client ID et Secret
- Save

✅ **Google OAuth configuré !**

📚 **Guide détaillé** : [GOOGLE_OAUTH_STEP_BY_STEP.md](./GOOGLE_OAUTH_STEP_BY_STEP.md)

---

## 🔵 GITHUB OAUTH - 5 Minutes

### URLs Important à Avoir Sous la Main

```
GitHub Developer Settings:
https://github.com/settings/developers

Supabase Auth Providers:
https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers
```

### Configuration Express

**1. Créer une OAuth App** (2 min)
- New OAuth App
- Name : `Targetym`
- Homepage : `https://targetym-production.onrender.com`
- Callback : `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`
- Register application

**2. Générer Client Secret** (1 min)
- Generate a new client secret
- Copier immédiatement (ne sera plus affiché !)

**3. Copier les credentials** (1 min)
```
Client ID: Iv1.xxxxxxxxxxxxxxxx
Client Secret: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**4. Ajouter dans Supabase** (1 min)
- Providers → GitHub → Enable
- Paste Client ID et Secret
- Save

✅ **GitHub OAuth configuré !**

📚 **Guide détaillé** : [GITHUB_OAUTH_STEP_BY_STEP.md](./GITHUB_OAUTH_STEP_BY_STEP.md)

---

## ✅ Vérification et Tests

### Vérifier la Configuration

```bash
# Depuis la racine du projet
node scripts/check-oauth-config.js
```

**Résultat attendu :**
```
✅ Google OAuth : CONFIGURÉ
✅ GitHub OAuth : CONFIGURÉ

📊 Total : 2 provider(s) configuré(s)
```

### Ajouter dans Render (IMPORTANT !)

Les credentials OAuth doivent être ajoutés dans Render :

1. **Dashboard Render** : https://dashboard.render.com/
2. Service → `targetym-production`
3. Environment → Add Environment Variable

```bash
# NE PAS ajouter Google/GitHub credentials dans Render !
# Ils sont uniquement dans Supabase Dashboard

# Vérifiez que ces variables existent déjà :
NEXT_PUBLIC_SUPABASE_URL=https://juuekovwshynwgjkqkbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

⚠️ **Important** : Les credentials OAuth sont stockés **uniquement dans Supabase**, pas dans Render !

### Redéployer l'Application

1. Render Dashboard → targetym-production
2. Manual Deploy → "Deploy latest commit"
3. ⏳ Attendre 2-3 minutes

### Tester End-to-End

**Test 1 : Google OAuth**
1. https://targetym-production.onrender.com/auth/signin
2. Cliquer "Continuer avec Google"
3. Sélectionner compte Google
4. Autoriser
5. ✅ Redirection vers dashboard

**Test 2 : GitHub OAuth**
1. https://targetym-production.onrender.com/auth/signin
2. Cliquer "Continuer avec GitHub"
3. Autoriser (première fois)
4. ✅ Redirection vers dashboard

---

## 🎉 Configuration Terminée !

Votre application supporte maintenant :
- ✅ Email/Password
- ✅ Google OAuth
- ✅ GitHub OAuth

### Prochaines Étapes Recommandées

**1. Créer votre organisation** (requis)
- Script : `scripts/create-test-organization.sql`
- Récupérez votre User ID dans Supabase → Authentication → Users
- Exécutez le script dans SQL Editor

**2. Configurer Microsoft OAuth** (optionnel)
- Suivre : docs/MICROSOFT_OAUTH_STEP_BY_STEP.md (à créer si besoin)

**3. Activer Email Verification** (recommandé pour production)
- Supabase → Authentication → Providers → Email
- Enable "Confirm email"
- Configurer le template d'email

**4. Personnaliser les Pages Privacy et Terms** (requis par Google)
- Créer `/app/privacy/page.tsx`
- Créer `/app/terms/page.tsx`

**5. Soumettre pour Vérification Google** (production)
- Google Cloud Console → OAuth consent screen
- Publish App → Submit for verification

---

## 🆘 Besoin d'Aide ?

### Guides Détaillés
- 📖 [Google OAuth Step by Step](./GOOGLE_OAUTH_STEP_BY_STEP.md)
- 📖 [GitHub OAuth Step by Step](./GITHUB_OAUTH_STEP_BY_STEP.md)
- 📖 [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)

### Scripts Utiles
```bash
# Vérifier configuration OAuth
node scripts/check-oauth-config.js

# Tester connexion Supabase
node scripts/test-supabase-connection.js
```

### Ressources
- 🔐 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- 📚 [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- 🐙 [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Félicitations ! Votre système d'authentification OAuth est opérationnel ! 🎉**
