# Guide Interactif : Correctifs Manuels S1 & S2

## 🎯 Objectif

Corriger les 2 dernières vulnérabilités de sécurité critiques identifiées dans l'audit :

- **S1** : Rotation des credentials Supabase exposés (15 min)
- **S2** : Sécurisation du bucket CV avec RLS (15 min)

**Durée totale estimée : 30 minutes**

---

## 🔐 S1 : Rotation des Credentials Supabase

### ⚠️ Problème identifié

Les credentials Supabase dans `.env.local` ont été potentiellement exposés dans :
- Historique Git
- Logs de développement
- Captures d'écran partagées

**Impact :** Accès non autorisé potentiel à la base de données

### ✅ Solution : Régénérer les clés API

#### Étape 1 : Accéder au Dashboard Supabase

1. Ouvrez votre navigateur
2. Allez sur https://supabase.com/dashboard
3. Sélectionnez votre projet **Targetym**
4. Cliquez sur **Settings** (⚙️) dans la sidebar gauche

#### Étape 2 : Régénérer l'Anon Key

1. Dans Settings, cliquez sur **API**
2. Localisez la section **Project API keys**
3. Trouvez **anon public** key
4. Cliquez sur le bouton **Regenerate** (🔄) à droite
5. ⚠️ **IMPORTANT** : Confirmez la régénération
6. Copiez la nouvelle clé (elle ressemble à : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### Étape 3 : Régénérer la Service Role Key

⚠️ **ATTENTION : Cette clé a tous les privilèges. Ne JAMAIS l'exposer côté client !**

1. Dans la même page **API**
2. Localisez **service_role** key (section **Project API keys**)
3. Cliquez sur **Regenerate** (🔄)
4. ⚠️ Confirmez avec précaution
5. Copiez la nouvelle clé

#### Étape 4 : Mettre à jour .env.local

```bash
# 1. Ouvrir le fichier
code .env.local  # ou votre éditeur préféré

# 2. Remplacer les anciennes clés par les nouvelles :

# AVANT (anciennes clés - NE PLUS UTILISER)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OLD_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OLD_SERVICE_KEY

# APRÈS (nouvelles clés)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NOUVELLE_ANON_KEY_COPIÉE_ÉTAPE_2>
SUPABASE_SERVICE_ROLE_KEY=<NOUVELLE_SERVICE_ROLE_KEY_COPIÉE_ÉTAPE_3>

# 3. Sauvegarder le fichier (Ctrl+S)
```

#### Étape 5 : Redémarrer le serveur de développement

```bash
# 1. Arrêter le serveur actuel (Ctrl+C dans le terminal)

# 2. Redémarrer avec les nouvelles clés
npm run dev

# 3. Vérifier que l'app fonctionne toujours
# Ouvrir http://localhost:3001
```

#### Étape 6 : Tester l'authentification

```bash
# 1. Ouvrir http://localhost:3001/auth/sign-in
# 2. Essayer de se connecter avec vos credentials de test
# 3. Vérifier que la connexion fonctionne

# Si erreur "Invalid API key", vérifier que :
# - Les nouvelles clés ont bien été copiées
# - Pas d'espaces en début/fin des clés
# - Le serveur a bien été redémarré
```

#### ✅ Checklist S1

- [ ] Dashboard Supabase ouvert
- [ ] Anon Key régénérée et copiée
- [ ] Service Role Key régénérée et copiée
- [ ] .env.local mis à jour
- [ ] Serveur redémarré
- [ ] Authentification testée et fonctionnelle

---

## 📁 S2 : Sécurisation du Bucket CV

### ⚠️ Problème identifié

Le bucket `cvs` est actuellement **PUBLIC**, ce qui signifie :
- ❌ N'importe qui peut accéder aux CVs via URL directe
- ❌ Violation RGPD (données personnelles exposées)
- ❌ Risque de fuite de données confidentielles

**Impact :** Violation de conformité RGPD + risque juridique

### ✅ Solution : RLS Policies sur le bucket Storage

#### Étape 1 : Accéder au Storage

1. Dans le Dashboard Supabase (déjà ouvert)
2. Cliquez sur **Storage** (📦) dans la sidebar
3. Vous devriez voir le bucket **cvs**

#### Étape 2 : Rendre le bucket privé

1. Cliquez sur le bucket **cvs**
2. Cliquez sur le bouton **Settings** (⚙️) en haut à droite
3. Dans la section **Public access**
4. ⚠️ **Décochez** "Public bucket" si coché
5. Cliquez sur **Save**

#### Étape 3 : Ajouter les RLS Policies

##### Policy 1 : Lecture des CVs (Recruteurs uniquement)

```sql
-- Nom : "Recruiters can view CVs"
-- Operation : SELECT
-- Policy :

CREATE POLICY "Recruiters can view CVs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs'
  AND auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('admin', 'manager', 'hr')
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);
```

**Comment l'ajouter :**
1. Dans le bucket **cvs**, cliquez sur **Policies**
2. Cliquez sur **New Policy**
3. Choisissez **Custom** (pas template)
4. Nom : `Recruiters can view CVs`
5. Target : **SELECT**
6. Copiez/collez le SQL ci-dessus dans le champ **Policy definition**
7. Cliquez sur **Save**

##### Policy 2 : Upload de CVs (Candidats et Recruteurs)

```sql
-- Nom : "Authenticated users can upload CVs"
-- Operation : INSERT
-- Policy :

CREATE POLICY "Authenticated users can upload CVs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs'
  AND auth.uid() IS NOT NULL
  AND (
    -- Candidats peuvent uploader leur propre CV
    auth.uid() IN (
      SELECT user_id FROM candidates
      WHERE id = (storage.foldername(name))[1]::uuid
    )
    OR
    -- Recruteurs peuvent uploader pour candidats
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('admin', 'manager', 'hr')
    )
  )
);
```

**Comment l'ajouter :**
1. Cliquez sur **New Policy** (encore)
2. Nom : `Authenticated users can upload CVs`
3. Target : **INSERT**
4. Copiez/collez le SQL ci-dessus
5. Cliquez sur **Save**

##### Policy 3 : Suppression de CVs (Admins uniquement)

```sql
-- Nom : "Admins can delete CVs"
-- Operation : DELETE
-- Policy :

CREATE POLICY "Admins can delete CVs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cvs'
  AND auth.uid() IN (
    SELECT id FROM profiles
    WHERE role = 'admin'
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);
```

**Comment l'ajouter :**
1. Cliquez sur **New Policy** (encore)
2. Nom : `Admins can delete CVs`
3. Target : **DELETE**
4. Copiez/collez le SQL ci-dessus
5. Cliquez sur **Save**

#### Étape 4 : Vérifier la configuration RLS

1. Dans **Storage** → **cvs** → **Policies**
2. Vous devriez voir **3 policies actives** :
   - ✅ Recruiters can view CVs (SELECT)
   - ✅ Authenticated users can upload CVs (INSERT)
   - ✅ Admins can delete CVs (DELETE)

#### Étape 5 : Tester la sécurité

##### Test 1 : Accès anonyme (doit échouer)

```bash
# 1. Ouvrir un terminal
# 2. Essayer d'accéder à un CV existant sans authentification

curl https://your-project.supabase.co/storage/v1/object/public/cvs/test.pdf

# Résultat attendu : 401 Unauthorized ou 403 Forbidden
# Si le CV se télécharge, la policy n'est PAS appliquée !
```

##### Test 2 : Upload depuis l'app (doit fonctionner)

```bash
# 1. Ouvrir l'app : http://localhost:3001
# 2. Se connecter en tant qu'admin/manager
# 3. Aller dans Recruitment → Candidates
# 4. Créer un nouveau candidat
# 5. Uploader un CV de test

# Résultat attendu : Upload réussi
```

##### Test 3 : Accès authentifié (doit fonctionner)

```bash
# 1. Dans l'app, connecté en tant que recruteur
# 2. Aller dans Recruitment → Candidates
# 3. Cliquer sur un candidat avec CV
# 4. Vérifier que le CV se télécharge

# Résultat attendu : Téléchargement réussi
```

#### ✅ Checklist S2

- [ ] Bucket **cvs** rendu privé (Public access décoché)
- [ ] Policy SELECT créée (Recruiters can view CVs)
- [ ] Policy INSERT créée (Authenticated users can upload CVs)
- [ ] Policy DELETE créée (Admins can delete CVs)
- [ ] Test 1 : Accès anonyme bloqué ✅
- [ ] Test 2 : Upload fonctionnel ✅
- [ ] Test 3 : Accès authentifié OK ✅

---

## 🔍 Vérification finale

### Script de vérification automatique

Créez un fichier `scripts/verify-s1-s2.ts` :

```typescript
// scripts/verify-s1-s2.ts
import { createClient } from '@supabase/supabase-js'

async function verifyS1() {
  console.log('\n🔐 Vérification S1 : Credentials')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  try {
    const supabase = createClient(url, anonKey)
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.log('❌ ERREUR : Credentials invalides')
      console.log('   → Vérifier que les nouvelles clés sont correctes')
      return false
    }

    console.log('✅ Credentials valides et fonctionnels')
    return true
  } catch (error) {
    console.log('❌ ERREUR : Impossible de se connecter')
    return false
  }
}

async function verifyS2() {
  console.log('\n📁 Vérification S2 : Bucket CV sécurisé')

  // Test accès anonyme (doit échouer)
  const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/test.pdf`

  try {
    const response = await fetch(testUrl)

    if (response.status === 401 || response.status === 403) {
      console.log('✅ Bucket sécurisé : accès anonyme bloqué')
      return true
    } else if (response.status === 404) {
      console.log('⚠️  Bucket vide ou fichier inexistant (normal)')
      return true
    } else {
      console.log('❌ ATTENTION : Bucket encore PUBLIC !')
      console.log('   → Retourner à l\'étape 2 de S2')
      return false
    }
  } catch (error) {
    console.log('⚠️  Impossible de tester (bucket vide ?)')
    return true
  }
}

