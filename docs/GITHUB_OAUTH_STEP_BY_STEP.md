# 🔵 GitHub OAuth - Guide Pas à Pas avec Captures d'Écran

## ⏱️ Temps estimé : 5-8 minutes

---

## 📍 ÉTAPE 1 : Accéder à GitHub Developer Settings

### 1.1 Ouvrir GitHub Developer Settings

🔗 **Lien direct** : https://github.com/settings/developers

```
✅ Connectez-vous avec votre compte GitHub
✅ Vous devriez voir "Developer settings" dans le menu de gauche
```

---

## 📍 ÉTAPE 2 : Créer une OAuth App

### 2.1 Accéder à OAuth Apps

1. Dans le menu de gauche, cliquez sur **"OAuth Apps"**
2. Vous verrez la liste de vos OAuth Apps (vide si c'est votre première)

### 2.2 Créer une Nouvelle App

✅ Cliquez sur **"New OAuth App"** (bouton vert en haut à droite)

**OU**

✅ Cliquez sur **"Register a new application"** si vous n'avez pas encore d'apps

---

## 📍 ÉTAPE 3 : Remplir les Informations de l'Application

### 3.1 Formulaire de Création

**Remplissez EXACTEMENT comme suit :**

```yaml
# ═══════════════════════════════════════════════
# Application name*
# ═══════════════════════════════════════════════
Targetym

# ═══════════════════════════════════════════════
# Homepage URL*
# ═══════════════════════════════════════════════
https://targetym-production.onrender.com

# ═══════════════════════════════════════════════
# Application description (optionnel)
# ═══════════════════════════════════════════════
AI-powered HR management platform for goals, recruitment, and performance

# ═══════════════════════════════════════════════
# Authorization callback URL*
# ═══════════════════════════════════════════════
https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback

# ⚠️ IMPORTANT: Vérifiez bien '/auth/v1/callback'
```

### 3.2 Options Supplémentaires

```yaml
# ═══════════════════════════════════════════════
# Enable Device Flow
# ═══════════════════════════════════════════════
☐ Laissez DÉCOCHÉ
```

### 3.3 Créer l'Application

✅ Cliquez sur **"Register application"** (bouton vert en bas)

---

## 📍 ÉTAPE 4 : Générer un Client Secret

### 4.1 Copier le Client ID

**Après la création, vous voyez la page de votre app :**

```yaml
Client ID: Iv1.xxxxxxxxxxxxxxxx
```

🔴 **COPIEZ LE CLIENT ID MAINTENANT**

Créez un fichier texte temporaire :
```bash
GitHub Client ID: [COLLEZ ICI]
```

### 4.2 Générer le Client Secret

1. Descendez un peu sur la page
2. Trouvez la section **"Client secrets"**
3. ✅ Cliquez sur **"Generate a new client secret"**

### 4.3 Confirmer votre Identité

⚠️ GitHub peut demander votre mot de passe ou 2FA

1. Entrez votre mot de passe GitHub
2. **OU** entrez votre code 2FA si activé
3. Cliquez sur **"Confirm"**

### 4.4 Copier le Client Secret

**Le secret apparaît (une seule fois !) :**

```yaml
Client secret: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

🔴 **COPIEZ LE SECRET IMMÉDIATEMENT !**

```bash
GitHub Client Secret: [COLLEZ ICI]
```

⚠️ **CRITIQUE : Ce secret ne sera JAMAIS affiché à nouveau !**

Si vous le perdez, vous devrez générer un nouveau secret.

---

## 📍 ÉTAPE 5 : Ajouter les Credentials dans Supabase

### 5.1 Ouvrir Supabase Auth Providers

🔗 **Lien direct** : https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/auth/providers

### 5.2 Configurer GitHub Provider

1. Scrollez pour trouver **"GitHub"** dans la liste
2. Cliquez sur le **chevron ">"** pour développer
3. Activez le toggle **"Enable Sign in with GitHub"** (devient vert)

### 5.3 Remplir les Credentials

```yaml
Client ID (for OAuth)*:
  [COLLEZ VOTRE GITHUB CLIENT ID]
  # Format: Iv1.xxxxxxxxxxxxxxxx

Client Secret (for OAuth)*:
  [COLLEZ VOTRE GITHUB CLIENT SECRET]
  # Format: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Redirect URL:
  https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
  ⚠️ Cette valeur est pré-remplie, ne la modifiez PAS
```

### 5.4 Sauvegarder

✅ Cliquez sur **"Save"** en bas de la section GitHub

🎉 **GitHub OAuth est maintenant configuré !**

---

## 🧪 ÉTAPE 6 : Tester GitHub OAuth

### 6.1 Vérifier la Configuration

Dans votre terminal, lancez :

```bash
node scripts/check-oauth-config.js
```

Vous devriez maintenant voir :
```
✅ Google OAuth : CONFIGURÉ
✅ GitHub OAuth : CONFIGURÉ

📊 Total : 2 provider(s) configuré(s)

✅ Configuration OAuth complète !
```

### 6.2 Tester sur l'Application

1. Allez sur : https://targetym-production.onrender.com/auth/signin
2. Cliquez sur **"Continuer avec GitHub"**
3. Autorisez l'application (première fois uniquement)
4. ✅ Vous devriez être redirigé vers le dashboard !

---

## ⚠️ Troubleshooting

### Erreur : "The redirect_uri MUST match the registered callback URL"

**Cause** : L'URL de callback n'est pas exactement la même

**Solution** :
1. Retournez dans GitHub → Settings → Developer settings → OAuth Apps
2. Cliquez sur votre app "Targetym"
3. Vérifiez que "Authorization callback URL" est **EXACTEMENT** :
   ```
   https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback
   ```
4. Cliquez sur **"Update application"**
5. Réessayez

### Erreur : "Bad credentials"

**Cause** : Client ID ou Client Secret incorrect

**Solution** :
1. Vérifiez que vous avez bien copié le Client ID et Secret
2. Dans Supabase, re-vérifiez les credentials
3. Si vous avez perdu le secret, générez-en un nouveau :
   - GitHub → OAuth Apps → Targetym
   - "Generate a new client secret"
   - Mettez à jour dans Supabase

### L'utilisateur se connecte mais n'a pas d'organisation

**Cause** : Normal - première connexion OAuth

**Solution** :
1. Récupérez votre User ID dans Supabase Dashboard → Authentication → Users
2. Utilisez le script SQL `scripts/create-test-organization.sql`
3. Remplacez 'VOTRE-USER-ID' par votre vrai ID
4. Exécutez dans Supabase SQL Editor

---

## 🔒 Sécurité : Bonnes Pratiques

### Protéger vos Secrets

```bash
# ❌ JAMAIS faire :
git add .env
git commit -m "add secrets"  # DANGER !

# ✅ TOUJOURS :
# 1. Ajoutez .env* dans .gitignore (déjà fait)
# 2. Stockez les secrets dans un gestionnaire
# 3. Utilisez des variables d'environnement en production
```

### Limiter les Scopes

GitHub OAuth demande par défaut :
- ✅ `user:email` (email de l'utilisateur)
- ✅ `read:user` (infos publiques du profil)

**C'est suffisant pour l'authentification !**

Ne demandez PAS de scopes supplémentaires sauf si nécessaire.

### Régénérer les Secrets Régulièrement

**Bonne pratique** :
1. Tous les 6 mois, générez un nouveau Client Secret
2. Mettez à jour dans Supabase
3. Supprimez l'ancien secret dans GitHub

---

## 📋 Checklist Finale GitHub OAuth

- [ ] Compte GitHub créé et 2FA activé (recommandé)
- [ ] OAuth App créée avec le bon nom
- [ ] Homepage URL correct
- [ ] Callback URL **EXACTEMENT** : `https://juuekovwshynwgjkqkbu.supabase.co/auth/v1/callback`
- [ ] Client ID copié et sauvegardé
- [ ] Client Secret généré, copié et sauvegardé
- [ ] Credentials ajoutés dans Supabase
- [ ] Provider "GitHub" activé dans Supabase
- [ ] Sauvegarde faite
- [ ] Test de connexion réussi
- [ ] Script `check-oauth-config.js` confirme la configuration

---

## ✅ Configuration Complète !

GitHub OAuth est maintenant opérationnel ! 🎉

**Vous pouvez maintenant :**
- ✅ Vous connecter avec Google
- ✅ Vous connecter avec GitHub
- ✅ Vous connecter avec Email/Password

**Prochaines étapes :**
1. Redéployer l'application sur Render
2. Créer votre organisation de test
3. Tester toutes les fonctionnalités
