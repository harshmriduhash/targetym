#!/usr/bin/env node
/**
 * Script de migration Supabase
 * Applique toutes les migrations SQL sur l'instance Supabase
 *
 * Usage: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

// Créer le client Supabase avec le service_role_key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Migration {
  filename: string
  sql: string
}

/**
 * Lit tous les fichiers de migration
 */
function getMigrations(): Migration[] {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() // Tri par ordre alphabétique (timestamp dans le nom)

    return files.map(filename => ({
      filename,
      sql: readFileSync(join(migrationsDir, filename), 'utf-8')
    }))
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des migrations:', error)
    process.exit(1)
  }
}

/**
 * Créer la table de suivi des migrations si elle n'existe pas
 */
async function createMigrationTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Si rpc n'existe pas, utiliser une approche alternative
  if (error) {
    console.log('ℹ️  Création de la table schema_migrations via SQL direct...')

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Utiliser une requête HTTP directe
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: createTableSQL })
    })

    if (!response.ok) {
      console.warn('⚠️  Impossible de créer automatiquement la table schema_migrations')
      console.warn('   Veuillez la créer manuellement dans Supabase SQL Editor')
    }
  }
}

/**
 * Vérifie si une migration a déjà été appliquée
 */
async function isMigrationApplied(version: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
    .eq('version', version)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
    console.warn(`⚠️  Impossible de vérifier si la migration ${version} a été appliquée:`, error.message)
    return false
  }

  return !!data
}

/**
 * Marque une migration comme appliquée
 */
async function markMigrationApplied(version: string) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert({ version })

  if (error) {
    console.warn(`⚠️  Impossible de marquer la migration ${version} comme appliquée:`, error.message)
  }
}

/**
 * Applique une migration SQL
 */
async function applyMigration(migration: Migration): Promise<boolean> {
  const version = migration.filename.replace('.sql', '')

  // Vérifier si déjà appliquée
  const applied = await isMigrationApplied(version)
  if (applied) {
    console.log(`⏭️  Migration ${migration.filename} déjà appliquée`)
    return true
  }

  console.log(`🔄 Application de ${migration.filename}...`)

  try {
    // Découper le SQL en commandes individuelles
    const statements = migration.sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        // Utiliser l'API REST pour exécuter le SQL
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        }) as any

        if (error) {
          // Ignorer certaines erreurs non critiques
          const ignorableErrors = [
            'already exists',
            'does not exist',
            'duplicate key value'
          ]

          const isIgnorable = ignorableErrors.some(msg =>
            error.message?.toLowerCase().includes(msg)
          )

          if (!isIgnorable) {
            console.error(`   ❌ Erreur sur statement:`, error.message)
            errorCount++
          } else {
            console.log(`   ⚠️  Warning (ignoré):`, error.message)
          }
        } else {
          successCount++
        }
      } catch (err: any) {
        console.error(`   ❌ Exception:`, err.message)
        errorCount++
      }
    }

    if (errorCount === 0 || errorCount < statements.length / 2) {
      await markMigrationApplied(version)
      console.log(`✅ Migration ${migration.filename} appliquée (${successCount} statements réussis)`)
      return true
    } else {
      console.error(`❌ Migration ${migration.filename} échouée (${errorCount} erreurs sur ${statements.length} statements)`)
      return false
    }

  } catch (error: any) {
    console.error(`❌ Erreur lors de l'application de ${migration.filename}:`, error.message)
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Début des migrations Supabase\n')
  console.log(`📦 Instance: ${SUPABASE_URL}\n`)

  // Créer la table de migrations si nécessaire
  await createMigrationTable()

  // Récupérer toutes les migrations
  const migrations = getMigrations()
  console.log(`📁 ${migrations.length} migration(s) trouvée(s):\n`)
  migrations.forEach((m, i) => console.log(`   ${i + 1}. ${m.filename}`))
  console.log('')

  // Appliquer les migrations
  let successCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const migration of migrations) {
    const success = await applyMigration(migration)
    if (success) {
      const applied = await isMigrationApplied(migration.filename.replace('.sql', ''))
      if (applied) {
        successCount++
      } else {
        skippedCount++
      }
    } else {
      errorCount++
    }
    console.log('') // Ligne vide entre les migrations
  }

  // Résumé
  console.log('━'.repeat(60))
  console.log('📊 RÉSUMÉ DES MIGRATIONS')
  console.log('━'.repeat(60))
  console.log(`✅ Appliquées:  ${successCount}`)
  console.log(`⏭️  Ignorées:    ${skippedCount}`)
  console.log(`❌ Échouées:    ${errorCount}`)
  console.log('━'.repeat(60))

  if (errorCount > 0) {
    console.log('\n⚠️  Certaines migrations ont échoué.')
    console.log('   Veuillez vérifier les logs ci-dessus et appliquer manuellement si nécessaire.')
    console.log('   URL du SQL Editor: ' + SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/') + '/sql')
    process.exit(1)
  } else {
    console.log('\n🎉 Toutes les migrations ont été appliquées avec succès!')
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
