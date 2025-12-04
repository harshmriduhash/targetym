'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { goalsService } from '@/src/lib/services/goals.service'
import { createGoalSchema } from '@/src/lib/validations/goals.schemas'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const owner_id = url.searchParams.get('owner_id') || undefined
    const status = url.searchParams.get('status') || undefined
    const period = url.searchParams.get('period') || undefined

    const goals = await goalsService.getGoals(profile.organization_id, {
      owner_id: owner_id || undefined,
      status: status || undefined,
      period: period || undefined,
    })

    return NextResponse.json({ data: goals }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createGoalSchema.parse(body)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const goal = await goalsService.createGoal({
      ...validated,
      start_date: validated.start_date instanceof Date ? validated.start_date.toISOString() : validated.start_date,
      end_date: validated.end_date instanceof Date ? validated.end_date.toISOString() : validated.end_date,
      owner_id: user.id,
      organization_id: profile.organization_id,
    })

    return NextResponse.json({ id: goal.id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}



