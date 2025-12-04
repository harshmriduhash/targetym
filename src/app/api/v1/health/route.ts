import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

/**
 * Health check endpoint
 * GET /api/v1/health
 */
export async function GET() {
  const startTime = Date.now()

  try {
    // Check database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    const dbStatus = dbError ? 'unhealthy' : 'healthy'
    const responseTime = Date.now() - startTime

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
        },
        auth: {
          status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'healthy' : 'unhealthy',
        },
      },
      environment: process.env.NODE_ENV,
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
