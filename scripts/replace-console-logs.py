#!/usr/bin/env python3
"""
Script pour remplacer automatiquement console.log/error/warn par logger
dans tous les fichiers TypeScript/TSX
"""

import re
import os
from pathlib import Path

# Fichiers à traiter
FILES = [
    "src/components/recruitment/CandidateSelector.tsx",
    "src/components/recruitment/ScheduleInterviewModal.tsx",
    "src/components/settings/AISettings.tsx",
    "src/components/settings/AppearanceSettings.tsx",
    "src/components/settings/NotificationSettings.tsx",
    "src/components/settings/SecuritySettings.tsx",
    "src/lib/cache/browser-cache.ts",
    "src/lib/cache/redis-cache.ts",
    "src/lib/hooks/useSearch.ts",
    "src/lib/middleware/action-wrapper.ts",
    "src/lib/realtime/useRealtimeQuery.ts",
    "src/lib/realtime/useRealtimeSubscription.ts",
    "src/lib/utils/query-helpers.ts",
]

LOGGER_IMPORT = "import { logger } from '@/src/lib/monitoring/logger'"

def has_logger_import(content):
    """Vérifie si logger est déjà importé"""
    return "from '@/src/lib/monitoring/logger'" in content or \
           "from \"@/src/lib/monitoring/logger\"" in content

def add_logger_import(content):
    """Ajoute l'import logger après les autres imports"""
    lines = content.split('\n')

    # Trouver la dernière ligne d'import
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import ') and 'from' in line:
            last_import_idx = i

    if last_import_idx >= 0:
        # Insérer après le dernier import
        lines.insert(last_import_idx + 1, LOGGER_IMPORT)
    else:
        # Pas d'imports trouvés, ajouter au début
        lines.insert(0, LOGGER_IMPORT)

    return '\n'.join(lines)

def replace_console_logs(content):
    """Remplace console.* par logger.*"""

    # Patterns de remplacement
    replacements = [
        (r'console\.log\(', 'logger.info('),
        (r'console\.error\(', 'logger.error('),
        (r'console\.warn\(', 'logger.warn('),
        (r'console\.debug\(', 'logger.debug('),
        (r'console\.info\(', 'logger.info('),
    ]

    result = content
    count = 0

    for pattern, replacement in replacements:
        result, n = re.subn(pattern, replacement, result)
        count += n

    return result, count

def process_file(filepath):
    """Traite un fichier"""
    print(f"\nTraitement: {filepath}")

    if not os.path.exists(filepath):
        print(f"  [WARN] Fichier non trouve, ignore")
        return 0

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Compter console.* avant
        before_count = len(re.findall(r'console\.(?:log|error|warn|debug|info)\(', content))

        if before_count == 0:
            print(f"  [OK] Aucun console.log trouve")
            return 0

        # Ajouter import logger si nécessaire
        if not has_logger_import(content):
            content = add_logger_import(content)
            print(f"  [OK] Import logger ajoute")

        # Remplacer console.* par logger.*
        content, replaced_count = replace_console_logs(content)

        # Vérifier qu'on a tout remplacé
        after_count = len(re.findall(r'console\.(?:log|error|warn|debug|info)\(', content))

        # Écrire le fichier
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  [OK] {replaced_count} occurrences remplacees")

        if after_count > 0:
            print(f"  [WARN] {after_count} console.* restants (edge cases)")

        return replaced_count

    except Exception as e:
        print(f"  [ERR] Erreur: {e}")
        return 0

def main():
    """Point d'entrée principal"""
    print("=" * 60)
    print("REMPLACEMENT AUTOMATIQUE console.log -> logger")
    print("=" * 60)

    os.chdir(r'D:\targetym')

    total_replaced = 0
    files_processed = 0

    for filepath in FILES:
        count = process_file(filepath)
        if count > 0:
            files_processed += 1
            total_replaced += count

    print("\n" + "=" * 60)
    print(f"[SUCCESS] TERMINE!")
    print(f"   Fichiers traites: {files_processed}/{len(FILES)}")
    print(f"   Total remplacements: {total_replaced}")
    print("=" * 60)

if __name__ == '__main__':
    main()
