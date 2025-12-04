# 🔴 Google OAuth - Guide Pas à Pas avec Captures d'Écran

## ⏱️ Temps estimé : 10-15 minutes

---

## 📍 ÉTAPE 1 : Accéder à Google Cloud Console

### 1.1 Ouvrir Google Cloud Console

🔗 **Lien direct** : https://console.cloud.google.com/

```
✅ Connectez-vous avec votre compte Google
✅ Acceptez les conditions si demandé
```

### 1.2 Créer ou Sélectionner un Projet

**Option A : Si vous avez déjà un projet**
- Cliquez sur le nom du projet en haut
- Sélectionnez votre projet existant

**Option B : Créer un nouveau projet** (recommandé)

1. Cliquez sur **"Select a project"** en haut à gauche
2. Cliquez sur **"NEW PROJECT"** en haut à droite
3. Remplissez :

```yaml
Project name: Targetym
Organization: (laisser par défaut)
Location: (laisser par défaut)
```

4. Cliquez sur **"CREATE"**
5. ⏳ Attendez 10-20 secondes que le projet soit créé
6. ✅ Vous verrez une notification "Project created"

---

## 📍 ÉTAPE 2 : Configurer l'Écran de Consentement OAuth

### 2.1 Accéder à OAuth Consent Screen

1. Dans le menu hamburger (☰) en haut à gauche
2. **APIs & Services** → **OAuth consent screen**

🔗 **Lien direct** : https://console.cloud.google.com/apis/credentials/consent

### 2.2 Choisir le Type d'Utilisateur

**Question : "Which user type do you want to configure?"**

```
⚪ Internal (pour Google Workspace uniquement)
✅ External (pour TOUS les utilisateurs Google) ← CHOISIR CELLE-CI
```

✅ Cliquez sur **"CREATE"**

### 2.3 Page 1/4 : OAuth consent screen

**Remplissez le formulaire** :

```yaml
# ═══════════════════════════════════════════════
# App information
# ═══════════════════════════════════════════════
App name*: Targetym
User support email*: votre-email@example.com

# ═══════════════════════════════════════════════
# App logo (OPTIONNEL)
# ═══════════════════════════════════════════════
App logo: [Skip pour l'instant]

# ═══════════════════════════════════════════════
# App domain
# ═══════════════════════════════════════════════
Application home page: https://targetym-production.onrender.com
Application privacy policy link: https://targetym-production.onrender.com/privacy
Application terms of service link: https://targetym-production.onrender.com/terms

# ═══════════════════════════════════════════════
# Authorized domains
# ═══════════════════════════════════════════════
[Cliquez sur "ADD DOMAIN"]
Domain 1: onrender.com
[Cliquez sur "ADD DOMAIN" encore]
Domain 2: supabase.co

# ═══════════════════════════════════════════════
# Developer contact information
# ═══════════════════════════════════════════════
Email addresses*: votre-email@example.com
```

✅ Cliquez sur **"SAVE AND CONTINUE"**

### 2.4 Page 2/4 : Scopes

1. Cliquez sur **"ADD OR REMOVE SCOPES"**
2. Dans la fenêtre popup, cochez :

```
✅ .../auth/userinfo.email
✅ .../auth/userinfo.profile
✅ openid
```

**Comment les trouver rapidement ?**
- Utilisez Ctrl+F pour chercher "userinfo.email"
- Cochez les 3 scopes ci-dessus
- Les autres scopes sont déjà inclus par défaut

3. Cliquez sur **"UPDATE"** en bas de la popup
4. Vérifiez que vous voyez 3 scopes sélectionnés
5. ✅ Cliquez sur **"SAVE AND CONTINUE"**

### 2.5 Page 3/4 : Test users (IMPORTANT en mode External)

**Si vous êtes en mode "External - Testing" :**

1. Cliquez sur **"+ ADD USERS"**
2. Ajoutez votre email de test :

```
Email: votre-email@gmail.com
```

3. Cliquez sur **"ADD"**
4. ✅ Vous devriez voir votre email dans la liste

⚠️ **Important** : En mode Testing, seuls ces emails pourront se connecter !

✅ Cliquez sur **"SAVE AND CONTINUE"**

### 2.6 Page 4/4 : Summary

- Vérifiez que tout est correct
- ✅ Cliquez sur **"BACK TO DASHBOARD"**

---

## 📍 ÉTAPE 3 : Créer les Credentials OAuth

