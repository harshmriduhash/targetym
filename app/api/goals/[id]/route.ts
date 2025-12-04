'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { goalsService } from '@/src/lib/services/goals.service'
import { updateGoalSchema } from '@/src/lib/validations/goals.schemas'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' as const, status: 401 as const }
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!profile?.organization_id) return { error: 'Organization not found' as const, status: 404 as const }
  return { userId: user.id, organizationId: profile.organization_id }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await context.params
    const auth = await requireAuth()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const goal = await goalsService.getGoalById(params.id)
    if (!goal || goal.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ data: goal }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await context.params
    const body = await request.json()
    const validated = updateGoalSchema.parse({ ...body, id: params.id })
    const auth = await requireAuth()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const existing = await goalsService.getGoalById(params.id)
    if (!existing || existing.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { id, ...data } = validated

    // Convert Date objects to ISO strings for database compatibility
    const normalizedData = {
      ...data,
      start_date: data.start_date instanceof Date ? data.start_date.toISOString() : data.start_date,
      end_date: data.end_date instanceof Date ? data.end_date.toISOString() : data.end_date,
    }

    const updated = await goalsService.updateGoal(params.id, auth.userId, normalizedData)
    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const params = await context.params
    const auth = await requireAuth()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const existing = await goalsService.getGoalById(params.id)
    if (!existing || existing.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await goalsService.deleteGoal(params.id, auth.userId)
    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



