# 🚀 Guide de Déploiement Targetym sur Render

## Prérequis

- [x] Compte GitHub avec le repository targetym
- [ ] Compte Render (gratuit) - https://render.com
- [ ] Compte Supabase - https://supabase.com
- [ ] Git installé localement

---

## 📋 ÉTAPE 1: Créer un Projet Supabase Production

### 1.1 Créer le Projet
1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New Project"
3. Configurez:
   - **Name**: `targetym-production`
   - **Database Password**: Générez un mot de passe fort (NOTEZ-LE!)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
   - **Pricing Plan**: Free (pour commencer)
4. Cliquez sur "Create new project"
5. **Attendez 2-3 minutes** que le projet soit créé

### 1.2 Récupérer les Credentials
Une fois le projet créé:
1. Allez dans **Settings** → **API**
2. Notez ces valeurs (vous en aurez besoin):
   ```
   Project URL: https://xxxxxxxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (cliquez sur "Reveal" pour voir)
   ```

3. Allez dans **Settings** → **Database**
4. Notez la **Connection String** (mode "URI"):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres
   ```

### 1.3 Configurer le Storage (Bucket CVs)
1. Allez dans **Storage** → **Buckets**
2. Cliquez sur "Create bucket"
3. Configurez:
   - **Name**: `cvs`
   - **Public bucket**: **DÉCOCHÉ** (privé)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
4. Cliquez sur "Create bucket"

---

## 📋 ÉTAPE 2: Préparer le Repository Git

### 2.1 Vérifier que tout est commité
```bash
cd D:\targetym
git status
```

Si vous avez des modifications non commitées:
```bash
git add .
git commit -m "chore: prepare for Render deployment

- All migration fixes applied
- S2 security implemented (private CVs bucket)
- Better Auth configuration ready
- Environment variables documented

🤖 Generated with Claude Code"
```

### 2.2 Pousser sur GitHub
```bash
git push origin restructure/backend-frontend-separation
```

OU si vous voulez déployer depuis main:
```bash
git checkout main
git merge restructure/backend-frontend-separation
git push origin main
```

---

## 📋 ÉTAPE 3: Configurer Render

### 3.1 Créer le Web Service
1. Allez sur https://dashboard.render.com
2. Cliquez sur "New" → "Web Service"
3. Connectez votre repository GitHub `targetym`
4. Configurez:
   - **Name**: `targetym-production`
   - **Region**: Choisissez la même région que Supabase si possible
   - **Branch**: `main` (ou votre branche de déploiement)
   - **Root Directory**: (laissez vide)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: `Free` (pour commencer)

### 3.2 Configurer les Variables d'Environnement
Dans la section **Environment**, ajoutez:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://targetym-production.onrender.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AI Features (Optional - ajoutez si vous voulez l'IA)
# OPENAI_API_KEY=sk-...
# OU
# ANTHROPIC_API_KEY=sk-ant-...
```

**IMPORTANT**: Remplacez toutes les valeurs `xxxxxxxxxx` et `[YOUR-PASSWORD]` par vos vraies credentials Supabase!

### 3.3 Configuration Avancée (Optionnel)
- **Auto-Deploy**: Activé (déploiement automatique à chaque push)
- **Health Check Path**: `/api/health` (si vous avez cette route)

### 3.4 Lancer le Déploiement
1. Cliquez sur "Create Web Service"
2. Render va:
   - Cloner votre repository
   - Installer les dépendances
   - Builder l'application
   - Démarrer le serveur
3. **Attendez 5-10 minutes** pour le premier déploiement

---

## 📋 ÉTAPE 4: Appliquer les Migrations Supabase

### 4.1 Configurer Supabase CLI pour la Production
```bash
# Lier le projet local au projet production
npx supabase link --project-ref xxxxxxxxxx

# Remplacez xxxxxxxxxx par votre Project ID (trouvable dans Settings > General)
```