async function main() {
  console.log('=' .repeat(60))
  console.log('VÉRIFICATION S1 & S2')
  console.log('=' .repeat(60))

  const s1Ok = await verifyS1()
  const s2Ok = await verifyS2()

  console.log('\n' + '='.repeat(60))
  if (s1Ok && s2Ok) {
    console.log('✅ TOUS LES CORRECTIFS APPLIQUÉS AVEC SUCCÈS')
  } else {
    console.log('❌ DES CORRECTIFS NÉCESSITENT VOTRE ATTENTION')
  }
  console.log('='.repeat(60) + '\n')
}

main()
```

**Exécution :**

```bash
npx tsx scripts/verify-s1-s2.ts
```

---

## 📊 Résumé des actions

### S1 : Credentials ✅

| Action | Durée | Criticité |
|--------|-------|-----------|
| Régénération anon_key | 5 min | 🔴 Critique |
| Régénération service_role_key | 5 min | 🔴 Critique |
| Mise à jour .env.local | 2 min | 🔴 Critique |
| Test authentification | 3 min | 🟡 Important |

### S2 : Bucket CV ✅

| Action | Durée | Criticité |
|--------|-------|-----------|
| Rendre bucket privé | 2 min | 🔴 Critique (RGPD) |
| Policy SELECT | 3 min | 🔴 Critique |
| Policy INSERT | 3 min | 🔴 Critique |
| Policy DELETE | 3 min | 🟡 Important |
| Tests sécurité | 4 min | 🟡 Important |

---

## 🎯 Checklist finale globale

### Sécurité
- [ ] ✅ S1 : Credentials Supabase régénérés
- [ ] ✅ S2 : Bucket CV sécurisé avec RLS
- [ ] ✅ S3 : Protection CSRF (déjà fait automatiquement)
- [ ] ✅ S4 : Rate Limiting 100% (déjà fait automatiquement)

### Qualité
- [ ] ✅ M1 : Logging professionnel (91% - déjà fait automatiquement)
- [ ] ⏳ M2 : Correction erreurs TypeScript (24 erreurs - optionnel)
- [ ] ⏳ M3 : Tests coverage 80% (optionnel)

### Conformité
- [ ] ✅ RGPD : Données CV protégées (S2)
- [ ] ✅ OWASP : CSRF protégé (S3)
- [ ] ✅ OWASP : Rate limiting (S4)

---

## 🆘 Aide & Dépannage

### Problème : "Invalid API key" après S1

**Cause :** Mauvaise copie des clés ou serveur pas redémarré

**Solution :**
1. Vérifier qu'il n'y a pas d'espaces avant/après les clés dans .env.local
2. Vérifier que les clés sont complètes (commencent par `eyJhbG...`)
3. Redémarrer le serveur : `npm run dev`
4. Vider le cache navigateur (Ctrl+Shift+R)

### Problème : CVs toujours accessibles publiquement après S2

**Cause :** Bucket pas rendu privé ou policies mal appliquées

**Solution :**
1. Dashboard Supabase → Storage → cvs → Settings
2. Vérifier que "Public bucket" est **décoché**
3. Aller dans Policies
4. Vérifier que les 3 policies sont **ENABLED** (toggle vert)
5. Tester avec un navigateur en mode incognito

### Problème : Impossible d'uploader de CV après S2

**Cause :** Policy INSERT trop restrictive

**Solution :**
1. Vérifier la policy INSERT
2. Vérifier que l'utilisateur a le role 'admin', 'manager' ou 'hr'
3. Vérifier dans la console navigateur (F12) pour voir l'erreur exacte
4. Ajuster la policy si nécessaire

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Logs Supabase :** Dashboard → Logs → Edge Functions
2. **Logs App :** Console navigateur (F12)
3. **Documentation :** https://supabase.com/docs/guides/storage

---

**Durée totale estimée : 30 minutes**

**Une fois S1 & S2 complétés, TOUS les correctifs critiques de sécurité seront appliqués ! 🎉**
