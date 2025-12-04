import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n')
  console.log(`URL: ${supabaseUrl}\n`)

  // Test 1: Vérifier les tables principales
  console.log('📊 Vérification des tables principales...\n')
  
  const tables = [
    'organizations',
    'profiles',
    'goals',
    'key_results',
    'job_postings',
    'candidates',
    'performance_reviews',
    'kpis',
    'notifications',
    'integrations',
    'feature_flags',
    'ab_test_experiments'
  ]

  const results: Record<string, { exists: boolean; error?: string; count?: number }> = {}

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        results[table] = { exists: false, error: error.message }
      } else {
        results[table] = { exists: true, count: count || 0 }
      }
    } catch (err) {
      results[table] = { 
        exists: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }

  // Afficher les résultats
  console.log('Résultats:\n')
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table.padEnd(25)} - ${result.count} enregistrement(s)`)
    } else {
      console.log(`❌ ${table.padEnd(25)} - ${result.error}`)
    }
  }

  // Test 2: Vérifier les RLS policies
  console.log('\n🔒 Vérification des RLS policies...\n')
  
  const { data: policies, error: policiesError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
        LIMIT 20;
      `
    })

  if (policiesError) {
    console.log('⚠️  Impossible de vérifier les RLS policies (normal en local)')
  } else {
    console.log(`✅ ${policies?.length || 0} RLS policies trouvées`)
  }

  // Test 3: Vérifier les extensions
  console.log('\n🔧 Vérification des extensions PostgreSQL...\n')
  
  const { data: extensions, error: extensionsError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT name, default_version, installed_version
        FROM pg_available_extensions
        WHERE name IN ('uuid-ossp', 'pg_stat_statements', 'pg_trgm')
        ORDER BY name;
      `
    })

  if (extensionsError) {
    console.log('⚠️  Impossible de vérifier les extensions (normal en local)')
  } else {
    console.log('Extensions disponibles:')
    extensions?.forEach((ext: any) => {
      console.log(`  - ${ext.name}: ${ext.installed_version || 'non installé'}`)
    })
  }

  // Résumé
  console.log('\n' + '='.repeat(50))
  const existingTables = Object.values(results).filter(r => r.exists).length
  const totalTables = tables.length
  console.log(`\n📈 Résumé: ${existingTables}/${totalTables} tables existent\n`)

  if (existingTables === totalTables) {
    console.log('✅ Toutes les tables sont présentes!')
    process.exit(0)
  } else {
    console.log('⚠️  Certaines tables manquent. Vérifiez les migrations.')
    process.exit(1)
  }
}

testConnection().catch(console.error)
