# Solution: Appliquer les Migrations via SQL Editor

Le pooler de connexion est surchargé. La méthode la plus fiable est d'utiliser le **SQL Editor** du Dashboard Supabase.

## 📋 Instructions Pas à Pas

### Étape 1: Accéder au SQL Editor

1. Ouvrez: https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql/new
2. Ou: Dashboard → SQL Editor → **New query**

### Étape 2: Appliquer Migration 1 (CRITIQUE)

**Fichier:** `supabase/migrations/20251117000000_fix_rls_security_critical.sql`

1. Ouvrez le fichier dans votre éditeur
2. **Sélectionnez TOUT** (Ctrl+A)
3. **Copiez** (Ctrl+C)
4. Dans le SQL Editor, **collez** (Ctrl+V)
5. Cliquez sur **"Run"** (ou Ctrl+Enter)
6. ⏳ Attendez la confirmation de succès

**Temps estimé:** 5-10 secondes

### Étape 3: Appliquer Migration 2

**Fichier:** `supabase/migrations/20251117_add_soft_delete_to_profiles.sql`

1. Ouvrez le fichier
2. Copiez tout le contenu
3. Dans le SQL Editor, créez une **nouvelle query**
4. Collez et exécutez
5. ⏳ Attendez la confirmation

**Temps estimé:** 2-3 secondes

### Étape 4: Appliquer Migration 3

**Fichier:** `supabase/migrations/20251117_webhook_idempotency.sql`

1. Ouvrez le fichier
2. Copiez tout le contenu
3. Dans le SQL Editor, créez une **nouvelle query**
4. Collez et exécutez
5. ⏳ Attendez la confirmation

**Temps estimé:** 1-2 secondes

### Étape 5: Vérifier

Après avoir appliqué les 3 migrations, vérifiez avec:

```bash
npx supabase migration list --linked
```

Toutes les migrations devraient maintenant apparaître comme synchronisées.

---

## ⚠️ Notes Importantes

- ✅ Appliquez les migrations **dans l'ordre** (1, 2, 3)
- ✅ Attendez la confirmation de succès avant de passer à la suivante
- ✅ Les migrations utilisent `IF EXISTS` et `IF NOT EXISTS` - certaines erreurs peuvent être ignorées
- ✅ Si vous voyez des NOTICE (pas des ERROR), c'est normal

---

## 🔗 Liens Utiles

- **SQL Editor:** https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql/new
- **Dashboard:** https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu
- **Settings Database:** https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/settings/database

---

**Cette méthode est la plus fiable quand le pooler a des problèmes!** ✅

