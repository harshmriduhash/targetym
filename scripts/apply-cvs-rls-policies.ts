import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Script to apply RLS policies for CVS storage bucket
 * Run with: npx tsx scripts/apply-cvs-rls-policies.ts
 */

async function applyCVSRLSPolicies() {
  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🚀 Starting CVS RLS policies application...')
  console.log(`📡 Connecting to: ${supabaseUrl}`)

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251010000001_create_cvs_storage_bucket.sql')

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  console.log('📄 Migration file loaded')

  try {
    // Execute the migration SQL
    console.log('⏳ Applying migration...')

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // If exec_sql doesn't exist, try using the REST API directly
      console.log('⚠️  exec_sql RPC not available, trying direct SQL execution...')

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        console.log(`📝 Executing: ${statement.substring(0, 80)}...`)

        const { error: execError } = await supabase.rpc('exec', { sql: statement + ';' })

        if (execError) {
          console.error(`❌ Error executing statement: ${execError.message}`)
          console.error(`Statement: ${statement}`)
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully')
        }
      }
    } else {
      console.log('✅ Migration applied successfully!')
    }

    // Verify the policies were created
    console.log('\n🔍 Verifying RLS policies...')

    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .eq('tablename', 'objects')
      .like('policyname', '%CV%')

    if (policiesError) {
      console.warn('⚠️  Could not verify policies via pg_policies view')
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`)
      policies.forEach((policy: any) => {
        console.log(`   - ${policy.policyname}`)
      })
    } else {
      console.log('⚠️  No policies found (this might be normal if pg_policies is restricted)')
    }

    // Verify the bucket exists
    console.log('\n🪣 Verifying CVS bucket...')

    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error(`❌ Error listing buckets: ${bucketsError.message}`)
    } else {
      const cvsBucket = buckets.find((b: any) => b.id === 'cvs' || b.name === 'cvs')
      if (cvsBucket) {
        console.log('✅ CVS bucket exists:')
        console.log(`   - ID: ${cvsBucket.id}`)
        console.log(`   - Name: ${cvsBucket.name}`)
        console.log(`   - Public: ${cvsBucket.public}`)
      } else {
        console.log('⚠️  CVS bucket not found - it may need to be created manually')
      }
    }

    console.log('\n✨ Process completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. Verify the bucket exists in Supabase Dashboard → Storage')
    console.log('   2. Check RLS policies in Dashboard → Authentication → Policies')
    console.log('   3. Test uploading a CV via your application')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

// Run the script
applyCVSRLSPolicies().catch(console.error)
