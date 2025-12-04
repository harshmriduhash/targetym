#!/usr/bin/env python3
"""
Fix duplicate closing braces in Server Actions
This script fixes the pattern where withActionRateLimit and withCSRFProtection
wrappers have extra closing braces
"""

import os
import re
from pathlib import Path

def fix_action_file(file_path):
    """Fix the closing braces pattern in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to fix: extra empty lines and closing braces
    # Before:
    #         }
    #
    #
    #     })
    #   })
    #
    #   })
    # }
    #
    # After:
    #         }
    #     })
    #   })
    # }

    # Remove the extra })  before the final }
    pattern1 = r'}\s*\n\s*\n\s*\}\)\s*\n\s*\}\)\s*\n\s*\n\s*\}\)\s*\n}'
    replacement1 = '}\n    })\n  })\n}'

    content_fixed = re.sub(pattern1, replacement1, content)

    if content_fixed != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content_fixed)
        return True
    return False

def main():
    """Fix all action files"""
    actions_dir = Path('src/actions')
    fixed_count = 0

    for file_path in actions_dir.rglob('*.ts'):
        if file_path.is_file():
            if fix_action_file(file_path):
                print(f'Fixed: {file_path}')
                fixed_count += 1

    print(f'\nTotal files fixed: {fixed_count}')

if __name__ == '__main__':
    main()
