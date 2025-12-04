#!/usr/bin/env python3
"""
Script pour ajouter automatiquement la protection CSRF a toutes les Server Actions
Wrap le contenu de withActionRateLimit avec withCSRFProtection
"""

import re
import os
from pathlib import Path
from typing import List, Tuple

# Fichiers index a ignorer
IGNORE_PATTERNS = ["index.ts"]

CSRF_IMPORT = "import { withCSRFProtection } from '@/src/lib/middleware/csrf-protection'"


def should_process_file(filepath: str) -> bool:
    """Verifie si le fichier doit etre traite"""
    if any(pattern in filepath for pattern in IGNORE_PATTERNS):
        return False
    return True


def has_csrf_import(content: str) -> bool:
    """Verifie si l'import CSRF existe deja"""
    return 'withCSRFProtection' in content


def has_rate_limit(content: str) -> bool:
    """Verifie si le fichier a deja withActionRateLimit"""
    return 'withActionRateLimit' in content


def add_csrf_import(content: str) -> str:
    """Ajoute l'import CSRF apres l'import de rate limiting"""
    lines = content.split('\n')

    # Trouver la ligne d'import de withActionRateLimit
    rate_limit_import_idx = -1
    for i, line in enumerate(lines):
        if 'withActionRateLimit' in line and 'import' in line:
            rate_limit_import_idx = i
            break

    if rate_limit_import_idx >= 0:
        # Inserer apres l'import rate limit
        lines.insert(rate_limit_import_idx + 1, CSRF_IMPORT)
    else:
        # Trouver le dernier import
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') and 'from' in line:
                last_import_idx = i

        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, CSRF_IMPORT)

    return '\n'.join(lines)


def wrap_with_csrf(content: str) -> Tuple[str, bool]:
    """
    Wrap le contenu de withActionRateLimit avec withCSRFProtection

    AVANT: return withActionRateLimit('type', async () => { ... })
    APRES: return withActionRateLimit('type', async () => withCSRFProtection(async () => { ... }))
    """

    # Pattern pour trouver withActionRateLimit avec son contenu
    # On cherche: return withActionRateLimit('type', async () => {
    pattern = r"return withActionRateLimit\('(\w+)',\s*async\s*\(\)\s*=>\s*\{"

    match = re.search(pattern, content)
    if not match:
        return content, False

    rate_limit_type = match.group(1)
    start_pos = match.end() - 1  # Position du { apres async () =>

    # Trouver l'accolade fermante correspondante
    brace_count = 1
    pos = start_pos + 1

    while pos < len(content) and brace_count > 0:
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
        pos += 1

    # pos est maintenant a la position apres le }
    # Mais on doit reculer pour trouver le vrai } du withActionRateLimit
    # qui est avant les 2 parentheses fermantes finales ))

    # Chercher les )) finaux
    end_pos = pos
    while end_pos < len(content) and content[end_pos:end_pos+2] != '))':
        end_pos += 1

    # Le } du body est juste avant les ))
    body_end = end_pos - 1
    while body_end > start_pos and content[body_end] != '}':
        body_end -= 1

    # Extraire le corps (sans les accolades externes)
    body_content = content[start_pos + 1:body_end]

    # Indenter le contenu (ajouter 2 espaces)
    lines = body_content.split('\n')
    indented_lines = []
    for line in lines:
        if line.strip():
            indented_lines.append('  ' + line)
        else:
            indented_lines.append(line)

    indented_body = '\n'.join(indented_lines)

    # Creer le nouveau corps avec CSRF wrapper
    new_body = f" {{\n  return withCSRFProtection(async () => {{{indented_body}\n  }})\n}}"

    # Remplacer dans le contenu
    new_content = content[:start_pos] + new_body + content[body_end + 1:]

    return new_content, True


def process_file(filepath: str) -> Tuple[bool, str]:
    """Traite un fichier action"""
    print(f"\nTraitement: {filepath}")

    if not os.path.exists(filepath):
        print(f"  [WARN] Fichier non trouve")
        return False, "not_found"

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verifier si deja protege
        if has_csrf_import(content):
            print(f"  [SKIP] Deja protege CSRF")
            return False, "already_protected"

        # Verifier si rate limiting est present
        if not has_rate_limit(content):
            print(f"  [SKIP] Pas de rate limiting (pre-requis)")
            return False, "no_rate_limit"

        # Ajouter l'import CSRF
        content = add_csrf_import(content)
        print(f"  [OK] Import CSRF ajoute")

        # Wrapper avec CSRF
        content, wrapped = wrap_with_csrf(content)

        if not wrapped:
            print(f"  [ERR] Echec du wrapping CSRF")
            return False, "wrap_failed"

        # Ecrire le fichier
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  [OK] Protection CSRF ajoutee")
        return True, "success"

    except Exception as e:
        print(f"  [ERR] Erreur: {e}")
        import traceback
        traceback.print_exc()
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
    print("AJOUT AUTOMATIQUE DE PROTECTION CSRF")
    print("=" * 60)

    os.chdir(r'D:\targetym')

    action_files = find_all_action_files()

    if not action_files:
        print("\n[ERR] Aucun fichier action trouve")
        return

    print(f"\n[INFO] {len(action_files)} fichiers a traiter")

    stats = {
        'success': 0,
        'already_protected': 0,
        'no_rate_limit': 0,
        'errors': 0,
    }

    for filepath in action_files:
        success, result = process_file(filepath)

        if success:
            stats['success'] += 1
        elif result == 'already_protected':
            stats['already_protected'] += 1
        elif result == 'no_rate_limit':
            stats['no_rate_limit'] += 1
        else:
            stats['errors'] += 1

    print("\n" + "=" * 60)
    print("[SUCCESS] TERMINE!")
    print(f"   Fichiers traites: {stats['success']}/{len(action_files)}")
    print(f"   Deja proteges: {stats['already_protected']}")
    print(f"   Sans rate limit: {stats['no_rate_limit']}")
    print(f"   Erreurs: {stats['errors']}")
    print("=" * 60)


if __name__ == '__main__':
    main()
