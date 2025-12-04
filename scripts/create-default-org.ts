#!/usr/bin/env tsx
/**
 * Script pour créer l'organisation par défaut dans Supabase
 * Usage: pnpm run db:create-default-org
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.log('💡 Make sure .env.local contains:')
  console.log('   - NEXT_PUBLIC_SUPABASE_URL')
  console.log('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000000'

async function createDefaultOrganization() {
  console.log('🏢 Creating default organization...')
  console.log(`📦 ID: ${DEFAULT_ORG_ID}`)

  try {
    // Vérifier si l'organisation existe déjà
    const { data: existing, error: checkError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', DEFAULT_ORG_ID)
      .single()

    if (existing) {
      console.log('✅ Default organization already exists')
      console.log(`   Name: ${existing.name}`)
      return
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Créer l'organisation
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        id: DEFAULT_ORG_ID,
        name: 'Unassigned Users',
        slug: 'unassigned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log('✅ Default organization created successfully!')
    console.log(`   ID: ${data.id}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Slug: ${data.slug}`)

    // Vérifier combien d'utilisateurs sans organisation
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('organization_id', null)

    if (count && count > 0) {
      console.log(`\n⚠️  Found ${count} users without organization`)
      console.log('💡 Run: pnpm run db:assign-default-org to assign them')
    }

  } catch (error: any) {
    console.error('❌ Failed to create organization:', error.message)
    process.exit(1)
  }
}

createDefaultOrganization()
