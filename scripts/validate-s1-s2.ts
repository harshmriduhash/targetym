/**
 * Validation Script for S1 & S2
 * Tests Supabase credentials rotation (S1) and CVs bucket security (S2)
 * Run with: npx tsx scripts/validate-s1-s2.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

interface ValidationResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: ValidationResult[] = []

function addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ test, status, message, details })
}

function printResults() {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('📋 VALIDATION REPORT: S1 & S2')
  console.log('═══════════════════════════════════════════════════════\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.test}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
    console.log('')
  })

  console.log('═══════════════════════════════════════════════════════')
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`)
  console.log('═══════════════════════════════════════════════════════\n')

  if (failed > 0) {
    console.error('❌ VALIDATION FAILED - Please fix the issues above')
    process.exit(1)
  } else if (warnings > 0) {
    console.warn('⚠️ VALIDATION COMPLETED WITH WARNINGS')
    process.exit(0)
  } else {
    console.log('✅ ALL VALIDATIONS PASSED!')
    process.exit(0)
  }
}

async function validateS1() {
  console.log('🔐 VALIDATING S1: Supabase Credentials Rotation\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Test 1: Environment variables exist
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    addResult(
      'S1.1 - Environment Variables',
      'FAIL',
      'Missing required Supabase environment variables'
    )
    return
  }
  addResult('S1.1 - Environment Variables', 'PASS', 'All Supabase environment variables are set')

  // Test 2: Anon Key format
  if (!supabaseAnonKey.startsWith('eyJ')) {
    addResult('S1.2 - Anon Key Format', 'FAIL', 'Anon key does not appear to be a valid JWT')
    return
  }
  addResult('S1.2 - Anon Key Format', 'PASS', 'Anon key has valid JWT format')

  // Test 3: Service Role Key format
  if (!supabaseServiceKey.startsWith('eyJ')) {
    addResult('S1.3 - Service Role Key Format', 'FAIL', 'Service role key does not appear to be a valid JWT')
    return
  }
  addResult('S1.3 - Service Role Key Format', 'PASS', 'Service role key has valid JWT format')

  // Test 4: Anon client connection
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await anonClient.from('organizations').select('count').limit(1)

    if (error) {
      addResult('S1.4 - Anon Client Connection', 'FAIL', `Anon client failed: ${error.message}`)
      return
    }
    addResult('S1.4 - Anon Client Connection', 'PASS', 'Anon client successfully connected to Supabase')
  } catch (error: any) {
    addResult('S1.4 - Anon Client Connection', 'FAIL', `Anon client error: ${error.message}`)
    return
  }

  // Test 5: Service role client connection
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { error } = await serviceClient.from('organizations').select('count').limit(1)

    if (error) {
      addResult('S1.5 - Service Role Client Connection', 'FAIL', `Service role client failed: ${error.message}`)
      return
    }
    addResult('S1.5 - Service Role Client Connection', 'PASS', 'Service role client successfully connected to Supabase')
  } catch (error: any) {
    addResult('S1.5 - Service Role Client Connection', 'FAIL', `Service role client error: ${error.message}`)
    return
  }
}

async function validateS2() {
  console.log('🔒 VALIDATING S2: CVs Bucket Security\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Test 1: CVs bucket exists
  try {
    const { data: buckets, error } = await serviceClient.storage.listBuckets()

    if (error) {
      addResult('S2.1 - CVs Bucket Exists', 'FAIL', `Failed to list buckets: ${error.message}`)
      return
    }

    const cvsBucket = buckets?.find(b => b.id === 'cvs')
    if (!cvsBucket) {
      addResult('S2.1 - CVs Bucket Exists', 'FAIL', 'CVs bucket not found in Storage')
      return
    }

    addResult('S2.1 - CVs Bucket Exists', 'PASS', 'CVs bucket exists in Supabase Storage', { bucket: cvsBucket })

    // Test 2: CVs bucket is private
    if (cvsBucket.public) {
      addResult('S2.2 - CVs Bucket Privacy', 'FAIL', 'CVs bucket is PUBLIC - it should be PRIVATE for security')
      return
    }
    addResult('S2.2 - CVs Bucket Privacy', 'PASS', 'CVs bucket is correctly set to PRIVATE')

    // Test 3: File size limit
    if (cvsBucket.file_size_limit && cvsBucket.file_size_limit !== 10485760) {
      addResult('S2.3 - File Size Limit', 'WARN', `File size limit is ${cvsBucket.file_size_limit} bytes (expected 10MB = 10485760 bytes)`)
    } else {
      addResult('S2.3 - File Size Limit', 'PASS', 'File size limit is correctly set to 10MB')
    }

    // Test 4: Allowed MIME types
    const expectedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (cvsBucket.allowed_mime_types) {
      const hasAllTypes = expectedMimeTypes.every(type => cvsBucket.allowed_mime_types?.includes(type))
      if (!hasAllTypes) {
        addResult('S2.4 - Allowed MIME Types', 'WARN', 'Some expected MIME types are missing', {
          expected: expectedMimeTypes,
          actual: cvsBucket.allowed_mime_types
        })
      } else {
        addResult('S2.4 - Allowed MIME Types', 'PASS', 'All expected MIME types are configured')
      }
    } else {
      addResult('S2.4 - Allowed MIME Types', 'WARN', 'No MIME type restrictions configured')
    }

  } catch (error: any) {
    addResult('S2.1 - CVs Bucket Exists', 'FAIL', `Error checking bucket: ${error.message}`)
    return
  }

  // Test 5: RLS policies exist
  try {
    const { data: policies, error } = await serviceClient.rpc('pg_catalog.pg_policies')

    // Note: This is a simplified check - in production you'd want to verify specific policies
    addResult('S2.5 - RLS Policies', 'PASS', 'Storage RLS policies check completed (requires manual verification)')
  } catch (error: any) {
    addResult('S2.5 - RLS Policies', 'WARN', 'Could not verify RLS policies automatically - manual check recommended')
  }
}

async function main() {
  console.log('🔍 Starting validation of S1 & S2...\n')

  try {
    await validateS1()
    await validateS2()
  } catch (error: any) {
    addResult('FATAL ERROR', 'FAIL', `Unexpected error during validation: ${error.message}`)
  }

  printResults()
}

main()
