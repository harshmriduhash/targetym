# Claude Code Hooks - Documentation

## Vue d'ensemble

Ce répertoire contient les hooks personnalisés pour Claude Code, permettant d'automatiser des actions à différents moments du workflow.

**Date de création :** 2025-11-08
**Runtime :** Bun (TypeScript)

---

## Hooks disponibles

### 1. `post-tool-use.ts` - Hook PostToolUse

**Type :** Command hook
**Runtime :** Bun
**Déclencheur :** Après chaque appel d'outil (Write, Edit, Bash, etc.)
**Timeout :** 10 secondes

#### Fonctionnalités

✅ **Logging automatique** :
- Enregistre chaque utilisation d'outil
- Log dans `.claude/logs/tool-usage.log`
- Format : `[timestamp] [LEVEL] Tool: ToolName | Input: {...}`

✅ **Statistiques d'utilisation** :
- Compte le nombre d'utilisations par outil
- Stocke dans `.claude/stats/tool-usage.json`
- Tracking de la dernière utilisation

✅ **Validation des outputs** :
- Vérifie que les outils se sont exécutés correctement
- Détecte les erreurs dans les sorties Bash
- Valide les opérations de fichiers (Write, Edit)
- Alerte sur les erreurs TypeScript

✅ **Notifications** :
- Notifie pour les outils importants (Write, Edit, Bash)
- Extensible vers Slack, Discord, etc.

#### Configuration

Le hook est configuré dans `.claude/settings.local.json` :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bun ${CLAUDE_PROJECT_DIR}/.claude/hooks/post-tool-use.ts",
            "timeout": 10,
            "description": "Track tool usage, validate outputs, and log activity"
          }
        ]
      }
    ]
  }
}
```

**Matchers disponibles :**
- `"*"` - Tous les outils (actuel)
- `"Write|Edit"` - Seulement Write et Edit
- `"Bash"` - Seulement les commandes Bash
- `"Notebook.*"` - Tous les outils Notebook

#### Personnalisation

Éditez `post-tool-use.ts` pour modifier le comportement :

```typescript
const CONFIG = {
  // Enable detailed logging
  verbose: true,

  // Log file path (relative to project root)
  logFile: ".claude/logs/tool-usage.log",

  // Tools to track (empty = all tools)
  trackedTools: [],

  // Tools to ignore
  ignoredTools: ["TodoWrite", "BashOutput"],

  // Enable notifications for specific tools
  notifyOnTools: ["Write", "Edit", "Bash"],

  // Enable performance tracking
  trackPerformance: true,
};
```

**Exemples de personnalisation :**

1. **Logger seulement les fichiers modifiés** :
```typescript
trackedTools: ["Write", "Edit"]
```

2. **Ignorer les commandes Git** :
```typescript
ignoredTools: ["TodoWrite", "BashOutput", "Bash(git*)"]
```

3. **Activer les notifications Slack** :
```typescript
// Ajouter dans notifyIfNeeded()
async function notifySlack(message: string) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({ text: message })
  });
}
```

#### Fichiers générés

Le hook crée automatiquement :

```
.claude/
├── logs/
│   └── tool-usage.log          # Logs détaillés de tous les outils
└── stats/
    └── tool-usage.json         # Statistiques d'utilisation
