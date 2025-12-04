# ⚡ Déploiement Rapide - Targetym sur Render

## 🚀 5 Commandes pour Déployer

```bash
# 1️⃣ Lier et pousser les migrations Supabase (2 min)
supabase link --project-ref juuekovwshynwgjkqkbu
npx supabase db push

# 2️⃣ Pousser sur Git (1 min)
git add render.yaml .dockerignore docs/
git commit -m "chore: add Render deployment config"
git push github main

# 3️⃣ Créer le service sur Render
# → Allez sur https://dashboard.render.com
# → "New +" → "Web Service"
# → Sélectionnez le repo targetym
# → Render détecte render.yaml automatiquement

# 4️⃣ Ajouter les variables d'environnement dans Render
# → Environment → Add Environment Variable

# 5️⃣ Déployer !
# → "Create Web Service"
# → Attendez 5-10 min
# → L'app sera live sur https://targetym-app.onrender.com
```

---

## 🔑 Variables d'Environnement Requises

Copiez-collez dans Render Dashboard → Environment :

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://targetym-app.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://juuekovwshynwgjkqkbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dWVrb3Z3c2h5bndnamtxa2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTk0MzUsImV4cCI6MjA3NDk3NTQzNX0.gV7xwZZoUqKbuUFbngH7s5ShCHx9bNeLUuqhzMH6tdo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dWVrb3Z3c2h5bndnamtxa2J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM5OTQzNSwiZXhwIjoyMDc0OTc1NDM1fQ.9iW97RwsuRNN2xXCmKpiUgT8068t2gbjTKWiVh-EJSY
DATABASE_URL=postgresql://postgres.juuekovwshynwgjkqkbu:RiYx3Q6ZWjjGb8bx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## ✅ Post-Déploiement : Configurer Supabase

Dans Supabase Dashboard → Authentication → URL Configuration :

```
Site URL: https://targetym-app.onrender.com

Redirect URLs:
- https://targetym-app.onrender.com/auth/callback
- https://targetym-app.onrender.com/auth/reset-password
```

---

## 📚 Documentation Complète

- **Guide Détaillé** : `docs/RENDER_DEPLOYMENT_GUIDE.md`
- **Résumé** : `docs/DEPLOYMENT_SUMMARY.md`
- **Auth** : `docs/AUTH_PRODUCTION_GUIDE.md`

---

## 💰 Coût

- **Render Starter** : $7/mois (recommandé)
- **Supabase Free** : $0/mois
- **Total** : $7/mois

---

**🎉 C'est tout ! Votre app sera live en ~30 minutes !**
