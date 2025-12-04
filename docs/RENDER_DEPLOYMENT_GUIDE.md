# Guide de Déploiement - Targetym sur Render

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer Targetym sur Render avec Supabase comme backend.

**Stack déployé :**
- Frontend/Backend : Next.js 15.5.4 sur Render
- Database : Supabase (PostgreSQL + Auth)
- Stockage : Supabase Storage
- Rate Limiting : Upstash Redis (optionnel)

---

## 🚀 Déploiement Rapide (TL;DR)

```bash
# 1. Pousser les migrations Supabase
supabase link --project-ref juuekovwshynwgjkqkbu
npx supabase db push

# 2. Pousser sur GitHub/GitLab
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main

# 3. Déployer sur Render
# - Connectez votre dépôt GitHub/GitLab
# - Render détectera automatiquement render.yaml
# - Configurez les variables d'environnement
# - Déployez !
```

---

## 📦 Prérequis

### 1. Compte Render
- Créez un compte sur [Render.com](https://render.com)
- Gratuit pour commencer (plan Starter)

### 2. Repository Git
✅ Vous avez déjà configuré :
- GitHub : https://github.com/badalot/targetym.git
- GitLab : git@gitlab.com:badalot/targetymai.git

### 3. Supabase Production
✅ Vous avez déjà :
- Project ID : `juuekovwshynwgjkqkbu`
- URL : https://juuekovwshynwgjkqkbu.supabase.co

---

## 🔧 Étape 1 : Préparation des Migrations Supabase

### 1.1 Lier le Projet Local à Supabase Production

```bash
# Se connecter à Supabase
supabase login

# Lier votre projet local à la production
supabase link --project-ref juuekovwshynwgjkqkbu
```

**Vous serez invité à entrer le mot de passe de la base de données.**
- Trouvez-le dans : Supabase Dashboard → Settings → Database → Database password

### 1.2 Pousser les Migrations

```bash
# Vérifier les migrations à appliquer
npx supabase db diff

# Pousser toutes les migrations vers production
npx supabase db push
```

**Vérification :**
```bash
# Vérifier le statut
supabase status

# Vérifier les tables en production
supabase db pull
```

### 1.3 Générer les Types TypeScript depuis Production

```bash
# Mettre à jour les types depuis la production
pnpm run supabase:types:remote
```

---

## 🏗️ Étape 2 : Préparation du Code

### 2.1 Vérifier le Build Local

```bash
# Installer les dépendances
pnpm install

# Tester le build de production
pnpm run build

# Tester le serveur de production localement
pnpm run start
```

**Le build doit réussir sans erreur critique !**

### 2.2 Vérifier les Fichiers de Configuration

✅ **Fichiers créés :**
- `render.yaml` - Configuration Render
- `.dockerignore` - Fichiers à ignorer

✅ **Fichiers existants :**
- `package.json` - Scripts de build
- `next.config.ts` - Config Next.js optimisée
- `.env.local` - Variables locales (NE PAS COMMITER)

### 2.3 Créer .gitignore pour .env

Assurez-vous que `.env.local` est bien ignoré :

```bash
# Vérifier
git check-ignore .env.local
```

Si ce n'est pas le cas, ajoutez à `.gitignore` :
```
.env.local
.env*.local
```

### 2.4 Pousser sur Git

```bash
# Ajouter les nouveaux fichiers
git add render.yaml .dockerignore

# Commiter
git commit -m "chore: add Render deployment configuration"

# Pousser vers GitHub (recommandé pour Render)
git push github main

# Ou GitLab
git push origin main
```

---

## 🌐 Étape 3 : Configuration Render

### 3.1 Créer un Nouveau Web Service

1. **Connectez-vous à Render**
   - Allez sur https://dashboard.render.com

2. **Nouveau Web Service**
   - Cliquez sur "New +" → "Web Service"

3. **Connecter le Repository**
   - Sélectionnez GitHub ou GitLab
   - Autorisez Render à accéder à vos repos
   - Sélectionnez `targetym`

4. **Configuration Automatique**
   - Render détectera `render.yaml` automatiquement
   - Nom du service : `targetym-app`
   - Branch : `main`

### 3.2 Configurer les Variables d'Environnement

Dans Render Dashboard → Environment :

#### **Variables Requises**

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://targetym-app.onrender.com  # Sera fourni par Render

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://juuekovwshynwgjkqkbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres.juuekovwshynwgjkqkbu:RiYx3Q6ZWjjGb8bx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Comment obtenir ces valeurs :**
- `NEXT_PUBLIC_SUPABASE_URL` : Supabase Dashboard → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Supabase Dashboard → Settings → API → `anon public` key
- `SUPABASE_SERVICE_ROLE_KEY` : Supabase Dashboard → Settings → API → `service_role` key ⚠️ **SECRET**
- `DATABASE_URL` : Supabase Dashboard → Settings → Database → Connection string (Transaction mode)

#### **Variables Optionnelles (OAuth)**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

#### **Variables Optionnelles (AI)**

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

#### **Variables Optionnelles (Rate Limiting)**

```bash
# Upstash Redis (pour rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3.3 Configuration Avancée

**Plan Render :**
- **Free Tier** : Gratuit, se met en veille après 15min d'inactivité
- **Starter ($7/mois)** : Toujours actif, meilleure performance
- **Standard ($25/mois)** : Plus de ressources

**Région :**
- `frankfurt` (Europe)
- `oregon` (US West)
- `singapore` (Asia)

**Auto-Deploy :**
- ✅ Activé par défaut (déploie automatiquement sur `git push`)

---

## 🔐 Étape 4 : Configuration Supabase pour Render

### 4.1 Configurer les URLs de Redirection

Dans Supabase Dashboard → Authentication → URL Configuration :

```
Site URL: https://targetym-app.onrender.com

Additional Redirect URLs:
- https://targetym-app.onrender.com/auth/callback
- https://targetym-app.onrender.com/auth/reset-password
- http://localhost:3000/auth/callback (pour dev local)
```

### 4.2 Configurer les OAuth Providers

Si vous utilisez OAuth (Google, GitHub, etc.) :

1. **Google Cloud Console**
   - Authorized redirect URIs : `https://targetym-app.onrender.com/auth/callback`

2. **GitHub OAuth App**
   - Authorization callback URL : `https://targetym-app.onrender.com/auth/callback`

3. **Supabase Dashboard**
   - Authentication → Providers
   - Activez et configurez chaque provider

### 4.3 Configurer les Emails (Production)

Dans Supabase Dashboard → Authentication → Email Templates :

1. **Personnaliser les templates**
   - Confirmation email
   - Password reset
   - Magic link

2. **SMTP Personnalisé (Optionnel)**
   - Settings → Auth → SMTP Settings
   - Configurez votre serveur SMTP (SendGrid, Mailgun, etc.)

---

## 🚀 Étape 5 : Déploiement

### 5.1 Lancer le Déploiement

Dans Render Dashboard :

1. **Vérifier la Configuration**
   - Branch : `main`
   - Build Command : `pnpm install && pnpm run build`
   - Start Command : `pnpm run start`

2. **Cliquer sur "Create Web Service"**
   - Render va :
     - Cloner le repo
     - Installer pnpm
     - Installer les dépendances
     - Builder Next.js
     - Démarrer le serveur

3. **Suivre les Logs**
   - Onglet "Logs" pour voir la progression
   - Le déploiement prend ~5-10 minutes

### 5.2 Vérifier le Déploiement

Une fois déployé :

1. **URL de l'application**
   - Render vous donnera une URL : `https://targetym-app.onrender.com`

2. **Health Check**
   - Vérifiez : `https://targetym-app.onrender.com/api/health`
   - Devrait retourner `{ "status": "ok" }`

3. **Page d'accueil**
   - Accédez à : `https://targetym-app.onrender.com`
   - Devrait afficher votre landing page

---

## ✅ Étape 6 : Tests en Production

### 6.1 Tester l'Authentification

1. **Inscription**
   - Allez sur : `https://targetym-app.onrender.com/auth/signup`
   - Créez un compte test

2. **Vérification du Profil**
   - Vérifiez dans Supabase Studio (production)
   - Table `profiles` devrait contenir le nouveau profil

3. **Connexion**
   - Connectez-vous avec le compte test
   - Vérifiez la redirection vers `/dashboard`

4. **OAuth (si configuré)**
   - Testez "Sign in with Google/GitHub"
   - Vérifiez le callback

### 6.2 Tester les Features

1. **Dashboard**
   - Accédez au dashboard
   - Vérifiez que les données se chargent

2. **Goals Module**
   - Créez un objectif
   - Vérifiez l'enregistrement en base

3. **Performance**
   - Vérifiez les temps de chargement
   - Utilisez Chrome DevTools → Lighthouse

### 6.3 Monitoring

1. **Render Metrics**
   - Dashboard → Metrics
   - Surveillez :
     - Response time
     - CPU usage
     - Memory usage
     - HTTP requests

2. **Supabase Logs**
   - Dashboard → Logs
   - Vérifiez les erreurs éventuelles

---

## 🔧 Configuration Avancée

### Custom Domain (Optionnel)

1. **Acheter un Domaine**
   - Namecheap, Google Domains, etc.

2. **Configurer dans Render**
   - Settings → Custom Domains
   - Ajoutez `targetym.com` et `www.targetym.com`

3. **Configurer DNS**
   - Ajoutez un enregistrement CNAME :
     ```
     CNAME www targetym-app.onrender.com
     CNAME @ targetym-app.onrender.com
     ```

4. **SSL Automatique**
   - Render génère automatiquement un certificat Let's Encrypt

5. **Mettre à Jour Supabase**
   - Site URL : `https://targetym.com`
   - Redirect URLs : `https://targetym.com/auth/callback`

### CI/CD Automatisé

✅ **Déjà configuré !**

Avec `render.yaml` :
- Chaque `git push` sur `main` → Déploiement automatique
- Build réussi → Mise en production
- Build échoué → Rollback automatique

### Rollback

Si un déploiement échoue :

1. **Render Dashboard**
   - Onglet "Events"
   - Cliquez sur le déploiement précédent
   - "Redeploy"

2. **Via Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 🐛 Dépannage

### Build Échoue

**Problème : pnpm not found**
```bash
Solution : Vérifier PNPM_VERSION dans render.yaml
```

**Problème : Out of memory**
```bash
Solution : Upgrade vers le plan Starter ou Standard
```

**Problème : TypeScript errors**
```bash
Solution : next.config.ts a déjà `ignoreBuildErrors: true`
```

### Application Crash

**Vérifier les logs :**
```bash
Render Dashboard → Logs
```

**Erreurs communes :**
1. Variables d'environnement manquantes
2. Supabase connection failed
3. Port binding issues

### Performance Lente

**Free Tier :**
- Se met en veille après 15min
- Premier chargement peut prendre 30-60s

**Solutions :**
1. Upgrade vers Starter ($7/mois)
2. Utiliser un service de "keep-alive"
3. Optimiser le code (SSR → SSG quand possible)

### OAuth Ne Fonctionne Pas

**Vérifications :**
1. URLs de redirection dans Google/GitHub
2. URLs dans Supabase Dashboard
3. Variables GOOGLE_CLIENT_ID, etc. dans Render

---

## 📊 Monitoring et Observabilité

### Logs

**Render Logs :**
```bash
# En temps réel
Render Dashboard → Logs → Live logs

# Historique
Render Dashboard → Logs → Select time range
```

**Supabase Logs :**
```bash
Supabase Dashboard → Logs → Query Logs
```

### Metrics

**Application Metrics :**
- Response time
- Error rate
- Request volume

**Database Metrics :**
- Connections active
- Query performance
- Storage usage

### Alertes

Configurez des alertes dans Render :
- Dashboard → Notifications
- Email ou Slack
- Conditions : CPU > 80%, Memory > 90%, etc.

---

## 💰 Coûts Estimés

### Render
- **Free Tier** : $0/mois (se met en veille)
- **Starter** : $7/mois (toujours actif)
- **Standard** : $25/mois (plus de ressources)

### Supabase
- **Free Tier** : $0/mois (500 MB database, 1 GB storage)
- **Pro** : $25/mois (8 GB database, 100 GB storage)

### Upstash Redis (Optionnel)
- **Free** : $0/mois (10,000 requêtes/jour)
- **Pay-as-you-go** : $0.20/100,000 requêtes

**Total pour démarrer : $0-$32/mois**

---

## 🚦 Checklist de Production

Avant de lancer en production :

### Infrastructure
- [ ] Migrations Supabase déployées
- [ ] Variables d'environnement configurées
- [ ] URLs de redirection configurées
- [ ] Custom domain configuré (optionnel)
- [ ] SSL activé

### Sécurité
- [ ] Service Role Key sécurisée (jamais dans le code)
- [ ] RLS policies activées
- [ ] Headers de sécurité configurés
- [ ] CORS configuré
- [ ] Rate limiting activé (optionnel)

### Performance
- [ ] Build optimisé testé
- [ ] Images optimisées
- [ ] Caching configuré
- [ ] CDN configuré (Render le fait automatiquement)

### Monitoring
- [ ] Logs configurés
- [ ] Alertes configurées
- [ ] Health checks actifs
- [ ] Uptime monitoring (optionnel : UptimeRobot)

### Tests
- [ ] Authentification testée
- [ ] OAuth testé (si configuré)
- [ ] Toutes les features testées
- [ ] Performance testée (Lighthouse > 80)

---

## 🎯 Prochaines Étapes

1. **Déployer sur Render** (suivez ce guide)
2. **Tester en production**
3. **Configurer un custom domain**
4. **Mettre en place le monitoring**
5. **Optimiser les performances**
6. **Planifier les backups**

---

## 📚 Ressources

- [Render Documentation](https://render.com/docs)
- [Next.js on Render](https://render.com/docs/deploy-nextjs-app)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)
- [Render + Supabase Guide](https://render.com/docs/databases)

---

**🎉 Félicitations ! Vous êtes prêt à déployer Targetym en production sur Render !**

Pour toute question, consultez :
- Documentation Render : https://render.com/docs
- Support Render : https://render.com/support
- Ce guide : `docs/RENDER_DEPLOYMENT_GUIDE.md`
