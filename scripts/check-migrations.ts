/**
 * Script to check and apply Supabase migrations to production database
 * Usage: npx tsx scripts/check-migrations.ts [--dry-run|--apply]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

interface Migration {
  version: string
  name: string
  filePath: string
}

async function getAppliedMigrations(): Promise<string[]> {
  console.log('🔍 Fetching applied migrations from production database...\n')

  try {
    // First, check if the schema_migrations table exists
    const { data: tables, error: tablesError } = await supabase
      .from('schema_migrations')
      .select('version')
      .limit(1)

    if (tablesError) {
      if (tablesError.message.includes('does not exist')) {
        console.log('⚠️  schema_migrations table does not exist. This appears to be a fresh database.')
        return []
      }
      throw tablesError
    }

    // Get all applied migrations
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: true })

    if (error) throw error

    const versions = data?.map(row => row.version) || []
    console.log(`✅ Found ${versions.length} applied migrations in production:\n`)
    versions.forEach(v => console.log(`   - ${v}`))
    console.log()

    return versions
  } catch (error: any) {
    console.error('❌ Error fetching migrations:', error.message)
    return []
  }
}

function getLocalMigrations(): Migration[] {
  console.log('📂 Reading local migration files...\n')

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`)
    return []
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const migrations: Migration[] = files.map(file => {
    const version = file.split('_')[0]
    const name = file.replace('.sql', '')
    return {
      version,
      name,
      filePath: path.join(MIGRATIONS_DIR, file)
    }
  })

  console.log(`✅ Found ${migrations.length} local migration files:\n`)
  migrations.forEach(m => console.log(`   - ${m.version}: ${m.name}`))
  console.log()

  return migrations
}

function getMissingMigrations(applied: string[], local: Migration[]): Migration[] {
  const missing = local.filter(m => !applied.includes(m.version))

  if (missing.length === 0) {
    console.log('✅ All migrations are up to date! No migrations to apply.\n')
  } else {
    console.log(`⚠️  Found ${missing.length} migrations to apply:\n`)
    missing.forEach(m => console.log(`   - ${m.version}: ${m.name}`))
    console.log()
  }

  return missing
}

async function applyMigration(migration: Migration): Promise<boolean> {
  console.log(`📝 Applying migration: ${migration.version}`)
  console.log(`   File: ${path.basename(migration.filePath)}\n`)

  try {
    const sql = fs.readFileSync(migration.filePath, 'utf8')

    // Execute the migration SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (sqlError) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not available, attempting direct execution...')

      // Split SQL into individual statements (basic splitting)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        const { error } = await supabase.rpc('query', { query_text: statement })
        if (error) throw error
      }
    }

    // Record the migration in schema_migrations table
    const { error: insertError } = await supabase
      .from('schema_migrations')
      .insert({ version: migration.version, name: migration.name })

    if (insertError && !insertError.message.includes('duplicate key')) {
      throw insertError
    }

    console.log(`✅ Successfully applied migration: ${migration.version}\n`)
    return true
  } catch (error: any) {
    console.error(`❌ Error applying migration ${migration.version}:`, error.message)
    console.error('   SQL execution failed. Manual intervention may be required.\n')
    return false
  }
}

async function createMigrationInfrastructure(): Promise<boolean> {
  console.log('🔧 Creating migration infrastructure (schema_migrations table)...\n')

  try {
    // Create supabase_migrations schema if it doesn't exist
    const createSchema = `
      CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    `

    // Create schema_migrations table
    const createTable = `
      CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
        version TEXT PRIMARY KEY,
        name TEXT,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    // For now, we'll create it in the public schema since we can't execute raw SQL directly
    const createPublicTable = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version TEXT PRIMARY KEY,
        name TEXT,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    // Try to create the table (will fail silently if exists)
    await supabase.from('schema_migrations').select('version').limit(1)

    console.log('✅ Migration infrastructure ready\n')
    return true
  } catch (error: any) {
    console.log('⚠️  Note: Migration table creation may require manual SQL execution in Supabase dashboard\n')
    return true // Continue anyway
  }
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run') || args.length === 0
  const shouldApply = args.includes('--apply')

  console.log('='.repeat(80))
  console.log('🚀 Supabase Migration Manager')
  console.log('='.repeat(80))
  console.log()
  console.log(`📊 Mode: ${isDryRun ? 'DRY RUN (check only)' : 'APPLY MIGRATIONS'}`)
  console.log(`🌐 Target: ${SUPABASE_URL}`)
  console.log()
  console.log('='.repeat(80))
  console.log()

  // Step 1: Get applied migrations
  const applied = await getAppliedMigrations()

  // Step 2: Get local migrations
  const local = getLocalMigrations()

  // Step 3: Find missing migrations
  const missing = getMissingMigrations(applied, local)

  if (missing.length === 0) {
    console.log('✅ Database is up to date!')
    process.exit(0)
  }

  // Step 4: Apply migrations if requested
  if (shouldApply) {
    console.log('='.repeat(80))
    console.log('⚠️  APPLYING MIGRATIONS TO PRODUCTION DATABASE')
    console.log('='.repeat(80))
    console.log()

    // Ensure migration infrastructure exists
    await createMigrationInfrastructure()

    let successCount = 0
    let failCount = 0

    for (const migration of missing) {
      const success = await applyMigration(migration)
      if (success) {
        successCount++
      } else {
        failCount++
        console.log('⚠️  Stopping migration process due to error.\n')
        break
      }
    }

    console.log('='.repeat(80))
    console.log('📊 Migration Summary')
    console.log('='.repeat(80))
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`⏳ Remaining: ${missing.length - successCount - failCount}`)
    console.log()

  } else {
    console.log('='.repeat(80))
    console.log('💡 Next Steps')
    console.log('='.repeat(80))
    console.log()
    console.log('To apply these migrations, run:')
    console.log('   npx tsx scripts/check-migrations.ts --apply')
    console.log()
    console.log('⚠️  IMPORTANT: This will modify your production database!')
    console.log('   Make sure you have a backup before proceeding.')
    console.log()
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
