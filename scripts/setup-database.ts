#!/usr/bin/env tsx

/**
 * Database Setup Script for Targetym
 * 
 * This script helps set up the database connection and test the configuration
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase configuration')
    console.log('Please check your .env.local file:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return false
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }

    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error)
    return false
  }
}

async function checkTables() {
  console.log('📋 Checking database tables...')
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  
  const tables = [
    'organizations',
    'profiles', 
    'goals',
    'key_results',
    'job_postings',
    'candidates',
    'interviews',
    'performance_reviews'
  ]

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: OK`)
      }
    } catch (error) {
      console.log(`❌ Table ${table}: Connection error`)
    }
  }
}

async function main() {
  console.log('🚀 Targetym Database Setup')
  console.log('========================')
  
  const connected = await testDatabaseConnection()
  
  if (connected) {
    await checkTables()
    console.log('\n✅ Database setup complete!')
    console.log('\nNext steps:')
    console.log('1. Run migrations: npm run supabase:reset')
    console.log('2. Generate types: npm run supabase:types')
    console.log('3. Start development: npm run dev')
  } else {
    console.log('\n❌ Setup failed. Please check your configuration.')
    process.exit(1)
  }
}

main().catch(console.error)




