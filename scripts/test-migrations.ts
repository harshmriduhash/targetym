import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: string
}

async function testMigrations(): Promise<TestResult[]> {
  const results: TestResult[] = []

  console.log('🧪 Test des migrations non synchronisées...\n')
  console.log('='.repeat(60))

  // Test 1: Vérifier la fonction auth.user_organization_id()
  console.log('\n📋 Test 1: Fonction auth.user_organization_id()')
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'auth'
          AND p.proname = 'user_organization_id'
        ) as exists;
      `
    })
    
    if (error) {
      results.push({
        name: 'Fonction auth.user_organization_id()',
        passed: false,
        error: error.message,
        details: 'La fonction devrait être créée par la migration 20251117000000'
      })
    } else {
      results.push({
        name: 'Fonction auth.user_organization_id()',
        passed: true,
        details: 'Fonction créée avec succès'
      })
    }
  } catch (err) {
    results.push({
      name: 'Fonction auth.user_organization_id()',
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Test 2: Vérifier les colonnes soft-delete sur profiles
  console.log('\n📋 Test 2: Colonnes soft-delete sur profiles')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('deleted_at, deleted_by')
      .limit(1)

    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      results.push({
        name: 'Colonnes soft-delete (deleted_at, deleted_by)',
        passed: false,
        error: 'Colonnes manquantes',
        details: 'Les colonnes devraient être créées par la migration 20251117_add_soft_delete_to_profiles'
      })
    } else {
      results.push({
        name: 'Colonnes soft-delete (deleted_at, deleted_by)',
        passed: true,
        details: 'Colonnes présentes'
      })
    }
  } catch (err) {
    results.push({
      name: 'Colonnes soft-delete',
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Test 3: Vérifier la table webhook_events
  console.log('\n📋 Test 3: Table webhook_events')
  try {
    const { data, error, count } = await supabase
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })

    if (error && error.message.includes('does not exist')) {
      results.push({
        name: 'Table webhook_events',
        passed: false,
        error: 'Table manquante',
        details: 'La table devrait être créée par la migration 20251117_webhook_idempotency'
      })
    } else {
      results.push({
        name: 'Table webhook_events',
        passed: true,
        details: `Table présente (${count || 0} enregistrements)`
      })
    }
  } catch (err) {
    results.push({
      name: 'Table webhook_events',
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Test 4: Vérifier les RLS policies critiques
  console.log('\n📋 Test 4: RLS Policies critiques')
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT COUNT(*) as count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'goals', 'job_postings', 'candidates')
        AND policyname LIKE '%own_organization%';
      `
    })

    if (error) {
      results.push({
        name: 'RLS Policies organisation',
        passed: false,
        error: error.message
      })
    } else {
      const count = data?.[0]?.count || 0
      results.push({
        name: 'RLS Policies organisation',
        passed: count > 0,
        details: `${count} policies trouvées`,
        error: count === 0 ? 'Aucune policy trouvée' : undefined
      })
    }
  } catch (err) {
    results.push({
      name: 'RLS Policies organisation',
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  // Test 5: Vérifier l'index sur deleted_at
  console.log('\n📋 Test 5: Index sur deleted_at')
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND indexname = 'idx_profiles_deleted_at'
        ) as exists;
      `
    })

    if (error) {
      results.push({
        name: 'Index idx_profiles_deleted_at',
        passed: false,
        error: error.message
      })
    } else {
      const exists = data?.[0]?.exists || false
      results.push({
        name: 'Index idx_profiles_deleted_at',
        passed: exists,
        details: exists ? 'Index présent' : 'Index manquant',
        error: !exists ? 'Index devrait être créé par la migration soft-delete' : undefined
      })
    }
  } catch (err) {
    results.push({
      name: 'Index idx_profiles_deleted_at',
      passed: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }

  return results
}

async function main() {
  const results = await testMigrations()

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Résultats des tests:\n')

  let passed = 0
  let failed = 0

  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.name}`)
      if (result.details) console.log(`   ${result.details}`)
      passed++
    } else {
      console.log(`❌ ${result.name}`)
      if (result.error) console.log(`   Erreur: ${result.error}`)
      if (result.details) console.log(`   ${result.details}`)
      failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n📈 Résumé: ${passed}/${results.length} tests réussis`)
  
  if (failed > 0) {
    console.log(`⚠️  ${failed} test(s) échoué(s)`)
    console.log('\n💡 Note: Ces tests vérifient si les migrations sont appliquées.')
    console.log('   Si les tests échouent, cela signifie que les migrations ne sont pas encore appliquées en local.')
    process.exit(1)
  } else {
    console.log('✅ Tous les tests sont passés!')
    process.exit(0)
  }
}

main().catch(console.error)

