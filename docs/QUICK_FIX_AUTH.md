# 🚨 Fix Rapide - Boucle de Redirection

**Problème:** Après connexion, vous êtes redirigé entre `/dashboard` et `/auth/signin` en boucle.

**Cause:** La table `profiles` n'existe pas encore dans votre base de données Supabase.

**Solution:** Exécutez le script SQL (2 minutes)

---

## ✅ Solution en 3 Étapes

### Étape 1: Ouvrir Supabase Dashboard
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **juuekovwshynwgjkqkbu**
3. Cliquez sur **"SQL Editor"** dans le menu latéral

### Étape 2: Exécuter le Script
1. Cliquez sur **"New query"**
2. Ouvrez le fichier `supabase/auth-setup.sql` dans votre éditeur de code
3. Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)
4. Collez dans l'éditeur SQL de Supabase
5. Cliquez sur **"Run"** (ou Ctrl+Enter)

### Étape 3: Vérifier
Vous devriez voir ce message dans les résultats :
```
✅ Tables créées:
  - organizations
  - profiles

✅ Triggers créés:
  - on_auth_user_created (auto-create profile)

🚀 Supabase Auth est prêt !
```

---

## 🔄 Après l'Exécution

1. **Rafraîchissez votre page dashboard** (F5)
2. Vous devriez maintenant voir le dashboard sans boucle
3. Si vous voyez encore le message d'erreur, le script n'a pas été exécuté correctement

---

## 🐛 Si Vous Avez une Erreur

### Erreur : "relation profiles does not exist"
**Solution:** Le script SQL n'a pas été exécuté. Réessayez l'étape 2.

### Erreur : "table already exists"
**Solution:** Les tables existent déjà. Vérifiez dans **Table Editor** que vous voyez bien :
- `organizations`
- `profiles`

Si oui, le problème est ailleurs. Vérifiez que le trigger `on_auth_user_created` existe :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Votre profil n'est pas créé automatiquement
**Solution:** Créez-le manuellement :
```sql
-- Remplacez YOUR_EMAIL par votre email de connexion
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'name' as full_name
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com';
```

---

## 📋 Vérification Complète

### 1. Vérifier les Tables
Dans **Table Editor**, vous devez voir :
- ✅ `organizations` (avec au moins 1 ligne : "Default Organization")
- ✅ `profiles` (avec votre profil)

### 2. Vérifier votre Profil
```sql
SELECT * FROM profiles WHERE email = 'VOTRE_EMAIL@example.com';
```

Vous devriez voir une ligne avec :
- `id` (UUID)
- `email` (votre email)
- `full_name` (votre nom ou vide)
- `organization_id` (peut être NULL au début)
- `role` (par défaut: 'employee')

### 3. Assigner une Organisation (Optionnel)
Si `organization_id` est NULL, assignez l'organisation par défaut :
```sql
UPDATE profiles
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org')
WHERE email = 'VOTRE_EMAIL@example.com';
```

---

## 🎯 Ce qui a été Corrigé

### Avant
```typescript
// Redirection infinie
if (profileError || !profile) {
  redirect("/auth/signin"); // ❌ Crée une boucle
}
```

### Maintenant
```typescript
// Message clair et explicite
if (profileError || !profile) {
  return (
    <div>⚠️ Configuration requise</div> // ✅ Pas de redirection
  );
}
```

---

## 📞 Besoin d'Aide ?

Si après avoir exécuté le script vous avez toujours des problèmes :

1. **Vérifiez les logs Supabase :**
   - Dashboard → Logs → Database Logs
   - Cherchez les erreurs liées à `profiles`

2. **Vérifiez l'exécution du trigger :**
   ```sql
   -- Doit retourner 1 ligne
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. **Créez un nouveau compte de test :**
   - Déconnectez-vous
   - Créez un nouveau compte avec un autre email
   - Vérifiez si le profil est créé automatiquement

---

**Fichiers de référence:**
- Script SQL: `supabase/auth-setup.sql`
- Guide complet: `SUPABASE_AUTH_SETUP.md`
- Rapport technique: `AUTHENTICATION_REPORT.md`

**Créé le:** 2025-10-23
**Problème résolu:** Boucle de redirection après connexion
