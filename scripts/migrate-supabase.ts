#!/usr/bin/env node
/**
 * Script de migration Supabase - Approche simple
 * Génère le SQL consolidé pour application manuelle
 *
 * Usage: npx tsx scripts/migrate-supabase.ts
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

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
 * Fonction principale
 */
function main() {
  console.log('🚀 Génération du script de migration consolidé\n')

  // Récupérer toutes les migrations
  const migrations = getMigrations()
  console.log(`📁 ${migrations.length} migration(s) trouvée(s):\n`)
  migrations.forEach((m, i) => console.log(`   ${i + 1}. ${m.filename}`))
  console.log('')

  // Créer le SQL consolidé
  let consolidatedSQL = `-- ============================================================================
-- SCRIPT DE MIGRATION CONSOLIDÉ - Targetym
-- Généré automatiquement le ${new Date().toISOString()}
-- ============================================================================
--
-- Ce script contient toutes les migrations de la base de données.
-- À exécuter dans Supabase SQL Editor: https://supabase.com/dashboard/project/{project}/sql
--
-- ============================================================================

-- Créer la table de suivi des migrations
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

`

  // Ajouter chaque migration
  migrations.forEach((migration, index) => {
    const version = migration.filename.replace('.sql', '')

    consolidatedSQL += `
-- ============================================================================
-- MIGRATION ${index + 1}/${migrations.length}: ${migration.filename}
-- ============================================================================

-- Vérifier si déjà appliquée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schema_migrations WHERE version = '${version}'
  ) THEN
    -- Marquer comme appliquée
    INSERT INTO public.schema_migrations (version) VALUES ('${version}');
    RAISE NOTICE 'Migration ${migration.filename} marquée comme appliquée';
  ELSE
    RAISE NOTICE 'Migration ${migration.filename} déjà appliquée, passage...';
  END IF;
END $$;

${migration.sql}

`
  })

  // Ajouter un résumé final
  consolidatedSQL += `
-- ============================================================================
-- FIN DES MIGRATIONS
-- ============================================================================

-- Vérifier les migrations appliquées
SELECT version, applied_at
FROM public.schema_migrations
ORDER BY applied_at DESC;

-- Vérifier que RLS est activé sur toutes les tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Compter les policies RLS
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
`

  // Sauvegarder le fichier
  const outputPath = join(process.cwd(), 'supabase', 'consolidated-migration.sql')
  writeFileSync(outputPath, consolidatedSQL, 'utf-8')

  console.log('✅ Script consolidé généré avec succès!\n')
  console.log('📄 Fichier:', outputPath)
  console.log('\n📋 INSTRUCTIONS D\'APPLICATION:\n')
  console.log('1. Ouvrir Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard/project/juuekovwshynwgjkqkbu/sql\n')
  console.log('2. Créer une nouvelle requête SQL\n')
  console.log('3. Copier-coller le contenu de:')
  console.log(`   ${outputPath}\n`)
  console.log('4. Cliquer sur "RUN" pour exécuter\n')
  console.log('5. Vérifier les résultats dans la console\n')
  console.log('━'.repeat(60))
  console.log('💡 TIP: Le script vérifie automatiquement les migrations déjà')
  console.log('   appliquées et les ignore pour éviter les doublons.')
  console.log('━'.repeat(60))
}

// Exécuter le script
main()
