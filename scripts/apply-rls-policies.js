/**
 * Script pour appliquer les politiques RLS sur le bucket Storage CVs
 *
 * Usage:
 *   node scripts/apply-rls-policies.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const policies = [
  {
    name: 'Allow authenticated users to upload CVs',
    sql: `
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
    `
  },
  {
    name: 'Allow users to read organization CVs',
    sql: `
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
    `
  },
  {
    name: 'Allow public read access to CVs',
    sql: `
      CREATE POLICY "Allow public read access to CVs"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'cvs');
    `
  },
  {
    name: 'Allow users to update organization CVs',
    sql: `
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
    `
  },
  {
    name: 'Allow users to delete organization CVs',
    sql: `
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
  }
]

async function applyPolicy(policy) {
  try {
    console.log(`📋 Application de la politique: ${policy.name}...`)

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: policy.sql
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ℹ️  Politique déjà existante`)
        return true
      }
      throw error
    }

    console.log(`   ✅ Politique appliquée`)
    return true
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Application des Politiques RLS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('⚠️  IMPORTANT: Cette méthode nécessite une fonction RPC personnalisée.')
  console.log('    Il est recommandé d\'appliquer les politiques via le SQL Editor.\n')

  console.log('📄 Fichier SQL généré: supabase/migrations/20251010000001_create_cvs_storage_bucket.sql\n')

  console.log('🔗 Pour appliquer manuellement, allez sur:')
  console.log('   https://app.supabase.com/project/_/sql\n')

  console.log('📋 Puis copiez-collez le contenu du fichier de migration.\n')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Lire et afficher le contenu du fichier SQL
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251010000001_create_cvs_storage_bucket.sql')

  try {
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8')
    console.log('📄 Contenu du fichier SQL à exécuter:\n')
    console.log('─'.repeat(80))
    console.log(sqlContent)
    console.log('─'.repeat(80))
  } catch (error) {
    console.error('❌ Impossible de lire le fichier SQL:', error.message)
  }
}

main()
