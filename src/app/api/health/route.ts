import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint (Liveness Probe)
 * 
 * GET /api/health
 * 
 * Returns basic service health status.
 * Use this for Kubernetes liveness probes or load balancer health checks.
 */
export async function GET() {
  const uptime = process.uptime()
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  })
}
