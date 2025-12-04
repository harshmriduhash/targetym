import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('Connecting to Supabase...')
  console.log('URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251010000001_create_cvs_storage_bucket.sql')
  console.log('Reading migration from:', migrationPath)

  const sql = readFileSync(migrationPath, 'utf-8')

  // Execute SQL using Supabase Management API
  console.log('\nExecuting migration SQL...\n')

  try {
    // Method 1: Try to execute as raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      console.log('Direct SQL execution not available')
      console.log('You will need to execute the SQL manually in Supabase Dashboard')
      console.log('\nSQL to execute:')
      console.log('=' .repeat(80))
      console.log(sql)
      console.log('=' .repeat(80))
      console.log('\nSteps:')
      console.log('1. Go to https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql/new')
      console.log('2. Copy and paste the SQL above')
      console.log('3. Click "Run" to execute')
    } else {
      console.log('✅ Migration executed successfully!')
    }

    // Verify bucket exists
    console.log('\nVerifying CVS bucket...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
      console.error('Error listing buckets:', bucketError.message)
    } else {
      const cvsBucket = buckets.find(b => b.id === 'cvs')
      if (cvsBucket) {
        console.log('✅ CVS bucket found:')
        console.log('   ID:', cvsBucket.id)
        console.log('   Name:', cvsBucket.name)
        console.log('   Public:', cvsBucket.public)
        console.log('   File size limit:', cvsBucket.file_size_limit, 'bytes (10MB)')
      } else {
        console.log('⚠️  CVS bucket not found')
        console.log('Creating bucket...')

        const { data: newBucket, error: createError } = await supabase.storage.createBucket('cvs', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        })

        if (createError) {
          console.error('❌ Error creating bucket:', createError.message)
        } else {
          console.log('✅ Bucket created successfully!')
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message)
  }

  console.log('\n✨ Done!')
}

main()
