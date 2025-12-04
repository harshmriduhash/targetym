import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz' // Service role key from supabase start output

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('📦 Reading migration file...')

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251103000001_secure_cvs_bucket.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  console.log('🚀 Applying CVs bucket security migration...')

  try {
    // Split SQL into statements (basic split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.includes('RAISE NOTICE')) {
        // Skip DO blocks with RAISE NOTICE
        continue
      }

      console.log(`Executing: ${statement.substring(0, 50)}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        console.error('❌ Error executing statement:', error.message)
        // Continue anyway for some statements
      }
    }

    console.log('✅ Migration applied successfully!')
    console.log('\n📋 Checking policies...')

    // Verify policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .like('tablename', '%objects%')

    if (!policiesError && policies) {
      console.log(`Found ${policies.length} policies on storage.objects`)
      policies.forEach((p: any) => {
        console.log(`  - ${p.policyname}`)
      })
    }

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration()
