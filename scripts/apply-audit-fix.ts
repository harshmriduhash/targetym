/**
 * Apply Audit Trigger Fix
 * Applies the SQL fix for the audit trigger directly to the database
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function applyFix() {
  console.log('🔧 Applying audit trigger fix...\n')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'apply-audit-fix.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('📝 Executing SQL fix...')

  // Split SQL into individual statements and execute them
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (!statement) continue

    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' } as any)

    if (error) {
      console.error('❌ Error executing statement:')
      console.error(statement.substring(0, 100) + '...')
      console.error('Error:', error.message)

      // Try alternative approach using pg_catalog
      console.log('\n⚠️  Trying alternative approach...')

      // For CREATE FUNCTION, we need special handling
      if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const { error: altError } = await supabase.rpc('pg_catalog', {
          query: statement
        } as any)

        if (altError) {
          console.error('❌ Alternative approach failed:', altError.message)
          return false
        }
      } else {
        return false
      }
    } else {
      console.log('✅ Statement executed successfully')
    }
  }

  console.log('\n✅ Audit trigger fix applied successfully!')
  return true
}

applyFix()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All done! You can now test user signup.')
      process.exit(0)
    } else {
      console.error('\n❌ Fix application failed')
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
