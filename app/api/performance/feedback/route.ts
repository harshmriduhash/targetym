'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { submitFeedbackSchema } from '@/src/lib/validations/performance.schemas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = submitFeedbackSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    const orgId = (profile as any)?.organization_id as string | undefined
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const feedback = await performanceService.createFeedback({
      review_id: validated.recipient_id,
      reviewer_id: user.id,
      feedback_text: validated.content,
      strengths: undefined,
      areas_for_improvement: undefined,
      is_anonymous: validated.is_anonymous,
      organization_id: orgId,
    })

    return NextResponse.json({ id: feedback.id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