```

**Exemple `tool-usage.log` :**
```
[2025-11-08T10:30:15.234Z] [INFO] Tool: Write | Input: { file_path: "src/components/...", ... }
[2025-11-08T10:30:16.123Z] [INFO] 🔧 Tool used: Write
[2025-11-08T10:30:17.456Z] [INFO] Tool: Bash | Input: { command: "npm test", ... }
```

**Exemple `tool-usage.json` :**
```json
{
  "Write": {
    "count": 45,
    "lastUsed": "2025-11-08T10:30:15.234Z"
  },
  "Edit": {
    "count": 123,
    "lastUsed": "2025-11-08T10:28:42.567Z"
  },
  "Bash": {
    "count": 78,
    "lastUsed": "2025-11-08T10:30:17.456Z"
  }
}
```

---

## Utilisation

### Activer le hook

Le hook est déjà activé dans `.claude/settings.local.json`. Il s'exécute automatiquement.

### Désactiver temporairement

Commentez ou supprimez la section `hooks` dans `.claude/settings.local.json` :

```json
{
  // "hooks": { ... }
}
```

### Tester le hook

1. **Lancer Claude Code** :
```bash
cc  # alias pour claude --dangerously-skip-permissions
```

2. **Utiliser n'importe quel outil** :
```
Claude: [Uses Write tool to create a file]
```

3. **Vérifier les logs** :
```bash
cat .claude/logs/tool-usage.log
```

4. **Vérifier les statistiques** :
```bash
cat .claude/stats/tool-usage.json
```

### Déboguer le hook

Activer le mode verbose de Claude Code :

```bash
claude --debug
```

Vérifier les hooks enregistrés :

```
/hooks
```

Lire les erreurs dans les logs :

```bash
tail -f .claude/logs/tool-usage.log
```

---

## Sécurité

⚠️ **IMPORTANT** : Les hooks exécutent du code arbitraire sur votre système !

**Bonnes pratiques :**

1. ✅ **Toujours quoter les variables** :
```typescript
const path = `"${process.env.SOME_VAR}"`;
```

2. ✅ **Valider les entrées** :
```typescript
if (input.tool_name.includes("..")) {
  throw new Error("Path traversal detected");
}
```

3. ✅ **Utiliser des timeouts** :
```json
{
  "timeout": 10  // Max 10 secondes
}
```

4. ✅ **Tester en environnement safe** :
- Testez d'abord sur une branche Git
- Gardez un backup avant de modifier

5. ❌ **NE JAMAIS** :
- Exécuter de commandes utilisateur sans validation
- Accéder à des fichiers sensibles (.env, .git/config)
- Logger des secrets ou tokens
- Faire des opérations destructives sans confirmation

---

## Créer un nouveau hook

### 1. Créer le script

```bash
# Créer un nouveau hook
touch .claude/hooks/mon-hook.ts
chmod +x .claude/hooks/mon-hook.ts
```

### 2. Ajouter le shebang et le code

```typescript
#!/usr/bin/env bun
import { stdin } from "process";

async function main() {
  // Lire stdin
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));

  // Votre logique ici
  console.log(`Hook triggered for: ${input.tool_name}`);

  // Retourner la réponse
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

main();
```

### 3. Configurer dans settings.local.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bun ${CLAUDE_PROJECT_DIR}/.claude/hooks/mon-hook.ts",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### 4. Tester

```bash
claude --debug
# Utilisez un outil qui matche le matcher
```

---

## Types de hooks disponibles

### PreToolUse
S'exécute **avant** l'appel d'un outil.

**Use cases :**
- Valider les entrées
- Bloquer certaines opérations dangereuses
- Demander confirmation
- Modifier les inputs

**Exemple :**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(rm*)",
        "hooks": [
          {
            "type": "command",
            "command": "bun .claude/hooks/confirm-delete.ts"
          }
        ]
      }
    ]
  }
}
```

### PostToolUse ✅ (Actif)
S'exécute **après** l'appel d'un outil.

**Use cases :**
- Logging
- Validation des outputs
- Statistiques
- Notifications

### UserPromptSubmit
S'exécute quand l'utilisateur soumet un prompt.

**Use cases :**
- Valider le prompt
- Ajouter du contexte automatiquement
- Bloquer certains types de requêtes

### Stop
S'exécute quand l'agent principal termine.

**Use cases :**
- Cleanup
- Générer des rapports
- Envoyer des métriques

### SessionStart / SessionEnd
S'exécute au début/fin de session.

**Use cases :**
- Setup d'environnement
- Cleanup de ressources
- Analytics de session

---

