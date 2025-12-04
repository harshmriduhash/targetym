#!/usr/bin/env node
/**
 * Apply Supabase migrations in CI/CD environment
 *
 * This script reads the consolidated migration SQL and applies it to production database
 * using direct PostgreSQL connection (no Supabase CLI required)
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for verification
 */

const { readFileSync } = require('fs')
const { join } = require('path')
const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL
const MIGRATION_FILE = join(process.cwd(), 'supabase', 'consolidated-migration.sql')

/**
 * Validate environment
 */
function validateEnvironment() {
  console.log('🔍 Validating environment...')

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  try {
    readFileSync(MIGRATION_FILE, 'utf-8')
    console.log('✅ Migration file found:', MIGRATION_FILE)
  } catch (error) {
    console.error('❌ Migration file not found:', MIGRATION_FILE)
    console.error('   Run: npm run supabase:migrate')
    process.exit(1)
  }
}

/**
 * Apply migrations to database
 */
async function applyMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Supabase requires SSL
    }
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully')

    // Read migration SQL
    const sql = readFileSync(MIGRATION_FILE, 'utf-8')
    console.log('📄 Migration SQL loaded')

    // Execute migration
    console.log('⚡ Applying migrations...')
    console.log('━'.repeat(60))

    const result = await client.query(sql)

    console.log('━'.repeat(60))
    console.log('✅ Migrations applied successfully')

    // Verify migrations
    console.log('\n🔍 Verifying applied migrations...')
    const { rows } = await client.query(`
      SELECT version, applied_at
      FROM public.schema_migrations
      ORDER BY applied_at DESC
      LIMIT 10
    `)

    console.log('\n📊 Last 10 migrations applied:')
    rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.version} (${row.applied_at.toISOString()})`)
    })

    // Check RLS status
    console.log('\n🔒 Checking RLS status...')
    const { rows: rlsRows } = await client.query(`
      SELECT COUNT(*) as total_tables,
             SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) as tables_with_rls
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    `)

    const rlsStats = rlsRows[0]
    console.log(`   Total tables: ${rlsStats.total_tables}`)
    console.log(`   Tables with RLS: ${rlsStats.tables_with_rls}`)

    if (parseInt(rlsStats.total_tables) === parseInt(rlsStats.tables_with_rls)) {
      console.log('   ✅ All tables have RLS enabled')
    } else {
      console.log('   ⚠️  Some tables may not have RLS enabled')
    }

    // Count RLS policies
    const { rows: policyRows } = await client.query(`
      SELECT COUNT(*) as total_policies
      FROM pg_policies
      WHERE schemaname = 'public'
    `)

    console.log(`   Total RLS policies: ${policyRows[0].total_policies}`)

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\nError details:')
    console.error('  Name:', error.name)
    console.error('  Code:', error.code)
    if (error.position) {
      console.error('  Position:', error.position)
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

/**
 * Main function
 */
async function main() {
  console.log('━'.repeat(60))
  console.log('🚀 SUPABASE MIGRATION DEPLOYMENT')
  console.log('━'.repeat(60))
  console.log('')

  validateEnvironment()
  await applyMigrations()

  console.log('')
  console.log('━'.repeat(60))
  console.log('🎉 DEPLOYMENT COMPLETE')
  console.log('━'.repeat(60))
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
