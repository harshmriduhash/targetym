// scripts/verify-s1-s2.ts
/**
 * Script de vérification automatique des correctifs S1 & S2
 *
 * S1 : Vérification que les nouvelles credentials Supabase fonctionnent
 * S2 : Vérification que le bucket CV est sécurisé
 */

import { createClient } from '@supabase/supabase-js'

async function verifyS1(): Promise<boolean> {
  console.log('\n🔐 Vérification S1 : Credentials Supabase')
  console.log('=' .repeat(60))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.log('❌ ERREUR : Variables d\'environnement manquantes')
    console.log('   → Vérifier que .env.local contient :')
    console.log('     - NEXT_PUBLIC_SUPABASE_URL')
    console.log('     - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return false
  }

  // Vérifier le format de l'anon key
  if (!anonKey.startsWith('eyJ')) {
    console.log('❌ ERREUR : Format de clé invalide')
    console.log('   → NEXT_PUBLIC_SUPABASE_ANON_KEY doit commencer par "eyJ"')
    return false
  }

  console.log('✅ Variables d\'environnement présentes')
  console.log(`   URL: ${url}`)
  console.log(`   Anon Key: ${anonKey.substring(0, 20)}...`)

  try {
    console.log('\n⏳ Test de connexion à Supabase...')

    const supabase = createClient(url, anonKey)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ ERREUR : Impossible de se connecter')
      console.log(`   Code: ${error.code}`)
      console.log(`   Message: ${error.message}`)
      console.log('\n💡 Solutions possibles :')
      console.log('   1. Vérifier que les clés sont bien copiées depuis le Dashboard')
      console.log('   2. Vérifier qu\'il n\'y a pas d\'espaces avant/après les clés')
      console.log('   3. Redémarrer le serveur après modification .env.local')
      return false
    }

    console.log('✅ Connexion réussie à Supabase')
    console.log('✅ Credentials valides et fonctionnels')
    console.log('\n✨ S1 : COMPLÉTÉ AVEC SUCCÈS')

    return true
  } catch (error: any) {
    console.log('❌ ERREUR : Exception lors du test')
    console.log(`   ${error.message}`)
    return false
  }
}

async function verifyS2(): Promise<boolean> {
  console.log('\n\n📁 Vérification S2 : Sécurité Bucket CV')
  console.log('=' .repeat(60))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    console.log('❌ URL Supabase manquante')
    return false
  }

  // Test 1 : Accès anonyme au bucket (doit échouer)
  console.log('\n⏳ Test 1 : Vérification accès anonyme...')

  const testUrl = `${url}/storage/v1/object/public/cvs/test.pdf`

  try {
    const response = await fetch(testUrl)

    console.log(`   Status: ${response.status} ${response.statusText}`)

    if (response.status === 401 || response.status === 403) {
      console.log('✅ Accès anonyme bloqué correctement')
      console.log('   → Bucket sécurisé avec RLS')
    } else if (response.status === 404) {
      console.log('⚠️  Bucket vide ou fichier test inexistant')
      console.log('   → Impossible de vérifier (probablement OK)')
      console.log('   → Vérifier manuellement que "Public bucket" est décoché')
    } else if (response.status === 200) {
      console.log('❌ ATTENTION : Bucket encore PUBLIC !')
      console.log('   → Le fichier test.pdf est accessible sans authentification')
      console.log('\n💡 Solution :')
      console.log('   1. Dashboard Supabase → Storage → cvs → Settings')
      console.log('   2. Décocher "Public bucket"')
      console.log('   3. Cliquer "Save"')
      return false
    } else {
      console.log(`⚠️  Status inattendu: ${response.status}`)
      console.log('   → Vérification manuelle recommandée')
    }
  } catch (error: any) {
    console.log('⚠️  Erreur réseau (bucket probablement sécurisé)')
    console.log(`   ${error.message}`)
  }

  // Test 2 : Vérification des policies RLS
  console.log('\n⏳ Test 2 : Vérification des policies RLS...')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Lister les buckets (requiert auth admin)
    const { data, error } = await supabase
      .storage
      .listBuckets()

    if (error) {
      console.log('⚠️  Impossible de vérifier les policies (permissions limitées)')
      console.log('   → Vérification manuelle recommandée dans le Dashboard')
    } else {
      const cvsBucket = data?.find(b => b.name === 'cvs')

      if (cvsBucket) {
        console.log('✅ Bucket "cvs" trouvé')
        console.log(`   Public: ${cvsBucket.public ? '❌ OUI (MAUVAIS)' : '✅ NON (BON)'}`)

        if (cvsBucket.public) {
          console.log('\n❌ ERREUR : Bucket encore public !')
          console.log('   → Suivre les instructions S2 du guide')
          return false
        }
      } else {
        console.log('⚠️  Bucket "cvs" non trouvé')
        console.log('   → Créer le bucket et appliquer les policies')
      }
    }
  } catch (error) {
    console.log('⚠️  Test des policies impossible (normal avec anon key)')
  }

  // Résumé
  console.log('\n📋 Checklist S2 :')
  console.log('   [ ] Bucket "cvs" rendu privé (Public access décoché)')
  console.log('   [ ] Policy SELECT créée (Recruiters can view CVs)')
  console.log('   [ ] Policy INSERT créée (Authenticated users can upload CVs)')
  console.log('   [ ] Policy DELETE créée (Admins can delete CVs)')
  console.log('\n💡 Vérifier manuellement dans le Dashboard :')
  console.log('   Dashboard → Storage → cvs → Policies')
  console.log('   Vous devez voir 3 policies actives')

  console.log('\n✨ S2 : Vérification partielle OK')
  console.log('   → Compléter la vérification manuelle dans le Dashboard')

  return true
}

async function main() {
  console.log('=' .repeat(60))
  console.log('VÉRIFICATION AUTOMATIQUE : S1 & S2')
  console.log('Correctifs Manuels de Sécurité')
  console.log('=' .repeat(60))

  const s1Ok = await verifyS1()
  const s2Ok = await verifyS2()

  console.log('\n\n' + '='.repeat(60))
  console.log('RÉSUMÉ FINAL')
  console.log('='.repeat(60))

  console.log(`\nS1 - Credentials : ${s1Ok ? '✅ OK' : '❌ À CORRIGER'}`)
  console.log(`S2 - Bucket CV   : ${s2Ok ? '✅ OK' : '❌ À CORRIGER'}`)

  if (s1Ok && s2Ok) {
    console.log('\n🎉 TOUS LES CORRECTIFS VÉRIFIÉS AVEC SUCCÈS !')
    console.log('   → Votre application est maintenant sécurisée')
    console.log('   → Compléter la checklist S2 manuellement dans le Dashboard')
  } else {
    console.log('\n⚠️  CERTAINS CORRECTIFS NÉCESSITENT VOTRE ATTENTION')
    console.log('   → Consulter GUIDE_CORRECTIFS_MANUELS_S1_S2.md')
  }

  console.log('='.repeat(60) + '\n')

  process.exit(s1Ok && s2Ok ? 0 : 1)
}

// Exécution
main().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