## Exemples de hooks utiles

### 1. Hook de sauvegarde automatique

```typescript
// .claude/hooks/auto-backup.ts
// Crée un backup Git après chaque modification de fichier

const { tool_name } = input;

if (tool_name === "Write" || tool_name === "Edit") {
  await Bun.$`git add -A`;
  await Bun.$`git commit -m "Auto-backup: ${tool_name} at ${new Date().toISOString()}"`;
}
```

### 2. Hook de validation de sécurité

```typescript
// .claude/hooks/security-check.ts
// Bloque l'écriture dans des fichiers sensibles

const PROTECTED_FILES = [".env", ".env.local", "secrets.json"];

if (tool_name === "Write" || tool_name === "Edit") {
  const filePath = input.tool_input.file_path;

  if (PROTECTED_FILES.some(f => filePath.includes(f))) {
    console.log(JSON.stringify({
      continue: false,
      stopReason: "Protected file access denied",
      systemMessage: "⚠️ Cannot modify protected files"
    }));
    process.exit(2); // Exit 2 = blocking error
  }
}
```

### 3. Hook de notification Slack

```typescript
// .claude/hooks/slack-notify.ts
// Notifie l'équipe des déploiements

if (tool_name === "Bash" && input.tool_input.command.includes("deploy")) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🚀 Deployment triggered by Claude Code at ${new Date().toISOString()}`
    })
  });
}
```

### 4. Hook de test automatique

```typescript
// .claude/hooks/auto-test.ts
// Lance les tests après modification de code

if (tool_name === "Write" || tool_name === "Edit") {
  const filePath = input.tool_input.file_path;

  if (filePath.includes("src/") && filePath.endsWith(".ts")) {
    const result = await Bun.$`npm test -- --related ${filePath}`.quiet();

    if (result.exitCode !== 0) {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: `⚠️ Tests failed after modifying ${filePath}`
      }));
    }
  }
}
```

---

## Dépannage

### Le hook ne s'exécute pas

1. Vérifier que Bun est installé :
```bash
bun --version
```

2. Vérifier les permissions du script :
```bash
chmod +x .claude/hooks/post-tool-use.ts
```

3. Vérifier la configuration :
```bash
cat .claude/settings.local.json | grep -A 10 hooks
```

4. Activer le mode debug :
```bash
claude --debug
```

### Le hook plante

1. Vérifier les logs d'erreur :
```bash
tail -50 .claude/logs/tool-usage.log
```

2. Tester le script manuellement :
```bash
echo '{"tool_name":"Write","tool_input":{}}' | bun .claude/hooks/post-tool-use.ts
```

3. Vérifier le timeout (augmenter si nécessaire) :
```json
{
  "timeout": 30  // Augmenter à 30s
}
```

### Le hook est trop lent

1. Réduire le logging :
```typescript
verbose: false
```

2. Ignorer plus d'outils :
```typescript
ignoredTools: ["TodoWrite", "BashOutput", "Glob", "Grep"]
```

3. Désactiver le tracking :
```typescript
trackPerformance: false
```

---

## Ressources

- [Documentation officielle des hooks Claude Code](https://code.claude.com/docs/en/hooks)
- [Documentation Bun](https://bun.sh/docs)
- [Exemples de hooks](https://github.com/anthropics/claude-code/tree/main/examples/hooks)

---

## Changelog

### v1.0.0 - 2025-11-08
- ✅ Création du hook PostToolUse
- ✅ Logging automatique
- ✅ Statistiques d'utilisation
- ✅ Validation des outputs
- ✅ Support des notifications

### Roadmap
- [ ] Hook PreToolUse pour validation
- [ ] Intégration Slack/Discord
- [ ] Dashboard des statistiques
- [ ] Alertes sur anomalies
- [ ] Export des métriques (Prometheus)

---

**Auteur :** Claude Code
**Licence :** MIT
**Contact :** Voir WORKFLOW_PROPOSAL.md pour support
