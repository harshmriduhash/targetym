import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { createGoalsRepository } from '@/src/lib/repositories/goals.repository'
import { checkRateLimit, RateLimitKeys, RATE_LIMITS, getRateLimitHeaders } from '@/src/lib/middleware/rate-limiter'
import { cache, CacheKeys, CacheTTL } from '@/src/lib/cache/cache-manager'
import { logger } from '@/src/lib/monitoring/logger'
import { z } from 'zod'

/**
 * GET /api/v1/goals - List goals for authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(RateLimitKeys.byUser(userId), RATE_LIMITS.authenticated)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const supabase = await createClient()
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', userId).single()
    if (!profile?.organization_id) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ORGANIZATION', message: 'Organization not found' } },
        { status: 404 }
      )
    }

    const cacheKey = CacheKeys.goals(profile.organization_id)
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached, meta: { cached: true } })
    }

    const repository = createGoalsRepository(supabase)
    const goals = await repository.findByOrganization(profile.organization_id)
    await cache.set(cacheKey, goals, { ttl: CacheTTL.MEDIUM })

    logger.info({ userId, count: goals.length }, 'Goals fetched')
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch goals')
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/goals - Create a new goal
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    }

    const body = await request.json()
    const schema = z.object({
      title: z.string().min(1).max(200),
      period: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'YEARLY']),
    })
    const validated = schema.parse(body)

    const supabase = await createClient()
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', userId).single()

    const repository = createGoalsRepository(supabase)
    const goal = await repository.create({
      ...validated,
      owner_id: userId,
      organization_id: profile.organization_id,
    })

    await cache.deletePattern('goals:org:' + profile.organization_id + '*')
    logger.info({ goalId: goal.id }, 'Goal created')

    return NextResponse.json({ success: true, data: { id: goal.id } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      )
    }
    logger.error({ err: error }, 'Failed to create goal')
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 })
  }
}
