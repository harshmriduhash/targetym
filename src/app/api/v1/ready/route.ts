import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

/**
 * Readiness check endpoint
 * GET /api/v1/ready
 *
 * Returns 200 when the application is ready to accept traffic
 */
export async function GET() {
  try {
    // Check critical dependencies
    const supabase = await createClient()

    // Test database connection
    const { error: dbError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (dbError) {
      return NextResponse.json(
        { ready: false, reason: 'Database not ready' },
        { status: 503 }
      )
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
    ]

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    )

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          ready: false,
          reason: 'Missing environment variables',
          missing: missingEnvVars,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ ready: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
