#!/usr/bin/env tsx
/**
 * Script de validation des variables d'environnement pour la production
 * Usage: tsx scripts/validate-production-env.ts
 */

import { z } from 'zod'

const envSchema = z.object({
  // Clerk - Obligatoire
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'Clerk publishable key must start with pk_')
    .min(50, 'Clerk publishable key is too short'),

  CLERK_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'Clerk secret key must start with sk_')
    .min(50, 'Clerk secret key is too short'),

  CLERK_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'Clerk webhook secret must start with whsec_')
    .min(50, 'Clerk webhook secret is too short'),

  // Supabase - Obligatoire
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('Supabase URL must be a valid URL')
    .includes('supabase.co', 'Supabase URL must be from supabase.co'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(100, 'Supabase anon key is too short')
    .startsWith('eyJ', 'Supabase anon key must be a valid JWT'),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(100, 'Supabase service role key is too short')
    .startsWith('eyJ', 'Supabase service role key must be a valid JWT'),

  // Application - Obligatoire
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('App URL must be a valid URL')
    .refine((url) => url.startsWith('https://'), 'App URL must use HTTPS in production'),

  NODE_ENV: z.enum(['production', 'development', 'test'], {
    errorMap: () => ({ message: 'NODE_ENV must be production, development, or test' }),
  }),

  // Optionnel mais recommandé
  DATABASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

interface ValidationResult {
  success: boolean
  errors: Array<{ path: string; message: string }>
  warnings: string[]
  missing: string[]
}

export function validateProductionEnv(): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    missing: [],
  }

  try {
    envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.success = false
      result.errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))
    }
  }

  // Vérifier les variables manquantes optionnelles mais recommandées
  const recommendedVars = [
    { key: 'DATABASE_URL', description: 'Database connection string for migrations' },
    { key: 'UPSTASH_REDIS_REST_URL', description: 'Upstash Redis URL for rate limiting' },
    { key: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash Redis token for rate limiting' },
  ]

  recommendedVars.forEach(({ key, description }) => {
    if (!process.env[key]) {
      result.warnings.push(`⚠️  ${key} is not set. ${description}`)
    }
  })

  // Vérifier la cohérence des URLs
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL)
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (appUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      result.warnings.push('⚠️  NEXT_PUBLIC_APP_URL should use HTTPS in production')
    }
  }

  return result
}

function printResults(result: ValidationResult) {
  console.log('\n🔍 Production Environment Validation\n')
  console.log('=' .repeat(50))

  if (result.success) {
    console.log('✅ All required environment variables are valid!\n')
  } else {
    console.log('❌ Validation failed!\n')
    console.log('Errors:')
    result.errors.forEach((error) => {
      console.log(`  ❌ ${error.path}: ${error.message}`)
    })
    console.log('')
  }

  if (result.warnings.length > 0) {
    console.log('Warnings:')
    result.warnings.forEach((warning) => {
      console.log(`  ${warning}`)
    })
    console.log('')
  }

  // Afficher un résumé des variables
  console.log('Environment Variables Summary:')
  console.log('  ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing')
  console.log('  ✅ CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing')
  console.log('  ✅ CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET ? 'Set' : 'Missing')
  console.log('  ✅ NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
  console.log('  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
  console.log('  ✅ SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
  console.log('  ✅ NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Missing')
  console.log('  ✅ NODE_ENV:', process.env.NODE_ENV || 'Missing')

  console.log('\n' + '='.repeat(50))

  if (result.success) {
    console.log('✅ Ready for production deployment!\n')
    process.exit(0)
  } else {
    console.log('❌ Please fix the errors above before deploying.\n')
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  const result = validateProductionEnv()
  printResults(result)
}

export default validateProductionEnv