### 3.1 Accéder à Credentials

1. Dans le menu **APIs & Services** → **Credentials**

🔗 **Lien direct** : https://console.cloud.google.com/apis/credentials

### 3.2 Créer un OAuth Client ID

1. Cliquez sur **"+ CREATE CREDENTIALS"** en haut
2. Sélectionnez **"OAuth client ID"**

### 3.3 Configurer le Client

**Application type :**
```
✅ Web application
```

**Name :**
```
Targetym Web Client
```

### 3.4 Authorized JavaScript origins

Cliquez sur **"+ ADD URI"** 3 fois et ajoutez :

```
URI 1: https://targetym-production.onrender.com
URI 2: https://juuekovwshynwgjkqkbu.supabase.co
URI 3: http://localhost:3001
```

### 3.5 Authorized redirect URIs

Cliquez sur **"+ ADD URI"** 2 fois et ajoutez **EXACTEMENT** :

```
URI 1: https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
URI 2: http://localhost:54321/auth/v1/callback
```

⚠️ **CRITIQUE : Vérifiez bien `/auth/v1/callback` (pas `/auth/callback`) !**

### 3.6 Créer

✅ Cliquez sur **"CREATE"**

### 3.7 Copier vos Credentials

**Une popup apparaît avec vos credentials :**

```yaml
Your Client ID: xxxxxxxxxxxxxx.apps.googleusercontent.com
Your Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

🔴 **IMPORTANT : Copiez-les MAINTENANT dans un fichier texte !**

```bash
# Créez un fichier temporaire pour sauvegarder
Google Client ID: [COLLEZ ICI]
Google Client Secret: [COLLEZ ICI]
```

✅ Cliquez sur **"OK"**

---

## 📍 ÉTAPE 4 : Ajouter les Credentials dans Supabase

### 4.1 Ouvrir Supabase Auth Providers

🔗 **Lien direct** : https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers

### 4.2 Configurer Google Provider

1. Trouvez **"Google"** dans la liste
2. Cliquez sur le **chevron ">"** pour développer
3. Activez le toggle **"Enable Sign in with Google"** (devient vert)

### 4.3 Remplir les Credentials

```yaml
Client ID (for OAuth)*:
  [COLLEZ VOTRE GOOGLE CLIENT ID]

Client Secret (for OAuth)*:
  [COLLEZ VOTRE GOOGLE CLIENT SECRET]

Skip nonce checks:
  ☐ Laissez décoché

Redirect URL:
  https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
  ⚠️ Cette valeur est pré-remplie, ne la modifiez PAS
```

### 4.4 Sauvegarder

✅ Cliquez sur **"Save"** en bas de la section Google

🎉 **Google OAuth est maintenant configuré !**

---

## 🧪 ÉTAPE 5 : Tester Google OAuth

### 5.1 Vérifier la Configuration

Retournez dans votre terminal et lancez :

```bash
node scripts/check-oauth-config.js
```

Vous devriez voir :
```
✅ Google OAuth : CONFIGURÉ
```

### 5.2 Tester sur l'Application

1. Allez sur : https://targetym-production.onrender.com/auth/signin
2. Cliquez sur **"Continuer avec Google"**
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. ✅ Vous devriez être redirigé vers le dashboard !

---

## ⚠️ Troubleshooting

### Erreur : "Redirect URI mismatch"

**Cause** : L'URL de callback n'est pas correcte

**Solution** :
1. Retournez dans Google Cloud Console → Credentials
2. Cliquez sur votre OAuth client
3. Vérifiez que vous avez **EXACTEMENT** :
   ```
   https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
   ```
4. Sauvegardez et réessayez

### Erreur : "Access blocked: This app's request is invalid"

**Cause** : Les domaines autorisés sont manquants

**Solution** :
1. Retournez dans OAuth consent screen
2. Dans "Authorized domains", ajoutez :
   - `onrender.com`
   - `supabase.co`
3. Sauvegardez et réessayez

### Erreur : "This app isn't verified"

**Cause** : Normal en mode Testing

**Solution** :
1. Cliquez sur **"Advanced"** en bas
2. Cliquez sur **"Go to Targetym (unsafe)"**
3. Autorisez l'application

---

## ✅ Configuration Complète !

Google OAuth est maintenant opérationnel ! 🎉

**Prochaines étapes :**
1. ➡️ Configurer GitHub OAuth
2. Tester l'authentification complète
3. Créer votre organisation
