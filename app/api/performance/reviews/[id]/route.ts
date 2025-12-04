'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { updatePerformanceReviewSchema } from '@/src/lib/validations/performance.schemas'

interface RouteContext { params: Promise<{ id: string }> }

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' as const, status: 401 as const }
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  const orgId = (profile as any)?.organization_id as string | undefined
  if (!orgId) return { error: 'Organization not found' as const, status: 404 as const }
  return { orgId }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await context.params
    const body = await request.json()
    const validated = updatePerformanceReviewSchema.parse(body)
    const auth = await requireAuth()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    // No ownership enforcement here; assume RLS handles org scoping
    const updated = await performanceService.updatePerformanceReview(params.id, validated)
    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


