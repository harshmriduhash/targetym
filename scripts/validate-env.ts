#!/usr/bin/env tsx
/**
 * Environment Configuration Validator
 * Validates all required and optional environment variables for Targetym
 * Run: npx tsx scripts/validate-env.ts
 */

import fs from 'fs'
import path from 'path'

interface EnvVar {
  name: string
  required: boolean
  category: string
  description: string
  example?: string
}

const ENV_VARS: EnvVar[] = [
  // Application
  {
    name: 'NODE_ENV',
    required: false,
    category: 'Application',
    description: 'Environment mode (development, production)',
    example: 'development',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    category: 'Application',
    description: 'Application base URL',
    example: 'http://localhost:3001',
  },

  // Clerk Authentication
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    category: 'Clerk Authentication',
    description: 'Clerk public key (starts with pk_test_ or pk_live_)',
    example: 'pk_test_...',
  },
  {
    name: 'CLERK_SECRET_KEY',
    required: true,
    category: 'Clerk Authentication',
    description: 'Clerk secret key (starts with sk_test_ or sk_live_)',
    example: 'sk_test_...',
  },
  {
    name: 'CLERK_WEBHOOK_SECRET',
    required: true,
    category: 'Clerk Authentication',
    description: 'Clerk webhook signing secret (starts with whsec_)',
    example: 'whsec_...',
  },

  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    category: 'Supabase',
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    category: 'Supabase',
    description: 'Supabase anonymous key (for client-side)',
    example: 'eyJ...',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    category: 'Supabase',
    description: 'Supabase service role key (for server-side)',
    example: 'eyJ...',
  },

  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    category: 'Database',
    description: 'PostgreSQL connection string (pooled)',
    example: 'postgresql://postgres:password@localhost:5432/postgres',
  },

  // AI Features (Optional)
  {
    name: 'OPENAI_API_KEY',
    required: false,
    category: 'AI Features',
    description: 'OpenAI API key for AI-powered features',
    example: 'sk-...',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    category: 'AI Features',
    description: 'Anthropic Claude API key (alternative to OpenAI)',
    example: 'sk-ant-...',
  },

  // Optional Services
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    category: 'Rate Limiting',
    description: 'Upstash Redis URL for rate limiting',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    category: 'Rate Limiting',
    description: 'Upstash Redis token for rate limiting',
  },
]

interface ValidationResult {
  name: string
  status: 'OK' | 'MISSING' | 'INVALID'
  value?: string
  message: string
}

function validateEnv(): ValidationResult[] {
  const results: ValidationResult[] = []
  const envFile = path.join(process.cwd(), '.env.local')
  const envPath = path.join(process.cwd(), '.env.production.example')

  // Load environment variables
  const env = process.env

  for (const variable of ENV_VARS) {
    const value = env[variable.name]

    if (!value) {
      if (variable.required) {
        results.push({
          name: variable.name,
          status: 'MISSING',
          message: `[REQUIRED] Missing: ${variable.description}`,
        })
      } else {
        results.push({
          name: variable.name,
          status: 'MISSING',
          message: `[OPTIONAL] Not set: ${variable.description}`,
        })
      }
      continue
    }

    // Validate format for known patterns
    let isValid = true
    let validationError = ''

    if (variable.name === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
      isValid = value.startsWith('pk_test_') || value.startsWith('pk_live_')
      validationError = 'Must start with pk_test_ or pk_live_'
    } else if (variable.name === 'CLERK_SECRET_KEY') {
      isValid = value.startsWith('sk_test_') || value.startsWith('sk_live_')
      validationError = 'Must start with sk_test_ or sk_live_'
    } else if (variable.name === 'CLERK_WEBHOOK_SECRET') {
      isValid = value.startsWith('whsec_')
      validationError = 'Must start with whsec_'
    } else if (variable.name === 'OPENAI_API_KEY') {
      isValid = value.startsWith('sk-')
      validationError = 'Must start with sk-'
    } else if (variable.name === 'ANTHROPIC_API_KEY') {
      isValid = value.startsWith('sk-ant-')
      validationError = 'Must start with sk-ant-'
    }

    if (!isValid) {
      results.push({
        name: variable.name,
        status: 'INVALID',
        value: maskSensitive(variable.name, value),
        message: `[INVALID FORMAT] ${validationError}`,
      })
    } else {
      results.push({
        name: variable.name,
        status: 'OK',
        value: maskSensitive(variable.name, value),
        message: 'OK',
      })
    }
  }

  return results
}

