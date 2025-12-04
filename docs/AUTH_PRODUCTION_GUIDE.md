# Guide de Configuration et Mise en Production - Authentification Supabase

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour configurer et déployer l'authentification Supabase en production.

## 🎯 Prérequis

- Compte Supabase avec un projet créé
- Variables d'environnement configurées
- Supabase CLI installé (`npx supabase`)

## 📝 Étape 1 : Vérification de la Configuration de Base

### 1.1 Variables d'Environnement

Vérifiez que votre `.env.local` contient :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Local
# NEXT_PUBLIC_APP_URL=https://votre-domaine.com  # Production
```

### 1.2 Structure des Fichiers d'Auth

```
src/lib/supabase/
├── server.ts        # Client server-side avec cookies
├── client.ts        # Client browser-side
├── auth.ts          # Helpers d'authentification
└── middleware.ts    # Utilitaire middleware

middleware.ts        # Middleware Next.js (racine)

app/auth/
├── signin/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── callback/route.ts  # Route callback OAuth
```

## 🔐 Étape 2 : Configuration OAuth (Optionnel)

### 2.1 Google OAuth

**A. Créer les credentials Google**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez-en un
3. Créez des identifiants OAuth 2.0
4. Ajoutez les URIs de redirection :
   ```
   Local : http://localhost:3001/auth/callback
   Production : https://votre-domaine.com/auth/callback
   ```

**B. Configurer dans Supabase Dashboard**

1. Allez dans `Authentication` → `Providers`
2. Activez `Google`
3. Entrez :
   - Client ID : `votre-google-client-id`
   - Client Secret : `votre-google-client-secret`
4. Cliquez sur `Save`

**C. Ajouter à `.env.local`**

```bash
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
```

### 2.2 GitHub OAuth

**A. Créer une OAuth App sur GitHub**

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur `New OAuth App`
3. Remplissez :
   - Application name : `Targetym`
   - Homepage URL : `http://localhost:3001` (local) ou `https://votre-domaine.com` (prod)
   - Authorization callback URL :
     ```
     Local : http://localhost:3001/auth/callback
     Production : https://votre-domaine.com/auth/callback
     ```
4. Notez le `Client ID` et générez un `Client Secret`

**B. Configurer dans Supabase Dashboard**

1. Allez dans `Authentication` → `Providers`
2. Activez `GitHub`
3. Entrez :
   - Client ID : `votre-github-client-id`
   - Client Secret : `votre-github-client-secret`
4. Cliquez sur `Save`

**C. Ajouter à `.env.local`**

```bash
GITHUB_CLIENT_ID=votre-github-client-id
GITHUB_CLIENT_SECRET=votre-github-client-secret
```

### 2.3 Microsoft/Azure OAuth (Optionnel)

**A. Créer une application Azure AD**

