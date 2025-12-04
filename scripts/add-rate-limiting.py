#!/usr/bin/env python3
"""
Script pour ajouter automatiquement le rate limiting a toutes les Server Actions
qui n'en ont pas encore
"""

import re
import os
from pathlib import Path
from typing import List, Tuple

# Fichiers deja proteges (a ignorer)
ALREADY_PROTECTED = [
    "src/actions/kpis/update-kpi.ts",
    "src/actions/kpis/delete-kpi.ts",
    "src/actions/kpis/create-kpi.ts",
    "src/actions/kpis/create-kpi-alert.ts",
    "src/actions/kpis/add-kpi-measurement.ts",
    "src/actions/goals/create-goal.ts",
]

# Fichiers index a ignorer
IGNORE_PATTERNS = ["index.ts"]

RATE_LIMIT_IMPORT = "import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'"


def should_process_file(filepath: str) -> bool:
    """Verifie si le fichier doit etre traite"""
    # Ignorer les fichiers deja proteges
    if filepath in ALREADY_PROTECTED:
        return False

    # Ignorer les index.ts
    if any(pattern in filepath for pattern in IGNORE_PATTERNS):
        return False

    return True


def determine_rate_limit_type(filepath: str, function_name: str) -> str:
    """Determine le type de rate limit base sur le nom du fichier/fonction"""

    # AI operations
    if 'ai/' in filepath or any(keyword in function_name.lower() for keyword in ['score', 'synthesize', 'recommend', 'ai']):
        return 'ai'

    # Bulk operations
    if 'bulk' in function_name.lower():
        return 'bulk'

    # Create operations
    if function_name.startswith('create'):
        return 'create'

    # Default pour le reste
    return 'default'


def has_rate_limit_import(content: str) -> bool:
    """Verifie si l'import rate limit existe deja"""
    return 'withActionRateLimit' in content


def add_rate_limit_import(content: str) -> str:
    """Ajoute l'import rate limit apres les autres imports"""
    lines = content.split('\n')

    # Trouver la derniere ligne d'import
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import ') and 'from' in line:
            last_import_idx = i

    if last_import_idx >= 0:
        # Inserer apres le dernier import
        lines.insert(last_import_idx + 1, RATE_LIMIT_IMPORT)
    else:
        # Pas d'imports trouves, ajouter apres 'use server'
        for i, line in enumerate(lines):
            if "'use server'" in line or '"use server"' in line:
                lines.insert(i + 2, RATE_LIMIT_IMPORT)
                break

    return '\n'.join(lines)


def extract_function_info(content: str) -> Tuple[str, int, int]:
    """Extrait le nom de la fonction et ses positions de debut/fin"""

    # Pattern pour trouver export async function
    pattern = r'export\s+async\s+function\s+(\w+)\s*\([^)]*\)[^{]*{'
    match = re.search(pattern, content)

    if not match:
        return None, -1, -1

    function_name = match.group(1)
    start_pos = match.start()

    # Trouver l'accolade ouvrante
    brace_start = content.index('{', start_pos)

    # Trouver l'accolade fermante correspondante
    brace_count = 1
    pos = brace_start + 1
    while pos < len(content) and brace_count > 0:
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
        pos += 1

    brace_end = pos - 1

    return function_name, brace_start, brace_end


def wrap_with_rate_limit(content: str, rate_limit_type: str) -> Tuple[str, bool]:
    """Enveloppe la fonction avec withActionRateLimit"""

    # Extraire les infos de la fonction
    function_name, brace_start, brace_end = extract_function_info(content)

    if function_name is None:
        return content, False

    # Extraire le corps de la fonction (sans les accolades)
    function_body = content[brace_start + 1:brace_end]

    # Indenter le corps de la fonction (ajouter 2 espaces)
    indented_body = '\n'.join(
        '  ' + line if line.strip() else line
        for line in function_body.split('\n')
    )

    # Creer le nouveau corps avec le wrapper
    new_body = f" {{\n  return withActionRateLimit('{rate_limit_type}', async () => {{{indented_body}\n  }})\n}}"

    # Remplacer dans le contenu
    new_content = content[:brace_start] + new_body + content[brace_end + 1:]

    return new_content, True


