# Migrations à Appliquer via SQL Editor

**Projet:** targetym  
**URL SQL Editor:** https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql/new

---

## ⚠️ Important

Appliquez les migrations **dans l'ordre** et **une par une**.  
Attendez la confirmation de succès avant de passer à la suivante.

---

## Migration 1: Fix RLS Security Critical

**Fichier:** `supabase/migrations/20251117000000_fix_rls_security_critical.sql`  
**Priorité:** 🔴 **CRITIQUE**

**Instructions:**
1. Ouvrez le fichier `supabase/migrations/20251117000000_fix_rls_security_critical.sql`
2. Copiez TOUT le contenu (Ctrl+A, Ctrl+C)
3. Collez dans le SQL Editor
4. Cliquez sur "Run" (ou Ctrl+Enter)
5. Attendez le message de succès ✅

---

## Migration 2: Soft Delete Profiles

**Fichier:** `supabase/migrations/20251117_add_soft_delete_to_profiles.sql`  
**Priorité:** 🟡 Moyenne

**Instructions:**
1. Ouvrez le fichier `supabase/migrations/20251117_add_soft_delete_to_profiles.sql`
2. Copiez TOUT le contenu
3. Collez dans le SQL Editor
4. Cliquez sur "Run"
5. Attendez le message de succès ✅

---

## Migration 3: Webhook Idempotency

**Fichier:** `supabase/migrations/20251117_webhook_idempotency.sql`  
**Priorité:** 🟡 Moyenne

**Instructions:**
1. Ouvrez le fichier `supabase/migrations/20251117_webhook_idempotency.sql`
2. Copiez TOUT le contenu
3. Collez dans le SQL Editor
4. Cliquez sur "Run"
5. Attendez le message de succès ✅

---

## Vérification Après Application

Après avoir appliqué les 3 migrations, vérifiez avec:

```bash
npx supabase migration list --linked
```

Toutes les migrations devraient apparaître comme synchronisées.

---

## En Cas d'Erreur

Si une migration échoue:
1. Notez le message d'erreur exact
2. Vérifiez quelle partie de la migration a échoué
3. Les migrations utilisent `IF EXISTS` et `IF NOT EXISTS` donc certaines erreurs peuvent être ignorées
4. Contactez-moi avec le message d'erreur pour correction

---

**Bonne chance!** 🚀

