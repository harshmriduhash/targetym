import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

/**
 * Readiness Check Endpoint (Readiness Probe)
 * 
 * GET /api/health/ready
 * 
 * Checks if the service is ready to handle requests.
 * Verifies database connectivity and critical dependencies.
 */
export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {}
  
  // Check database connectivity
  try {
    const dbStart = Date.now()
    const supabase = await createClient()
    
    // Simple query to verify connection
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle()
    
    const dbLatency = Date.now() - dbStart
    
    if (error) {
      checks.database = {
        status: 'unhealthy',
        latency: dbLatency,
        error: error.message,
      }
    } else {
      checks.database = {
        status: 'healthy',
        latency: dbLatency,
      }
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
  
  // Check if all critical services are healthy
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy')
  const overallStatus = allHealthy ? 'ready' : 'not_ready'
  
  return NextResponse.json(
    {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allHealthy ? 200 : 503,
    }
  )
}
