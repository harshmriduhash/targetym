/**
 * Test Auth Fix Script
 * Diagnose and fix authentication issues
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnostic de l\'authentification...\n')

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Step 1: Check if default organization exists
  console.log('1️⃣ Vérification de l\'organisation par défaut...')
  const { data: defaultOrg, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', 'default')
    .maybeSingle()

  if (orgError) {
    console.error('❌ Erreur lors de la recherche de l\'organisation:', orgError.message)
  } else if (defaultOrg) {
    console.log('✅ Organisation par défaut trouvée:', defaultOrg.name, `(ID: ${defaultOrg.id})`)
  } else {
    console.log('⚠️  Aucune organisation par défaut trouvée')
    console.log('   Création de l\'organisation par défaut...')

    const { data: newOrg, error: createOrgError } = await supabase
      .from('organizations')
      .insert([{
        name: 'Default Organization',
        slug: 'default',
        subscription_tier: 'free',
        subscription_status: 'active'
      }])
      .select()
      .single()

    if (createOrgError) {
      console.error('❌ Erreur lors de la création de l\'organisation:', createOrgError.message)
      return
    } else {
      console.log('✅ Organisation créée:', newOrg.name, `(ID: ${newOrg.id})`)
    }
  }

  // Step 2: Skip trigger function check (requires direct SQL)

  // Step 3: Test user creation
  console.log('\n3️⃣ Test de création d\'utilisateur...')
  const testEmail = `test${Date.now()}@targetym.test`
  const testPassword = 'TestPassword123!'

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User'
      }
    }
  })

  if (signUpError) {
    console.error('❌ Erreur lors de l\'inscription:', signUpError.message)
    console.error('   Détails:', JSON.stringify(signUpError, null, 2))
    return
  }

  console.log('✅ Utilisateur créé dans auth.users')
  console.log(`   Email: ${testEmail}`)
  console.log(`   User ID: ${signUpData.user?.id}`)

  // Wait for trigger to execute
  console.log('\n⏳ Attente de l\'exécution du trigger (3 secondes)...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Step 4: Check if profile was created
  console.log('\n4️⃣ Vérification du profil créé...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user!.id)
    .single()

  if (profileError) {
    console.error('❌ Erreur lors de la récupération du profil:', profileError.message)
    console.error('   Détails:', JSON.stringify(profileError, null, 2))

    console.log('\n🔧 Tentative de création manuelle du profil...')

    // Get default org again
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'default')
      .single()

    if (org) {
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert([{
          id: signUpData.user!.id,
          organization_id: org.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          role: 'employee',
          employment_status: 'active'
        }])
        .select()
        .single()

      if (manualError) {
        console.error('❌ Échec de la création manuelle:', manualError.message)
      } else {
        console.log('✅ Profil créé manuellement')
        console.log('   Profil:', JSON.stringify(manualProfile, null, 2))
      }
    }
  } else {
    console.log('✅ Profil créé automatiquement par le trigger')
    console.log('   Profil:', JSON.stringify(profile, null, 2))
  }

  // Cleanup
  console.log('\n🧹 Nettoyage...')
  await supabase.auth.admin.deleteUser(signUpData.user!.id)
  console.log('✅ Utilisateur de test supprimé')

  console.log('\n✅ Diagnostic terminé!')
}

diagnoseAuthIssue().catch(console.error)