def process_file(filepath: str) -> Tuple[bool, str]:
    """Traite un fichier action"""
    print(f"\nTraitement: {filepath}")

    if not os.path.exists(filepath):
        print(f"  [WARN] Fichier non trouve, ignore")
        return False, "not_found"

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verifier si deja protege
        if has_rate_limit_import(content):
            print(f"  [OK] Deja protege")
            return False, "already_protected"

        # Verifier si c'est bien un fichier avec export async function
        if 'export async function' not in content:
            print(f"  [SKIP] Pas de fonction exportee trouvee")
            return False, "no_function"

        # Extraire le nom de la fonction
        function_name, _, _ = extract_function_info(content)
        if function_name is None:
            print(f"  [ERR] Impossible d'extraire la fonction")
            return False, "parse_error"

        # Determiner le type de rate limit
        rate_limit_type = determine_rate_limit_type(filepath, function_name)
        print(f"  [INFO] Fonction: {function_name}, Type: '{rate_limit_type}'")

        # Ajouter l'import
        content = add_rate_limit_import(content)
        print(f"  [OK] Import ajoute")

        # Envelopper avec rate limit
        content, wrapped = wrap_with_rate_limit(content, rate_limit_type)

        if not wrapped:
            print(f"  [ERR] Echec du wrapping")
            return False, "wrap_failed"

        # Ecrire le fichier
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  [OK] Rate limiting ajoute ({rate_limit_type})")
        return True, rate_limit_type

    except Exception as e:
        print(f"  [ERR] Erreur: {e}")
        return False, "error"


def find_all_action_files() -> List[str]:
    """Trouve tous les fichiers dans src/actions/"""
    action_files = []
    actions_dir = Path('src/actions')

    if not actions_dir.exists():
        print("[ERR] Repertoire src/actions non trouve")
        return []

    for ts_file in actions_dir.rglob('*.ts'):
        filepath = str(ts_file).replace('\\', '/')
        if should_process_file(filepath):
            action_files.append(filepath)

    return sorted(action_files)


def main():
    """Point d'entree principal"""
    print("=" * 60)
    print("AJOUT AUTOMATIQUE DE RATE LIMITING")
    print("=" * 60)

    os.chdir(r'D:\targetym')

    # Trouver tous les fichiers actions
    action_files = find_all_action_files()

    if not action_files:
        print("\n[ERR] Aucun fichier action trouve")
        return

    print(f"\n[INFO] {len(action_files)} fichiers a traiter")

    stats = {
        'success': 0,
        'already_protected': 0,
        'no_function': 0,
        'errors': 0,
        'by_type': {
            'create': 0,
            'default': 0,
            'ai': 0,
            'bulk': 0,
        }
    }

    for filepath in action_files:
        success, result = process_file(filepath)

        if success:
            stats['success'] += 1
            stats['by_type'][result] += 1
        elif result == 'already_protected':
            stats['already_protected'] += 1
        elif result == 'no_function':
            stats['no_function'] += 1
        else:
            stats['errors'] += 1

    print("\n" + "=" * 60)
    print("[SUCCESS] TERMINE!")
    print(f"   Fichiers traites: {stats['success']}/{len(action_files)}")
    print(f"   Deja proteges: {stats['already_protected']}")
    print(f"   Sans fonction: {stats['no_function']}")
    print(f"   Erreurs: {stats['errors']}")
    print("\n[INFO] Par type de rate limit:")
    for limit_type, count in stats['by_type'].items():
        if count > 0:
            print(f"   - {limit_type}: {count}")
    print("=" * 60)


if __name__ == '__main__':
    main()
