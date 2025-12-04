'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createJobPostingSchema } from '@/src/lib/validations/recruitment.schemas'

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
    const status = url.searchParams.get('status') || undefined
    const department = url.searchParams.get('department') || undefined
    const hiring_manager_id = url.searchParams.get('hiring_manager_id') || undefined

    const jobs = await recruitmentService.getJobPostings(orgId, { status, department, hiring_manager_id })
    return NextResponse.json({ data: jobs }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createJobPostingSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    const role = (profile as any).role as string | undefined
    const orgId = (profile as any).organization_id as string | undefined
    if (!['admin', 'manager'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const job = await recruitmentService.createJobPosting({
      ...validated,
      requirements: validated.requirements,
      responsibilities: validated.responsibilities,
      organization_id: orgId!,
      posted_by: user.id,
    })
    return NextResponse.json({ id: job.id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


