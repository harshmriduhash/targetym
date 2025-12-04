/**
 * Advanced Health Check Endpoint
 * MVP Smart - Phase 2 Optimization
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { getCacheStats } from '@/src/lib/cache'
import { log } from '@/src/lib/logger'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: HealthStatus
    redis: HealthStatus
    ai?: HealthStatus
  }
  uptime: number
}

interface HealthStatus {
  status: 'up' | 'down'
  responseTime?: number
  details?: Record<string, any>
  error?: string
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now()

  try {
    const supabase = await createClient()

    // Simple query to test connection
    const { error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        error: error.message,
      }
    }

    return {
      status: 'up',
      responseTime: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: String(error),
    }
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<HealthStatus> {
  const start = Date.now()

  try {
    const stats = await getCacheStats()

    if (!stats || !stats.connected) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        details: { configured: Boolean(process.env.UPSTASH_REDIS_REST_URL) },
      }
    }

    return {
      status: 'up',
      responseTime: Date.now() - start,
      details: { connected: true },
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: String(error),
    }
  }
}

/**
 * Check AI services (optional)
 */
async function checkAI(): Promise<HealthStatus> {
  const start = Date.now()

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY)

  if (!hasOpenAI && !hasAnthropic) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      details: { configured: false },
    }
  }

  return {
    status: 'up',
    responseTime: Date.now() - start,
    details: {
      openai: hasOpenAI,
      anthropic: hasAnthropic,
    },
  }
}

/**
 * GET /api/health
 */
export async function GET() {
  const start = Date.now()

  try {
    // Run all checks in parallel
    const [database, redis, ai] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkAI(),
    ])

    // Determine overall status
    const checks = { database, redis, ai }
    const isHealthy = database.status === 'up' && redis.status === 'up'
    const isDegraded = database.status === 'up' && redis.status === 'down'

    const response: HealthCheck = {
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      checks,
      uptime: Date.now() - start,
    }

    // Log health check
    log.info('Health check completed', {
      status: response.status,
      uptime: response.uptime,
      database: database.status,
      redis: redis.status,
    })

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : isDegraded ? 200 : 503

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    log.error('Health check failed', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error),
      },
      { status: 503 }
    )
  }
}
