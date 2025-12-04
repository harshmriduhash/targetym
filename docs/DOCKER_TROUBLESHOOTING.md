# 🐳 Guide de Dépannage Docker + Supabase

## ❌ Erreur Actuelle

```
failed to inspect service: request returned 500 Internal Server Error
for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/containers/supabase_db_targetym/json,
check if the server supports the requested API version
```

**Cause**: Le daemon Docker Desktop ne répond pas correctement ou est corrompu.

---

## 🚨 Solution Rapide (90% des cas)

### Étape 1: Redémarrer Docker Desktop

**Windows**:
1. Ouvrez **Docker Desktop** depuis le menu Démarrer
2. Si déjà ouvert, faites un clic droit sur l'icône Docker dans la barre des tâches
3. Cliquez sur **"Quit Docker Desktop"**
4. Attendez 10 secondes
5. Relancez **Docker Desktop** depuis le menu Démarrer
6. Attendez que l'icône Docker soit verte (peut prendre 1-2 minutes)

**Ou via PowerShell (Admin)**:
```powershell
# Arrêter Docker Desktop
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue

# Attendre 10 secondes
Start-Sleep -Seconds 10

# Relancer Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Étape 2: Vérifier que Docker fonctionne

```bash
# Attendre que Docker soit prêt
docker info

# Devrait afficher des informations sans erreur
```

### Étape 3: Démarrer Supabase

```bash
npm run supabase:start
```

---

## 🔧 Solution Avancée (Si l'erreur persiste)

### Option A: Nettoyer les Conteneurs Supabase

```bash
# 1. Arrêter Supabase proprement (peut échouer avec l'erreur actuelle)
npm run supabase:stop

# 2. Si l'erreur persiste, forcer l'arrêt avec Docker
docker stop $(docker ps -aq --filter "name=supabase") 2>/dev/null
docker rm $(docker ps -aq --filter "name=supabase") 2>/dev/null

# 3. Nettoyer les volumes (ATTENTION: perd les données locales)
docker volume ls --filter "name=supabase"
docker volume rm $(docker volume ls -q --filter "name=supabase") 2>/dev/null

# 4. Redémarrer proprement
npm run supabase:start
```

### Option B: Reset Complet Docker Desktop

**⚠️ ATTENTION**: Cette méthode supprime TOUS vos conteneurs et volumes Docker!

1. Ouvrir Docker Desktop
2. Cliquer sur l'icône ⚙️ (Settings)
3. Aller dans **"Troubleshoot"**
4. Cliquer sur **"Clean / Purge data"**
5. Confirmer
6. Redémarrer Docker Desktop
7. Réessayer `npm run supabase:start`

---

## 🔍 Diagnostic Avancé

### Vérifier l'état de Docker

```bash
# Vérifier la version Docker
docker --version

# Tester la connexion au daemon
docker info

# Lister tous les conteneurs (y compris arrêtés)
docker ps -a

# Vérifier les volumes
docker volume ls

# Vérifier l'utilisation des ressources
docker system df
```

### Vérifier les Ports

Supabase utilise plusieurs ports. Vérifiez qu'ils sont libres:

**Windows PowerShell**:
```powershell
# Ports Supabase par défaut
$ports = 54321, 54322, 54323, 54324, 54325, 54326

foreach ($port in $ports) {
    $connection = netstat -ano | findstr ":$port"
    if ($connection) {
        Write-Host "Port $port is in use:"
        Write-Host $connection
    } else {
        Write-Host "Port $port is free"
    }
}
```

**Ports Supabase**:
- **54321**: API Gateway
- **54322**: PostgreSQL Database
- **54323**: Supabase Studio (UI)
- **54324**: Inbucket (Email testing)
- **54325**: Auth Server
- **54326**: Storage

**Si un port est occupé**:
```powershell
# Trouver le processus qui utilise le port (exemple: 54321)
netstat -ano | findstr :54321

# Le PID est dans la dernière colonne
# Tuer le processus (remplacer 12345 par le PID trouvé)
taskkill /PID 12345 /F
```

---

## 🛠️ Solutions par Type d'Erreur

### Erreur: "Cannot connect to Docker daemon"

**Cause**: Docker Desktop n'est pas démarré

**Solution**:
1. Lancer Docker Desktop
2. Attendre que l'icône soit verte
3. Réessayer

---

### Erreur: "port is already allocated"

**Cause**: Un port Supabase est déjà utilisé

**Solution**:
```bash
# Trouver quel port est bloqué (l'erreur l'indique)
# Exemple: port 54321

# Windows PowerShell
netstat -ano | findstr :54321

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F

# Redémarrer Supabase
npm run supabase:start
```

---

### Erreur: "volume is in use"

**Cause**: Des conteneurs arrêtés utilisent encore les volumes

**Solution**:
```bash
# Supprimer tous les conteneurs arrêtés
docker container prune -f

