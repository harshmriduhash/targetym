#!/usr/bin/env tsx
/**
 * Clerk Authentication Health Check
 * Verifies Clerk configuration and connectivity
 * Run: npx tsx scripts/check-auth.ts
 */

import https from 'https'
import { URL } from 'url'

interface HealthCheckResult {
  name: string
  status: 'OK' | 'FAIL' | 'WARN'
  message: string
  details?: string
}

const results: HealthCheckResult[] = []

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m',
  }

  console.log(`${colors[type]}${type.toUpperCase()}${colors.reset} ${message}`)
}

function checkEnvVariable(name: string, pattern?: RegExp): boolean {
  const value = process.env[name]

  if (!value) {
    log(`Missing ${name}`, 'error')
    results.push({
      name,
      status: 'FAIL',
      message: `Environment variable not set`,
    })
    return false
  }

  if (pattern && !pattern.test(value)) {
    log(`Invalid format for ${name}`, 'error')
    results.push({
      name,
      status: 'FAIL',
      message: `Invalid format: ${value.substring(0, 4)}...`,
      details: `Expected pattern: ${pattern}`,
    })
    return false
  }

  log(`${name} is configured`, 'success')
  results.push({
    name,
    status: 'OK',
    message: 'Configured correctly',
  })
  return true
}

function verifyClerkAPI(): Promise<void> {
  return new Promise((resolve) => {
    const url = new URL('https://api.clerk.com/v1/environment')

    const request = https.request(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      },
      (response) => {
        if (response.statusCode === 200) {
          log('Clerk API is accessible and authenticated', 'success')
          results.push({
            name: 'Clerk API',
            status: 'OK',
            message: 'API is accessible and authenticated',
          })
        } else if (response.statusCode === 401) {
          log('Clerk API: Invalid credentials', 'error')
          results.push({
            name: 'Clerk API',
            status: 'FAIL',
            message: 'Invalid CLERK_SECRET_KEY',
            details: `Status: ${response.statusCode}`,
          })
        } else {
          log(`Clerk API responded with status ${response.statusCode}`, 'warn')
          results.push({
            name: 'Clerk API',
            status: 'WARN',
            message: `Unexpected status code`,
            details: `Status: ${response.statusCode}`,
          })
        }
        resolve()
      }
    )

    request.on('error', (error) => {
      log(`Clerk API connection failed: ${error.message}`, 'error')
      results.push({
        name: 'Clerk API',
        status: 'FAIL',
        message: 'Connection failed',
        details: error.message,
      })
      resolve()
    })

    request.end()
  })
}

function checkWebhookSetup(): boolean {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    log('Webhook secret not configured', 'warn')
    results.push({
      name: 'Clerk Webhook',
      status: 'WARN',
      message: 'CLERK_WEBHOOK_SECRET not set',
      details: 'User sync may not work. Required for production.',
    })
    return false
  }

  if (!webhookSecret.startsWith('whsec_')) {
    log('Webhook secret has invalid format', 'error')
    results.push({
      name: 'Clerk Webhook',
      status: 'FAIL',
      message: 'Invalid webhook secret format',
      details: 'Must start with whsec_',
    })
    return false
  }

  log('Webhook secret is configured', 'success')
  results.push({
    name: 'Clerk Webhook',
    status: 'OK',
    message: 'Webhook secret is configured correctly',
  })
  return true
}

async function runHealthCheck() {
  console.log('\n' + '='.repeat(80))
  console.log('Clerk Authentication Health Check')
  console.log('='.repeat(80) + '\n')

  // Check required environment variables
  log('Checking environment variables...', 'info')
  const publishableKeyOK = checkEnvVariable('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', /^pk_(test|live)_/)
  const secretKeyOK = checkEnvVariable('CLERK_SECRET_KEY', /^sk_(test|live)_/)
  checkWebhookSetup()

  // Verify API connectivity (only if secret key is valid)
  if (secretKeyOK) {
    log('\nVerifying Clerk API connectivity...', 'info')
    await verifyClerkAPI()
  } else {
    log('Skipping API verification (invalid secret key)', 'warn')
  }

  // Print summary
  console.log('\n' + '='.repeat(80))
  console.log('Summary')
  console.log('='.repeat(80) + '\n')

  const okCount = results.filter((r) => r.status === 'OK').length
  const failCount = results.filter((r) => r.status === 'FAIL').length
  const warnCount = results.filter((r) => r.status === 'WARN').length

  for (const result of results) {
    const icon = result.status === 'OK' ? '✓' : result.status === 'FAIL' ? '✗' : '!'
    const color =
      result.status === 'OK' ? '\x1b[32m' : result.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m'
    const reset = '\x1b[0m'

    console.log(`${color}${icon}${reset} ${result.name}: ${result.message}`)
    if (result.details) {
      console.log(`  └─ ${result.details}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`Results: ${okCount} OK, ${warnCount} warnings, ${failCount} failures`)
  console.log('='.repeat(80) + '\n')

  if (failCount > 0) {
    log('FAILED: Fix the errors above to proceed.', 'error')
    log('Next steps:', 'info')
    log('1. Visit https://dashboard.clerk.com/last-active?path=api-keys', 'info')
    log('2. Copy your Publishable Key and Secret Key', 'info')
    log('3. Update .env.local with correct values', 'info')
    log('4. Restart the development server', 'info')
    process.exit(1)
  } else if (warnCount > 0) {
    log('WARNING: Some optional features are not configured.', 'warn')
    log('This is OK for development, but required for production.', 'warn')
    process.exit(0)
  } else {
    log('SUCCESS: Clerk is properly configured!', 'success')
    process.exit(0)
  }
}

// Run health check
runHealthCheck().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'error')
  process.exit(1)
})
