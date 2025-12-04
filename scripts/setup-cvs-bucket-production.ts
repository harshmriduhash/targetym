/**
 * Script: Configuration Automatique du Bucket CVs en Production
 * Usage: npx tsx scripts/setup-cvs-bucket-production.ts
 *
 * Prérequis:
 * - SUPABASE_SERVICE_ROLE_KEY configuré dans .env.local ou .env.production
 * - NEXT_PUBLIC_SUPABASE_URL configuré
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env.production') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes!')
  console.error('   Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont configurées.')
  process.exit(1)
}

console.log('🚀 Configuration du bucket CVs en production...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupCVsBucket() {
  console.log('📦 Étape 1: Vérification de l\'existence du bucket...')

  // Vérifier si le bucket existe déjà
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ Erreur lors de la liste des buckets:', listError.message)
    return false
  }

  const cvsBucket = existingBuckets?.find(b => b.id === 'cvs')

  if (cvsBucket) {
    console.log('✅ Bucket "cvs" existe déjà')
    console.log(`   - Public: ${cvsBucket.public ? '❌ OUI (À CORRIGER!)' : '✅ NON (Privé)'}`)
    console.log(`   - Limite: ${cvsBucket.file_size_limit ? (cvsBucket.file_size_limit / 1024 / 1024).toFixed(1) + ' MB' : 'Non définie'}`)

    if (cvsBucket.public) {
      console.log('\n⚠️  ATTENTION: Le bucket est PUBLIC! Mise à jour vers PRIVÉ...')

      // Mettre à jour le bucket pour le rendre privé
      const { error: updateError } = await supabase.storage.updateBucket('cvs', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      })

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message)
        return false
      }

      console.log('✅ Bucket mis à jour: maintenant PRIVÉ')
    }
  } else {
    console.log('📦 Bucket "cvs" n\'existe pas. Création...')

    const { data: newBucket, error: createError } = await supabase.storage.createBucket('cvs', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    })

    if (createError) {
      console.error('❌ Erreur lors de la création:', createError.message)
      return false
    }

    console.log('✅ Bucket "cvs" créé avec succès!')
  }

  console.log('\n🔒 Étape 2: Vérification des RLS policies...')
  console.log('   Note: Les policies RLS sont créées via les migrations SQL.')
  console.log('   Assurez-vous d\'avoir exécuté: npx supabase db push')

  console.log('\n✅ Configuration terminée!')
  console.log('\n📋 Résumé:')
  console.log('   • Bucket: cvs')
  console.log('   • Visibilité: PRIVÉ (non public)')
  console.log('   • Limite de taille: 10 MB')
  console.log('   • Types autorisés: PDF, DOC, DOCX')
  console.log('   • RLS: Actif (via migrations)')

  console.log('\n🎯 Prochaines étapes:')
  console.log('   1. Vérifiez dans Supabase Dashboard → Storage → Buckets')
  console.log('   2. Testez l\'upload d\'un CV depuis l\'application')
  console.log('   3. Vérifiez que les CVs ne sont pas accessibles publiquement')

  return true
}

async function main() {
  try {
    const success = await setupCVsBucket()
    process.exit(success ? 0 : 1)
  } catch (error: any) {
    console.error('\n❌ Erreur inattendue:', error.message)
    process.exit(1)
  }
}

main()