# Supprimer les volumes orphelins
docker volume prune -f

# Redémarrer
npm run supabase:start
```

---

### Erreur: "API version not supported"

**Cause**: Incompatibilité entre Docker CLI et Docker Desktop

**Solution**:
1. Mettre à jour Docker Desktop vers la dernière version
2. Ou forcer une version API compatible:
```bash
# Définir la variable d'environnement (temporaire)
set DOCKER_API_VERSION=1.41
npm run supabase:start
```

---

## 🔄 Commandes de Nettoyage Complètes

### Nettoyage Léger (Recommandé)

```bash
# Arrêter Supabase
npm run supabase:stop

# Nettoyer les conteneurs arrêtés
docker container prune -f

# Nettoyer les volumes inutilisés
docker volume prune -f

# Redémarrer
npm run supabase:start
```

### Nettoyage Moyen

```bash
# Arrêter TOUS les conteneurs
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)

# Supprimer les volumes Supabase uniquement
docker volume rm $(docker volume ls -q --filter "name=supabase")

# Redémarrer
npm run supabase:start
```

### Nettoyage Complet (⚠️ Perd TOUTES les données Docker)

```bash
# ATTENTION: Supprime TOUT dans Docker!
docker system prune -a --volumes -f

# Redémarrer
npm run supabase:start
```

---

## 📊 Vérifier que Supabase Fonctionne

Après `npm run supabase:start`, vérifiez:

```bash
# Voir le statut
supabase status

# Devrait afficher:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# ...
```

**Tester manuellement**:
1. **Studio UI**: http://localhost:54323
2. **API Health**: http://localhost:54321/rest/v1/
3. **PostgreSQL**:
   ```bash
   psql -h localhost -p 54322 -U postgres -d postgres
   # Password: postgres
   ```

---

## 🐛 Logs de Débogage

### Voir les logs Supabase

```bash
# Logs en temps réel
docker logs -f supabase_db_targetym

# Logs des autres services
docker logs -f supabase_kong_targetym
docker logs -f supabase_auth_targetym
docker logs -f supabase_rest_targetym
docker logs -f supabase_storage_targetym
```

### Voir les logs Docker Desktop

**Windows**:
1. Docker Desktop → Troubleshoot → Get support
2. Ou ouvrir: `%LOCALAPPDATA%\Docker\log.txt`

---

## 🔧 Configuration Docker Desktop

### Augmenter les Ressources (Si lent)

1. Docker Desktop → Settings → Resources
2. Augmenter:
   - **CPUs**: 4+ (si disponible)
   - **Memory**: 8 GB+ (recommandé pour Supabase)
   - **Disk image size**: 60 GB+

### Utiliser WSL 2 (Recommandé pour Windows)

1. Docker Desktop → Settings → General
2. ✅ Activer **"Use the WSL 2 based engine"**
3. Appliquer et redémarrer

---

## 📝 Checklist de Dépannage

Essayez dans cet ordre:

- [ ] 1. Redémarrer Docker Desktop
- [ ] 2. Vérifier `docker info` fonctionne
- [ ] 3. `npm run supabase:stop`
- [ ] 4. `docker container prune -f`
- [ ] 5. `npm run supabase:start`
- [ ] 6. Si échec: vérifier les ports occupés
- [ ] 7. Si échec: nettoyer les volumes
- [ ] 8. Si échec: reset complet Docker Desktop
- [ ] 9. Si échec: réinstaller Docker Desktop

---

## 🆘 Support Supplémentaire

Si le problème persiste:

1. **Logs Supabase**:
   ```bash
   npm run supabase:start > supabase-start.log 2>&1
   ```
   Partagez le contenu de `supabase-start.log`

2. **Info Système**:
   ```bash
   docker version
   docker info
   docker ps -a
   docker volume ls
   ```

3. **Version Supabase CLI**:
   ```bash
   supabase --version
   ```

4. **GitHub Issues**:
   - [Supabase CLI Issues](https://github.com/supabase/cli/issues)
   - [Docker Desktop Issues](https://github.com/docker/for-win/issues)

---

## 🎯 Solution Rapide Résumée

```bash
# 1. Redémarrer Docker Desktop (manuellement ou via PowerShell)

# 2. Attendre que Docker soit prêt
docker info

# 3. Nettoyer (si nécessaire)
docker stop $(docker ps -aq --filter "name=supabase") 2>/dev/null
docker rm $(docker ps -aq --filter "name=supabase") 2>/dev/null

# 4. Démarrer Supabase
npm run supabase:start

# 5. Vérifier
supabase status
```

---

**Si cette solution ne fonctionne pas, consultez les sections avancées ci-dessus.**

---

**Dernière mise à jour**: 2025-10-23
