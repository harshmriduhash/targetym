#!/usr/bin/env tsx
/**
 * Script pour régénérer les types TypeScript depuis Supabase
 * Usage: pnpm run supabase:types:remote
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!SUPABASE_PROJECT_REF) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment')
  console.log('💡 Make sure .env.local is configured')
  process.exit(1)
}

console.log('🔄 Generating TypeScript types from Supabase...')
console.log(`📦 Project: ${SUPABASE_PROJECT_REF}`)

try {
  // Générer les types
  const command = SUPABASE_ACCESS_TOKEN
    ? `./supabase.exe gen types typescript --project-id ${SUPABASE_PROJECT_REF} --access-token ${SUPABASE_ACCESS_TOKEN}`
    : `./supabase.exe gen types typescript --linked`

  console.log('⏳ Running:', command.replace(SUPABASE_ACCESS_TOKEN || '', '***'))
  
  const types = execSync(command, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  // Écrire dans le fichier
  const outputPath = join(process.cwd(), 'src', 'types', 'database.types.ts')
  writeFileSync(outputPath, types, 'utf-8')

  console.log('✅ Types generated successfully!')
  console.log(`📁 Output: ${outputPath}`)
  
  // Vérifier que webhook_events est présent
  if (types.includes('webhook_events')) {
    console.log('✅ webhook_events table found in types')
  } else {
    console.warn('⚠️  webhook_events table NOT found in types')
    console.warn('💡 Make sure the migration has been applied to production')
  }

} catch (error: any) {
  console.error('❌ Failed to generate types:', error.message)
  console.log('\n💡 Troubleshooting:')
  console.log('1. Check that Supabase CLI is installed: ./supabase.exe --version')
  console.log('2. Link your project: ./supabase.exe link --project-ref YOUR_PROJECT_REF')
  console.log('3. Or set SUPABASE_ACCESS_TOKEN in .env.local')
  process.exit(1)
}
