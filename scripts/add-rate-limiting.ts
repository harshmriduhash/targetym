/**
 * Script to add rate limiting to all Server Actions
 * Run with: npx tsx scripts/add-rate-limiting.ts
 */

import fs from 'fs/promises'
import path from 'path'

const ACTIONS_DIR = path.join(process.cwd(), 'src', 'actions')

// Rate limit type mapping based on action name
const rateLimitMap: Record<string, string> = {
  // Create actions
  'create-': 'create',
  'add-': 'create',

  // Bulk operations
  'bulk-': 'bulk',
  'batch-': 'bulk',

  // AI operations
  'ai-': 'ai',
  'score-cv': 'ai',
  'synthesize-': 'ai',
  'recommend-': 'ai',

  // Default for everything else
  'default': 'default',
}

function getRateLimitType(filename: string): string {
  for (const [key, value] of Object.entries(rateLimitMap)) {
    if (filename.includes(key)) {
      return value
    }
  }
  return 'default'
}

async function processFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8')

  // Skip if already has rate limiting
  if (content.includes('withActionRateLimit') || content.includes('withRateLimit')) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} - already has rate limiting`)
    return
  }

  // Skip if not a server action
  if (!content.includes("'use server'")) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} - not a server action`)
    return
  }

  const filename = path.basename(filePath, '.ts')
  const limitType = getRateLimitType(filename)

  // Add import
  const importStatement = `import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'`

  let updatedContent = content

  // Add import after existing imports (before first export)
  if (!updatedContent.includes(importStatement)) {
    const importSection = updatedContent.match(/^(import .+\n)+/m)
    if (importSection) {
      const lastImportIndex = updatedContent.indexOf(importSection[0]) + importSection[0].length
      updatedContent =
        updatedContent.slice(0, lastImportIndex) +
        importStatement +
        '\n' +
        updatedContent.slice(lastImportIndex)
    }
  }

  // Find all exported async functions
  const functionRegex = /export async function (\w+)\([^)]*\): Promise<ActionResponse<[^>]+>> \{/g
  let match
  const functions: string[] = []

  while ((match = functionRegex.exec(content)) !== null) {
    functions.push(match[1])
  }

  // Wrap each function with rate limiting
  for (const funcName of functions) {
    // Pattern: export async function name(...): Promise<ActionResponse<T>> {
    const funcPattern = new RegExp(
      `(export async function ${funcName}\\([^)]*\\): Promise<ActionResponse<[^>]+>> \\{)\\s*\\n([\\s\\S]*?)\\n(^\\})`,
      'm'
    )

    const funcMatch = updatedContent.match(funcPattern)
    if (funcMatch) {
      const [, funcDecl, funcBody, closingBrace] = funcMatch

      // Wrap the function body with withActionRateLimit
      const wrappedBody = `  return withActionRateLimit('${limitType}', async () => {\n${funcBody}\n  })`

      updatedContent = updatedContent.replace(
        funcPattern,
        `${funcDecl}\n${wrappedBody}\n${closingBrace}`
      )

      console.log(`✅ Added '${limitType}' rate limiting to ${funcName} in ${path.basename(filePath)}`)
    }
  }

  // Write back only if changes were made
  if (updatedContent !== content) {
    await fs.writeFile(filePath, updatedContent, 'utf-8')
  }
}

async function walkDirectory(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await walkDirectory(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      try {
        await processFile(fullPath)
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error)
      }
    }
  }
}

async function main() {
  console.log('🚀 Adding rate limiting to Server Actions...\n')

  try {
    await walkDirectory(ACTIONS_DIR)
    console.log('\n✅ Rate limiting migration completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Review the changes in src/actions/')
    console.log('2. Run type-check: npm run type-check')
    console.log('3. Test the rate-limited actions')
    console.log('4. Commit the changes')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