function maskSensitive(name: string, value: string): string {
  if (!value) return ''
  if (name.includes('KEY') || name.includes('SECRET') || name.includes('URL') || name.includes('TOKEN')) {
    if (value.length <= 10) return '***'
    return value.substring(0, 4) + '...' + value.substring(value.length - 4)
  }
  return value
}

function groupResults(results: ValidationResult[]): Map<string, ValidationResult[]> {
  const grouped = new Map<string, ValidationResult[]>()

  for (const result of results) {
    const variable = ENV_VARS.find((v) => v.name === result.name)
    const category = variable?.category || 'Other'

    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    grouped.get(category)!.push(result)
  }

  return grouped
}

function formatOutput(results: ValidationResult[]): void {
  const grouped = groupResults(results)
  const categories = Array.from(grouped.keys()).sort()

  console.log('\n' + '='.repeat(80))
  console.log('Environment Configuration Validator')
  console.log('='.repeat(80) + '\n')

  let hasErrors = false
  let hasWarnings = false

  for (const category of categories) {
    const categoryResults = grouped.get(category)!
    console.log(`\n[${category}]`)
    console.log('-'.repeat(80))

    for (const result of categoryResults) {
      const icon = result.status === 'OK' ? '✓' : result.status === 'MISSING' ? '✗' : '!'
      const color =
        result.status === 'OK' ? '\x1b[32m' : result.status === 'MISSING' ? '\x1b[31m' : '\x1b[33m'
      const reset = '\x1b[0m'

      const variable = ENV_VARS.find((v) => v.name === result.name)
      const required = variable?.required ? '[REQUIRED]' : '[OPTIONAL]'

      console.log(`${color}${icon}${reset} ${result.name} ${required}`)
      console.log(`  └─ ${result.message}`)
      if (result.value) {
        console.log(`  └─ Value: ${result.value}`)
      }
      if (variable?.description) {
        console.log(`  └─ ${variable.description}`)
      }

      if (result.status === 'MISSING' && variable?.required) {
        hasErrors = true
      } else if (result.status === 'MISSING') {
        hasWarnings = true
      } else if (result.status === 'INVALID') {
        hasErrors = true
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  const okCount = results.filter((r) => r.status === 'OK').length
  const missingCount = results.filter((r) => r.status === 'MISSING').length
  const invalidCount = results.filter((r) => r.status === 'INVALID').length

  console.log(`Summary: ${okCount} OK, ${missingCount} missing, ${invalidCount} invalid`)

  if (hasErrors) {
    console.log('\n\x1b[31mERROR: Missing required environment variables\x1b[0m')
    console.log('\nTo fix:')
    console.log('1. Copy .env.production.example to .env.local')
    console.log('2. Fill in missing values from:')
    console.log('   - Clerk Dashboard: https://dashboard.clerk.com/last-active?path=api-keys')
    console.log('   - Supabase Dashboard: https://supabase.com/dashboard')
    console.log('3. See CLERK_QUICK_START.md for detailed setup instructions')
  } else if (hasWarnings) {
    console.log('\n\x1b[33mWARNING: Some optional features are not configured\x1b[0m')
    console.log('This is fine for development, but required for production.')
  } else {
    console.log('\n\x1b[32mSUCCESS: All required environment variables are configured!\x1b[0m')
  }

  console.log('='.repeat(80) + '\n')

  process.exit(hasErrors ? 1 : 0)
}

// Run validation
const results = validateEnv()
formatOutput(results)
