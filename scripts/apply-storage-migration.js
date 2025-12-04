/**
 * Script pour appliquer la migration du bucket Storage CVs
 *
 * Usage:
 *   node scripts/apply-storage-migration.js
 *
 * Variables d'environnement requises:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createStorageBucket() {
  console.log('🚀 Création du bucket Storage "cvs"...')

  const { data, error } = await supabase.storage.createBucket('cvs', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Le bucket "cvs" existe déjà')
      return true
    }
    throw error
  }

  console.log('✅ Bucket "cvs" créé avec succès')
  return true
}

async function verifyBucket() {
  console.log('\n🔍 Vérification du bucket...')

  const { data, error } = await supabase.storage.getBucket('cvs')

  if (error) {
    console.error('❌ Erreur lors de la vérification:', error.message)
    return false
  }

  console.log('✅ Bucket vérifié:')
  console.log(`   - ID: ${data.id}`)
  console.log(`   - Public: ${data.public}`)
  console.log(`   - Taille max: ${data.file_size_limit / 1024 / 1024}MB`)
  console.log(`   - Types autorisés: ${data.allowed_mime_types?.join(', ') || 'Tous'}`)

  return true
}

async function applyRLSPolicies() {
  console.log('\n🔒 Application des politiques RLS...')
  console.log('⚠️  Les politiques RLS doivent être appliquées manuellement via SQL')
  console.log('\nExécutez les commandes suivantes dans le SQL Editor de Supabase:\n')

  const policies = `
-- 1. Politique d'upload
CREATE POLICY "Allow authenticated users to upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- 2. Politique de lecture (organisation)
CREATE POLICY "Allow users to read organization CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- 3. Politique de lecture publique (OPTIONNEL)
CREATE POLICY "Allow public read access to CVs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');

-- 4. Politique de mise à jour
CREATE POLICY "Allow users to update organization CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- 5. Politique de suppression
CREATE POLICY "Allow users to delete organization CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM public.profiles
    WHERE id = auth.uid()
  )
);
`

  console.log(policies)
  console.log('\n📋 Copiez et collez ces commandes dans le SQL Editor')
  console.log('   URL: https://app.supabase.com/project/_/sql')
}

async function testUpload() {
  console.log('\n🧪 Test d\'upload...')

  // Créer un fichier test
  const testContent = Buffer.from('Test CV content', 'utf-8')
  const testPath = 'test-org-id/test-user-id/test.pdf'

  const { data, error } = await supabase.storage
    .from('cvs')
    .upload(testPath, testContent, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) {
    console.log('⚠️  Test d\'upload échoué (normal si les politiques RLS ne sont pas encore appliquées)')
    console.log(`   Erreur: ${error.message}`)
    return false
  }

  console.log('✅ Test d\'upload réussi')
  console.log(`   Chemin: ${data.path}`)

  // Nettoyer le fichier test
  await supabase.storage.from('cvs').remove([testPath])
  console.log('✅ Fichier test nettoyé')

  return true
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Migration Storage - Bucket CVs')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // 1. Créer le bucket
    await createStorageBucket()

    // 2. Vérifier le bucket
    await verifyBucket()

    // 3. Afficher les politiques RLS à appliquer
    await applyRLSPolicies()

    // 4. Tester l'upload (échouera si RLS pas appliqué)
    await testUpload()

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  ✅ Migration terminée !')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Prochaines étapes:')
    console.log('1. Appliquer les politiques RLS via SQL Editor')
    console.log('2. Tester l\'upload via votre application')
    console.log('3. Vérifier les fichiers dans Storage Dashboard\n')

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message)
    console.error('\nDétails:', error)
    process.exit(1)
  }
}

main()