1. Allez sur [Azure Portal](https://portal.azure.com/)
2. Recherchez `Azure Active Directory` → `App registrations`
3. Cliquez sur `New registration`
4. Remplissez :
   - Name : `Targetym`
   - Redirect URI : `Web` → `http://localhost:3001/auth/callback` (local)
5. Notez l'`Application (client) ID`
6. Allez dans `Certificates & secrets` → `New client secret`
7. Notez le secret value

**B. Configurer dans Supabase Dashboard**

1. Allez dans `Authentication` → `Providers`
2. Activez `Azure`
3. Entrez les credentials Azure
4. Cliquez sur `Save`

**C. Ajouter à `.env.local`**

```bash
MICROSOFT_CLIENT_ID=votre-azure-client-id
MICROSOFT_CLIENT_SECRET=votre-azure-client-secret
```

## 🗄️ Étape 3 : Configuration de la Base de Données

### 3.1 Vérifier les Politiques RLS

Assurez-vous que les politiques RLS sont en place pour la table `profiles` :

```sql
-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Politique : Les profils sont créés automatiquement lors de l'inscription
CREATE POLICY "Profiles are created on signup"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### 3.2 Vérifier le Trigger de Création de Profil

Assurez-vous qu'un trigger crée automatiquement un profil lors de l'inscription :

```sql
-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.3 Appliquer les Migrations

```bash
# En local
npm run supabase:reset

# Générer les types TypeScript
npm run supabase:types

# Pousser vers production
npm run supabase:push
```

## 🧪 Étape 4 : Tests en Local

### 4.1 Démarrer Supabase Local

```bash
npm run supabase:start
```

**URLs locales :**
- Studio UI : http://localhost:54323
- API : http://localhost:54321
- Database : postgresql://postgres:postgres@localhost:54322/postgres

### 4.2 Tester l'Authentification Email/Password

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Allez sur : http://localhost:3001/auth/signup

3. Créez un compte test :
   - Email : `test@example.com`
   - Password : `Test123!@#`

4. Vérifiez dans Supabase Studio :
   - Allez sur http://localhost:54323
   - `Authentication` → `Users`
   - Vérifiez que l'utilisateur est créé

5. Testez la connexion :
   - Allez sur http://localhost:3001/auth/signin
   - Connectez-vous avec les credentials de test

6. Vérifiez la redirection vers `/dashboard`

### 4.3 Tester l'Authentification OAuth (si configuré)

1. Sur la page `/auth/signin`, cliquez sur "Sign in with Google" (ou GitHub)

2. Autorisez l'application OAuth

3. Vérifiez la redirection vers `/auth/callback` puis `/dashboard`

4. Dans Supabase Studio, vérifiez :
   - L'utilisateur OAuth est créé dans `Authentication` → `Users`
   - Un profil est créé dans la table `profiles`

### 4.4 Tester la Réinitialisation de Mot de Passe

1. Allez sur http://localhost:3001/auth/forgot-password

2. Entrez votre email de test

3. Vérifiez les logs Supabase dans le terminal (le lien de reset apparaît)

4. Cliquez sur le lien de reset

5. Définissez un nouveau mot de passe sur `/auth/reset-password`

## 🚀 Étape 5 : Mise en Production

### 5.1 Configuration des Variables d'Environnement

**A. Sur votre plateforme de déploiement (Vercel, Netlify, etc.)**

Ajoutez ces variables :

```bash
# Application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# OAuth (si configuré)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
GITHUB_CLIENT_ID=votre-github-client-id
GITHUB_CLIENT_SECRET=votre-github-client-secret
```

### 5.2 Configurer les URLs de Redirection OAuth

**A. Dans Supabase Dashboard**

1. Allez dans `Authentication` → `URL Configuration`

2. Ajoutez les URLs :
   ```
   Site URL : https://votre-domaine.com
   Redirect URLs :
   - https://votre-domaine.com/auth/callback
   - https://votre-domaine.com/auth/reset-password
   ```

**B. Dans Google Cloud Console**

1. Allez dans vos credentials OAuth 2.0
2. Ajoutez l'URI de redirection :
   ```
   https://votre-domaine.com/auth/callback
   ```

**C. Dans GitHub OAuth App**

1. Allez dans votre OAuth App settings
2. Mettez à jour :
   - Homepage URL : `https://votre-domaine.com`
   - Authorization callback URL : `https://votre-domaine.com/auth/callback`

### 5.3 Configurer les Emails (Production)

**A. Dans Supabase Dashboard**

1. Allez dans `Authentication` → `Email Templates`

2. Configurez les templates :
   - **Confirmation d'inscription** : Personnalisez le message
   - **Réinitialisation de mot de passe** : Personnalisez le lien de reset
   - **Magic Link** : Si vous utilisez la connexion par lien magique

3. Personnalisez le sender :
   - Allez dans `Settings` → `Auth`
   - Configurez un domaine email personnalisé (optionnel)

**B. SMTP Personnalisé (Optionnel)**

Pour utiliser votre propre serveur SMTP :

1. Dans `Settings` → `Auth` → `SMTP Settings`
2. Entrez vos credentials SMTP
3. Testez l'envoi d'email

### 5.4 Déployer les Migrations

```bash
# Lier votre projet local à la production
supabase link --project-ref votre-project-ref

# Pousser les migrations vers production
npm run supabase:push

# Vérifier le statut
supabase status
```

### 5.5 Build et Déploiement

```bash
# Vérifier les types
npm run type-check

# Build de production
npm run build

# Déployer (selon votre plateforme)
# Vercel : vercel --prod
# Netlify : netlify deploy --prod
# Ou via git push si auto-deploy configuré
```

## ✅ Étape 6 : Tests en Production

### 6.1 Vérifications Post-Déploiement

1. **Inscription Email/Password**
   - Allez sur https://votre-domaine.com/auth/signup
   - Créez un compte
   - Vérifiez l'email de confirmation
   - Confirmez le compte

2. **Connexion Email/Password**
   - Connectez-vous avec vos credentials
   - Vérifiez la redirection vers `/dashboard`

3. **OAuth (si configuré)**
   - Testez la connexion Google/GitHub
   - Vérifiez la création du profil

4. **Réinitialisation de mot de passe**
   - Testez le flux complet de reset
   - Vérifiez la réception de l'email
   - Changez le mot de passe

5. **Middleware de Protection**
   - Essayez d'accéder à `/dashboard` sans être connecté
   - Vérifiez la redirection vers `/auth/signin`
   - Connectez-vous et vérifiez l'accès au dashboard

### 6.2 Vérifications de Sécurité

1. **Headers de Sécurité**
   - Vérifiez les headers HTTP : https://securityheaders.com/
   - Devrait inclure :
     - X-Frame-Options: DENY
     - X-Content-Type-Options: nosniff
     - Referrer-Policy
     - Content-Security-Policy

2. **SSL/TLS**
   - Vérifiez que HTTPS est actif
   - Testez : https://www.ssllabs.com/ssltest/

3. **Cookies**
   - Vérifiez que les cookies auth sont :
     - `httpOnly: true`
     - `secure: true` (en production)
     - `sameSite: 'lax'`

4. **Politiques RLS**
   - Testez avec différents utilisateurs
   - Vérifiez l'isolation des données par organisation

## 🔧 Étape 7 : Monitoring et Maintenance

### 7.1 Monitoring Supabase

**Dans Supabase Dashboard :**

1. **Auth Logs** : `Authentication` → `Logs`
   - Surveillez les tentatives de connexion
   - Identifiez les erreurs d'auth

2. **Database Performance** : `Database` → `Performance`
   - Surveillez les requêtes lentes
   - Optimisez les indexes

3. **API Usage** : `Settings` → `Usage`
   - Surveillez les limites API
   - Planifiez le scaling

### 7.2 Alertes et Notifications

Configurez des alertes pour :
- Échecs d'authentification répétés
- Pics d'utilisation API
- Erreurs de base de données

### 7.3 Sauvegardes

1. **Sauvegardes automatiques** :
   - Vérifiez dans `Settings` → `Backups`
   - Configurez la rétention

2. **Sauvegardes manuelles** :
   ```bash
   # Exporter la base de données
   npx supabase db dump > backup.sql
   ```

## 🐛 Dépannage

### Problème : Utilisateur non redirigé après connexion

**Solution :**
1. Vérifiez que le middleware est bien configuré
2. Vérifiez les cookies dans les DevTools
3. Vérifiez les logs Supabase

### Problème : OAuth ne fonctionne pas

**Solution :**
1. Vérifiez les URLs de redirection dans tous les providers
2. Vérifiez que les client ID/secret sont corrects
3. Vérifiez les logs OAuth du provider

### Problème : Emails non reçus

**Solution :**
1. Vérifiez les spams
2. Vérifiez la configuration SMTP dans Supabase
3. Testez avec un autre email

### Problème : RLS bloque les requêtes

**Solution :**
1. Vérifiez les politiques RLS
2. Testez les requêtes dans Supabase Studio
3. Vérifiez que `auth.uid()` retourne bien l'ID utilisateur

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Auth Guide](https://nextjs.org/docs/authentication)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✨ Checklist Finale

Avant de mettre en production :

- [ ] Variables d'environnement configurées
- [ ] OAuth providers configurés (si utilisés)
- [ ] URLs de redirection mises à jour
- [ ] Migrations appliquées en production
- [ ] Politiques RLS testées
- [ ] Templates d'email personnalisés
- [ ] Tests de connexion email/password réussis
- [ ] Tests OAuth réussis (si configurés)
- [ ] Headers de sécurité vérifiés
- [ ] SSL/TLS actif
- [ ] Monitoring configuré
- [ ] Sauvegardes configurées
- [ ] Documentation à jour

---

**Prêt pour la production ! 🚀**
