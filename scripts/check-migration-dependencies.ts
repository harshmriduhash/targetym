import { createClient } from '@supabase/supabase-js'

// Utiliser les variables d'environnement pour la connexion cloud
// Si non définies, on utilisera les valeurs locales pour test
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseKey)

interface DependencyCheck {
  name: string
  required: boolean
  exists: boolean
  details?: string
  error?: string
  migration: string
}

async function checkDependencies(): Promise<DependencyCheck[]> {
  const results: DependencyCheck[] = []

  console.log('🔍 Vérification des dépendances des migrations...\n')
  console.log('='.repeat(70))

  // Vérification 1: Table audit_logs (requise pour migration 2)
  console.log('\n📋 Vérification 1: Table audit_logs')
  try {
    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        results.push({
          name: 'Table audit_logs',
          required: true,
          exists: false,
          details: 'Table manquante - requise pour le trigger audit_soft_delete()',
          migration: '20251117_add_soft_delete_to_profiles.sql',
          error: 'Table non trouvée'
        })
      } else {
        results.push({
          name: 'Table audit_logs',
          required: true,
          exists: false,
          details: `Erreur: ${error.message}`,
          migration: '20251117_add_soft_delete_to_profiles.sql',
          error: error.message
        })
      }
    } else {
      results.push({
        name: 'Table audit_logs',
        required: true,
        exists: true,
        details: `Table présente (${count || 0} enregistrements)`,
        migration: '20251117_add_soft_delete_to_profiles.sql'
      })
    }
  } catch (err) {
    results.push({
      name: 'Table audit_logs',
      required: true,
      exists: false,
      details: 'Erreur lors de la vérification',
      migration: '20251117_add_soft_delete_to_profiles.sql',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Vérification 2: Policy select_profiles_by_organization (requise pour migration 2)
  console.log('\n📋 Vérification 2: Policy select_profiles_by_organization')
  try {
    // On essaie de vérifier via une requête SQL directe
    // Note: Cette vérification nécessite un accès direct à la DB
    // On va plutôt vérifier si on peut faire un SELECT avec la policy
    
    // Test indirect: essayer de sélectionner des profiles
    // Si la policy existe et fonctionne, on devrait pouvoir lire
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Si on peut lire, la policy existe probablement
    // Mais on ne peut pas être sûr à 100% sans accès direct à pg_policies
    if (error) {
      results.push({
        name: 'Policy select_profiles_by_organization',
        required: false, // La migration utilise ALTER POLICY, donc elle peut créer si n'existe pas
        exists: false,
        details: 'Impossible de vérifier directement. La migration utilisera ALTER POLICY qui échouera si la policy n\'existe pas.',
        migration: '20251117_add_soft_delete_to_profiles.sql',
        error: error.message
      })
    } else {
      results.push({
        name: 'Policy select_profiles_by_organization',
        required: false,
        exists: true, // Probablement existe si on peut lire
        details: 'Policy probablement présente (lecture profiles réussie). Note: La migration utilise ALTER POLICY qui nécessite que la policy existe.',
        migration: '20251117_add_soft_delete_to_profiles.sql'
      })
    }
  } catch (err) {
    results.push({
      name: 'Policy select_profiles_by_organization',
      required: false,
      exists: false,
      details: 'Erreur lors de la vérification',
      migration: '20251117_add_soft_delete_to_profiles.sql',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Vérification 3: Table profiles (requise pour toutes les migrations)
  console.log('\n📋 Vérification 3: Table profiles')
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      results.push({
        name: 'Table profiles',
        required: true,
        exists: false,
        details: 'Table manquante - requise pour toutes les migrations',
        migration: 'Toutes',
        error: error.message
      })
    } else {
      results.push({
        name: 'Table profiles',
        required: true,
        exists: true,
        details: `Table présente (${count || 0} enregistrements)`,
        migration: 'Toutes'
      })
    }
  } catch (err) {
    results.push({
      name: 'Table profiles',
      required: true,
      exists: false,
      details: 'Erreur lors de la vérification',
      migration: 'Toutes',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Vérification 4: Colonnes profiles existantes (pour migration 2)
  console.log('\n📋 Vérification 4: Structure de la table profiles')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, organization_id, deleted_at, deleted_by')
      .limit(1)

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        // Vérifier quelle colonne manque
        if (error.message.includes('deleted_at') || error.message.includes('deleted_by')) {
          results.push({
            name: 'Colonnes deleted_at/deleted_by',
            required: false,
            exists: false,
            details: 'Colonnes manquantes - seront créées par la migration',
            migration: '20251117_add_soft_delete_to_profiles.sql'
          })
        } else {
          results.push({
            name: 'Structure profiles',
            required: true,
            exists: false,
            details: `Colonne manquante: ${error.message}`,
            migration: 'Toutes',
            error: error.message
          })
        }
      } else {
        results.push({
          name: 'Structure profiles',
          required: true,
          exists: false,
          details: `Erreur: ${error.message}`,
          migration: 'Toutes',
          error: error.message
        })
      }
    } else {
      // Vérifier si deleted_at existe déjà
      const hasDeletedAt = data && data.length > 0 && 'deleted_at' in (data[0] || {})
      results.push({
        name: 'Colonnes deleted_at/deleted_by',
        required: false,
        exists: hasDeletedAt || false,
        details: hasDeletedAt 
          ? 'Colonnes déjà présentes - migration utilisera ADD COLUMN IF NOT EXISTS'
          : 'Colonnes manquantes - seront créées par la migration',
        migration: '20251117_add_soft_delete_to_profiles.sql'
      })
    }
  } catch (err) {
    results.push({
      name: 'Structure profiles',
      required: true,
      exists: false,
      details: 'Erreur lors de la vérification',
      migration: 'Toutes',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Vérification 5: Table webhook_events (pour migration 3)
  console.log('\n📋 Vérification 5: Table webhook_events')
  try {
    const { data, error, count } = await supabase
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        results.push({
          name: 'Table webhook_events',
          required: false,
          exists: false,
          details: 'Table manquante - sera créée par la migration',
          migration: '20251117_webhook_idempotency.sql'
        })
      } else {
        results.push({
          name: 'Table webhook_events',
          required: false,
          exists: false,
          details: `Erreur: ${error.message}`,
          migration: '20251117_webhook_idempotency.sql',
          error: error.message
        })
      }
    } else {
      results.push({
        name: 'Table webhook_events',
        required: false,
        exists: true,
        details: `Table déjà présente (${count || 0} enregistrements) - migration utilisera CREATE TABLE IF NOT EXISTS`,
        migration: '20251117_webhook_idempotency.sql'
      })
    }
  } catch (err) {
    results.push({
      name: 'Table webhook_events',
      required: false,
      exists: false,
      details: 'Erreur lors de la vérification',
      migration: '20251117_webhook_idempotency.sql',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  return results
}

async function main() {
  const results = await checkDependencies()

  console.log('\n' + '='.repeat(70))
  console.log('\n📊 Résultats de la vérification des dépendances:\n')

  let criticalMissing = 0
  let optionalMissing = 0

  for (const result of results) {
    if (result.exists) {
      console.log(`✅ ${result.name}`)
      if (result.details) console.log(`   ${result.details}`)
    } else {
      if (result.required) {
        console.log(`❌ ${result.name} [REQUIS]`)
        criticalMissing++
      } else {
        console.log(`⚠️  ${result.name} [OPTIONNEL]`)
        optionalMissing++
      }
      if (result.error) console.log(`   Erreur: ${result.error}`)
      if (result.details) console.log(`   ${result.details}`)
      console.log(`   Migration: ${result.migration}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log(`\n📈 Résumé:`)
  console.log(`   ✅ Dépendances présentes: ${results.filter(r => r.exists).length}/${results.length}`)
  if (criticalMissing > 0) {
    console.log(`   ❌ Dépendances critiques manquantes: ${criticalMissing}`)
  }
  if (optionalMissing > 0) {
    console.log(`   ⚠️  Dépendances optionnelles manquantes: ${optionalMissing}`)
  }

  // Recommandations
  console.log('\n💡 Recommandations:\n')
  
  const auditLogsMissing = results.find(r => r.name === 'Table audit_logs' && !r.exists)
  if (auditLogsMissing) {
    console.log('⚠️  ATTENTION: La table audit_logs est manquante.')
    console.log('   La migration 2 (soft delete) créera un trigger qui référence cette table.')
    console.log('   Options:')
    console.log('   1. Créer la table audit_logs avant de pousser les migrations')
    console.log('   2. Modifier la migration 2 pour créer la table si elle n\'existe pas')
    console.log('   3. Supprimer le trigger audit_soft_delete() de la migration 2\n')
  }

  const policyMissing = results.find(r => r.name.includes('select_profiles_by_organization') && !r.exists)
  if (policyMissing) {
    console.log('⚠️  ATTENTION: La policy select_profiles_by_organization pourrait ne pas exister.')
    console.log('   La migration 2 utilise ALTER POLICY qui échouera si la policy n\'existe pas.')
    console.log('   Options:')
    console.log('   1. Vérifier manuellement dans Supabase Dashboard')
    console.log('   2. Modifier la migration 2 pour utiliser CREATE POLICY IF NOT EXISTS\n')
  }

  if (criticalMissing === 0 && optionalMissing === 0) {
    console.log('✅ Toutes les dépendances sont présentes!')
    console.log('   Les migrations peuvent être poussées en toute sécurité.\n')
    process.exit(0)
  } else if (criticalMissing === 0) {
    console.log('✅ Aucune dépendance critique manquante.')
    console.log('   Les migrations peuvent être poussées, mais vérifiez les dépendances optionnelles.\n')
    process.exit(0)
  } else {
    console.log('❌ Des dépendances critiques sont manquantes!')
    console.log('   Veuillez résoudre ces problèmes avant de pousser les migrations.\n')
    process.exit(1)
  }
}

main().catch(console.error)

