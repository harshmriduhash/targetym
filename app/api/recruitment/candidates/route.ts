'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createCandidateSchema } from '@/src/lib/validations/recruitment.schemas'

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
    const job_posting_id = url.searchParams.get('job_posting_id') || undefined
    const status = url.searchParams.get('status') || undefined
    const current_stage = url.searchParams.get('current_stage') || undefined

    const candidates = await recruitmentService.getCandidates(orgId, { job_posting_id, status, current_stage })
    return NextResponse.json({ data: candidates }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createCandidateSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    const role = (profile as any).role as string | undefined
    const orgIdPost = (profile as any).organization_id as string | undefined
    if (!['admin', 'manager', 'employee'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const candidate = await recruitmentService.createCandidate({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      cv_url: validated.cv_url,
      cover_letter: validated.cover_letter,
      linkedin_url: validated.linkedin_url,
      portfolio_url: validated.portfolio_url,
      source: validated.source,
      job_posting_id: validated.job_posting_id,
      organization_id: orgIdPost!,
    })
    return NextResponse.json({ id: candidate.id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