Le CLI va vous demander votre **Database Password** (celui noté à l'étape 1.1).

### 4.2 Pousser les Migrations
```bash
# Pousser TOUTES les migrations vers la production
npx supabase db push

# OU si vous voulez être plus prudent, migration par migration:
npx supabase db push --dry-run  # Preview d'abord
npx supabase db push            # Puis appliquer
```

### 4.3 Vérifier les Migrations
1. Allez dans Supabase Dashboard → **SQL Editor**
2. Exécutez:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;
   ```
3. Vous devriez voir toutes vos migrations listées

### 4.4 Vérifier les Policies RLS
1. Allez dans **Authentication** → **Policies**
2. Vérifiez que les policies sont bien appliquées pour:
   - `goals`
   - `candidates`
   - `job_postings`
   - `storage.objects` (pour le bucket CVs)

---

## 📋 ÉTAPE 5: Tester le Déploiement

### 5.1 Vérifier que l'Application Fonctionne
1. Ouvrez `https://targetym-production.onrender.com`
2. Vérifiez:
   - ✅ La page d'accueil se charge
   - ✅ Le logo Targetym s'affiche
   - ✅ Les liens fonctionnent

### 5.2 Tester l'Authentification
1. Allez sur `/auth/sign-up`
2. Créez un compte test
3. Vérifiez:
   - ✅ L'inscription fonctionne
   - ✅ La connexion fonctionne
   - ✅ Le dashboard se charge

### 5.3 Tester le Bucket CVs
1. Allez sur `/dashboard/recruitment`
2. Créez un job posting
3. Uploadez un CV
4. Vérifiez:
   - ✅ L'upload fonctionne
   - ✅ Le CV est bien privé (pas accessible publiquement)
   - ✅ Les utilisateurs autorisés peuvent y accéder

---

## 🔧 Dépannage

### Erreur: "Build failed"
**Cause**: Erreur de compilation TypeScript ou dépendances manquantes

**Solution**:
```bash
# Localement, testez le build
npm run build

# Si ça marche localement, vérifiez les logs Render
```

### Erreur: "Database connection failed"
**Cause**: Mauvaises credentials Supabase ou DATABASE_URL incorrecte

**Solution**:
1. Vérifiez que `DATABASE_URL` contient le bon mot de passe
2. Vérifiez que l'URL Supabase est correcte
3. Testez la connexion depuis le SQL Editor Supabase

### Erreur: "Module not found"
**Cause**: Dépendance manquante dans package.json

**Solution**:
```bash
# Vérifiez que toutes les dépendances sont dans package.json
npm install
git add package.json package-lock.json
git commit -m "fix: add missing dependencies"
git push
```

### Logs Render
Pour voir les logs détaillés:
1. Dashboard Render → Votre service
2. Onglet "Logs"
3. Filtrez par "Build" ou "Deploy"

---

## 🎯 Checklist Finale

Avant de considérer le déploiement terminé:

- [ ] ✅ Application accessible sur `https://targetym-production.onrender.com`
- [ ] ✅ Supabase production configuré avec toutes les tables
- [ ] ✅ Migrations appliquées (toutes les 15+ migrations)
- [ ] ✅ Bucket CVs créé et configuré en PRIVATE
- [ ] ✅ RLS policies actives sur toutes les tables
- [ ] ✅ Authentification fonctionne (sign-up/sign-in)
- [ ] ✅ Dashboard accessible après login
- [ ] ✅ Aucune erreur dans les logs Render
- [ ] ✅ Variables d'environnement toutes configurées

---

## 📊 Monitoring et Maintenance

### Logs
- **Render Logs**: https://dashboard.render.com → Votre service → Logs
- **Supabase Logs**: Dashboard → Logs

### Métriques
- **Render**: Dashboard → Metrics (CPU, Memory, Requests)
- **Supabase**: Dashboard → Reports (Queries, Storage)

### Mises à Jour
```bash
# Pour déployer une nouvelle version:
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Render déploiera automatiquement!
```

---

## 🆘 Besoin d'Aide?

Si vous rencontrez des problèmes:
1. Consultez les logs Render et Supabase
2. Vérifiez que toutes les variables d'environnement sont correctes
3. Testez localement d'abord avec `npm run build && npm run start`

---

**🎉 Félicitations! Votre application Targetym est maintenant en production sur Render!**
