'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, current_stage } = body || {}
    if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 })

    const updated = await recruitmentService.updateCandidateStatus(params.id, status, current_stage)
    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


