'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { createPerformanceReviewSchema } from '@/src/lib/validations/performance.schemas'

export async function GET(request: Request) {
  try {
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

    const url = new URL(request.url)
    const reviewee_id = url.searchParams.get('reviewee_id') || undefined
    const reviewer_id = url.searchParams.get('reviewer_id') || undefined
    const status = url.searchParams.get('status') || undefined
    const review_period = url.searchParams.get('review_period') || undefined

    const reviews = await performanceService.getPerformanceReviews(orgId, { reviewee_id, reviewer_id, status, review_period })
    return NextResponse.json({ data: reviews }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createPerformanceReviewSchema.parse(body)

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

    // Derive review period dates from the review_cycle_id
    // In a real implementation, you would fetch from review_cycles table
    // For now, we'll use current date as start and add 3 months as end
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 3)

    const review = await performanceService.createPerformanceReview({
      reviewee_id: validated.employee_id,
      reviewer_id: user.id,
      review_period: `${validated.review_cycle_id}`,
      review_period_start: startDate.toISOString(),
      review_period_end: endDate.toISOString(),
      review_type: validated.review_type,
      status: 'draft',
      organization_id: orgId,
    })
    return NextResponse.json({ id: review.id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


