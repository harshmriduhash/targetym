/**
 * Script de test pour l'authentification Supabase
 * Usage: npx tsx scripts/test-auth.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/database.types'

// Charger les variables d'environnement
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Assurez-vous que .env.local contient:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testAuthentication() {
  console.log('🚀 Démarrage des tests d\'authentification Supabase\n')

  // Test 1: Inscription avec email/password
  console.log('📝 Test 1: Inscription utilisateur...')
  const randomId = Math.floor(Math.random() * 10000)
  const testEmail = `testuser${randomId}@test.com`
  const testPassword = 'Test123456!'

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
      },
    },
  })

  if (signUpError) {
    console.error('❌ Erreur lors de l\'inscription:', signUpError.message)
    return
  }

  console.log('✅ Inscription réussie!')
  console.log(`   Email: ${testEmail}`)
  console.log(`   User ID: ${signUpData.user?.id}\n`)

  // Attendre un peu pour que le trigger s'exécute
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Test 2: Vérifier que le profil a été créé automatiquement
  console.log('👤 Test 2: Vérification de la création du profil...')

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user!.id)
    .single()

  if (profileError) {
    console.error('❌ Erreur lors de la récupération du profil:', profileError.message)
    return
  }

  if (!profileData) {
    console.error('❌ Aucun profil trouvé pour l\'utilisateur!')
    return
  }

  console.log('✅ Profil créé automatiquement!')
  console.log('   Profil:', JSON.stringify(profileData, null, 2))
  console.log()

  // Test 3: Connexion
  console.log('🔐 Test 3: Connexion avec email/password...')

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

  if (signInError) {
    console.error('❌ Erreur lors de la connexion:', signInError.message)
    return
  }

  console.log('✅ Connexion réussie!')
  console.log(`   Session ID: ${signInData.session?.access_token.slice(0, 20)}...\n`)

  // Test 4: Récupération de l'utilisateur connecté
  console.log('👨 Test 4: Récupération de l\'utilisateur connecté...')

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError.message)
    return
  }

  console.log('✅ Utilisateur récupéré!')
  console.log(`   Email: ${userData.user?.email}`)
  console.log(`   ID: ${userData.user?.id}\n`)

  // Test 5: Vérifier les politiques RLS
  console.log('🔒 Test 5: Vérification des politiques RLS...')

  const { data: ownProfile, error: ownProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user!.id)
    .single()

  if (ownProfileError) {
    console.error('❌ Erreur RLS - Impossible de lire son propre profil:', ownProfileError.message)
    return
  }

  console.log('✅ RLS fonctionne - Utilisateur peut lire son propre profil')

  // Test 6: Vérifier l'organisation
  console.log('\n🏢 Test 6: Vérification de l\'organisation...')

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profileData.organization_id)
    .single()

  if (orgError) {
    console.error('❌ Erreur lors de la récupération de l\'organisation:', orgError.message)
    return
  }

  console.log('✅ Organisation trouvée!')
  console.log('   Organisation:', JSON.stringify(orgData, null, 2))

  // Test 7: Mise à jour du profil
  console.log('\n✏️ Test 7: Mise à jour du profil...')

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ job_title: 'Software Engineer', department: 'Engineering' })
    .eq('id', signUpData.user!.id)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour du profil:', updateError.message)
    return
  }

  console.log('✅ Profil mis à jour avec succès!')
  console.log(`   Job Title: ${updatedProfile.job_title}`)
  console.log(`   Department: ${updatedProfile.department}\n`)

  // Test 8: Déconnexion
  console.log('👋 Test 8: Déconnexion...')

  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) {
    console.error('❌ Erreur lors de la déconnexion:', signOutError.message)
    return
  }

  console.log('✅ Déconnexion réussie!\n')

  // Résumé
  console.log('=' .repeat(60))
  console.log('✨ RÉSUMÉ DES TESTS')
  console.log('=' .repeat(60))
  console.log('✅ Inscription utilisateur')
  console.log('✅ Création automatique du profil (trigger)')
  console.log('✅ Connexion email/password')
  console.log('✅ Récupération de l\'utilisateur')
  console.log('✅ Politiques RLS fonctionnelles')
  console.log('✅ Organisation créée/assignée')
  console.log('✅ Mise à jour du profil')
  console.log('✅ Déconnexion')
  console.log('\n🎉 Tous les tests d\'authentification ont réussi!')
  console.log('=' .repeat(60))
}

// Exécution
testAuthentication()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur critique:', error)
    process.exit(1)
  })
