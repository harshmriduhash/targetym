#!/usr/bin/env node
/**
 * Verify database state after deployment
 *
 * Performs comprehensive checks on database configuration, RLS policies,
 * triggers, and data integrity.
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL

/**
 * Database verification checks
 */
const VERIFICATION_CHECKS = [
  {
    name: 'Schema Migrations',
    query: `
      SELECT COUNT(*) as count
      FROM public.schema_migrations
    `,
    validate: (result) => {
      const count = parseInt(result.rows[0].count)
      if (count >= 28) {
        console.log(`   ✅ ${count} migrations applied`)
        return true
      } else {
        console.log(`   ❌ Only ${count} migrations found (expected >= 28)`)
        return false
      }
    }
  },
  {
    name: 'Organizations Table',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
      ) as exists
    `,
    validate: (result) => {
      if (result.rows[0].exists) {
        console.log('   ✅ Organizations table exists')
        return true
      } else {
        console.log('   ❌ Organizations table missing')
        return false
      }
    }
  },
  {
    name: 'Profiles Table',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
      ) as exists
    `,
    validate: (result) => {
      if (result.rows[0].exists) {
        console.log('   ✅ Profiles table exists')
        return true
      } else {
        console.log('   ❌ Profiles table missing')
        return false
      }
    }
  },
  {
    name: 'Profile Creation Trigger',
    query: `
      SELECT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
      ) as exists
    `,
    validate: (result) => {
      if (result.rows[0].exists) {
        console.log('   ✅ Profile creation trigger exists')
        return true
      } else {
        console.log('   ⚠️  Profile creation trigger not found')
        return false
      }
    }
  },
  {
    name: 'RLS Enabled on All Tables',
    query: `
      SELECT
        COUNT(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
        COUNT(*) as total_tables
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
        AND tablename != 'schema_migrations'
    `,
    validate: (result) => {
      const { rls_enabled, total_tables } = result.rows[0]
      if (parseInt(rls_enabled) === parseInt(total_tables)) {
        console.log(`   ✅ All ${total_tables} tables have RLS enabled`)
        return true
      } else {
        console.log(`   ⚠️  ${rls_enabled}/${total_tables} tables have RLS`)
        return false
      }
    }
  },
  {
    name: 'RLS Policies Count',
    query: `
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
    `,
    validate: (result) => {
      const count = parseInt(result.rows[0].count)
      if (count >= 50) {
        console.log(`   ✅ ${count} RLS policies configured`)
        return true
      } else {
        console.log(`   ⚠️  Only ${count} RLS policies (expected >= 50)`)
        return false
      }
    }
  },
  {
    name: 'Database Functions',
    query: `
      SELECT COUNT(*) as count
      FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
        AND prokind = 'f'
    `,
    validate: (result) => {
      const count = parseInt(result.rows[0].count)
      if (count >= 5) {
        console.log(`   ✅ ${count} database functions defined`)
        return true
      } else {
        console.log(`   ⚠️  Only ${count} functions found`)
        return false
      }
    }
  },
  {
    name: 'Database Views',
    query: `
      SELECT COUNT(*) as count
      FROM information_schema.views
      WHERE table_schema = 'public'
    `,
    validate: (result) => {
      const count = parseInt(result.rows[0].count)
      console.log(`   ℹ️  ${count} database views configured`)
      return true
    }
  },
  {
    name: 'Storage Buckets',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'storage'
        AND table_name = 'buckets'
      ) as exists
    `,
    validate: (result) => {
      if (result.rows[0].exists) {
        console.log('   ✅ Storage system configured')
        return true
      } else {
        console.log('   ⚠️  Storage system not found')
        return false
      }
    }
  },
  {
    name: 'Key Tables Present',
    query: `
      SELECT
        COUNT(*) FILTER (WHERE tablename = 'goals') as goals,
        COUNT(*) FILTER (WHERE tablename = 'job_postings') as jobs,
        COUNT(*) FILTER (WHERE tablename = 'performance_reviews') as reviews,
        COUNT(*) FILTER (WHERE tablename = 'candidates') as candidates
      FROM pg_tables
      WHERE schemaname = 'public'
    `,
    validate: (result) => {
      const { goals, jobs, reviews, candidates } = result.rows[0]
      const allPresent = goals && jobs && reviews && candidates
      if (allPresent) {
        console.log('   ✅ All core module tables present')
        return true
      } else {
        console.log('   ❌ Missing core tables:')
        if (!goals) console.log('      - goals')
        if (!jobs) console.log('      - job_postings')
        if (!reviews) console.log('      - performance_reviews')
        if (!candidates) console.log('      - candidates')
        return false
      }
    }
  }
]

/**
 * Run verification checks
 */
async function verifyDatabase() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully\n')

    console.log('🔍 Running verification checks...\n')
    console.log('━'.repeat(60))

    let passedChecks = 0
    let totalChecks = VERIFICATION_CHECKS.length

    for (const check of VERIFICATION_CHECKS) {
      console.log(`\n📋 ${check.name}`)
      try {
        const result = await client.query(check.query)
        if (check.validate(result)) {
          passedChecks++
        }
      } catch (error) {
        console.log(`   ❌ Check failed: ${error.message}`)
      }
    }

    console.log('\n' + '━'.repeat(60))
    console.log(`\n📊 Verification Results: ${passedChecks}/${totalChecks} checks passed`)

    if (passedChecks === totalChecks) {
      console.log('✅ All verification checks passed')
      return true
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log('⚠️  Most checks passed, but some warnings found')
      return true
    } else {
      console.log('❌ Critical verification checks failed')
      return false
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
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
  console.log('🔍 DATABASE VERIFICATION')
  console.log('━'.repeat(60))
  console.log('')

  const success = await verifyDatabase()

  console.log('')
  console.log('━'.repeat(60))
  if (success) {
    console.log('🎉 VERIFICATION COMPLETE')
  } else {
    console.log('❌ VERIFICATION FAILED')
  }
  console.log('━'.repeat(60))

  process.exit(success ? 0 : 1)
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
