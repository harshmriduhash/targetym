# Integration Examples - Phase 2 Core HR Modules

Complete code examples for integrating Supabase with your Next.js 15 application.

## Table of Contents

1. [Goals & OKRs Examples](#goals--okrs-examples)
2. [Recruitment Examples](#recruitment-examples)
3. [Performance Examples](#performance-examples)
4. [Real-time Subscriptions](#real-time-subscriptions)
5. [Server Components](#server-components)
6. [API Routes](#api-routes)

## Goals & OKRs Examples

### Create Goal with Key Results

```typescript
// app/goals/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GoalInsert, KeyResultInsert } from '@/types/supabase'

export async function createGoalWithKeyResults(
  goalData: Omit<GoalInsert, 'organization_id' | 'owner_id'>,
  keyResults: Omit<KeyResultInsert, 'organization_id' | 'goal_id'>[]
) {
  const supabase = await createServerClient()

  // Get current user and org
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) throw new Error('No organization')

  // Create goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      ...goalData,
      organization_id: profile.organization_id,
      owner_id: user.id,
    })
    .select()
    .single()

  if (goalError) throw goalError

  // Create key results
  if (keyResults.length > 0) {
    const keyResultsWithIds = keyResults.map(kr => ({
      ...kr,
      organization_id: profile.organization_id,
      goal_id: goal.id,
    }))

    const { error: krError } = await supabase
      .from('key_results')
      .insert(keyResultsWithIds)

    if (krError) throw krError
  }

  revalidatePath('/goals')
  return goal
}
```

### Update Key Result Progress

```typescript
// app/goals/[id]/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateKeyResultProgress(
  keyResultId: string,
  currentValue: number
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('key_results')
    .update({ current_value: currentValue })
    .eq('id', keyResultId)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/goals')
  return data
}
```

### Display Goals with Progress (Server Component)

```typescript
// app/goals/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { GoalCard } from '@/components/goals/goal-card'

export default async function GoalsPage() {
  const supabase = await createServerClient()

  const { data: goals } = await supabase
    .from('goals_with_progress')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Goals & OKRs</h1>

      <div className="grid gap-4">
        {goals?.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  )
}
```

### Goal Card Component (Client Component)

```typescript
// components/goals/goal-card.tsx
'use client'

import { useState } from 'react'
import type { GoalWithProgress } from '@/types/supabase'
import { updateKeyResultProgress } from '@/app/goals/[id]/actions'

interface GoalCardProps {
  goal: GoalWithProgress
}

export function GoalCard({ goal }: GoalCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const progressColor =
    goal.progress_percentage >= 75 ? 'bg-green-500' :
    goal.progress_percentage >= 50 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{goal.title}</h3>
          <p className="text-gray-600 text-sm">
            Owner: {goal.owner_name} • Period: {goal.period}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
          goal.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {goal.status}
        </span>
      </div>

      {goal.description && (
        <p className="text-gray-700 mb-4">{goal.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span className="font-semibold">
            {goal.completed_key_results} / {goal.total_key_results} Key Results
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${progressColor} h-2 rounded-full transition-all`}
            style={{ width: `${goal.progress_percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

## Recruitment Examples

### Create Job Posting with Form

```typescript
// app/recruitment/job-postings/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { JobPostingInsert } from '@/types/supabase'

export async function createJobPosting(
  data: Omit<JobPostingInsert, 'organization_id' | 'created_by'>
) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) throw new Error('No organization')
  if (!['admin', 'hr', 'manager'].includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  const { data: jobPosting, error } = await supabase
    .from('job_postings')
    .insert({
      ...data,
      organization_id: profile.organization_id,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/recruitment/job-postings')
  return jobPosting
}
```

### Upload CV and Create Candidate

```typescript
// app/recruitment/candidates/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { uploadCV } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'

export async function createCandidateWithCV(
  formData: FormData
) {
  const supabase = await createServerClient()

  // Extract form data
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const jobPostingId = formData.get('job_posting_id') as string
  const cvFile = formData.get('cv') as File

  // Get current user and org
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) throw new Error('No organization')

  // Create candidate first (to get ID)
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      organization_id: profile.organization_id,
      job_posting_id: jobPostingId,
      name,
      email,
      status: 'new',
    })
    .select()
    .single()

  if (candidateError) throw candidateError

  // Upload CV if provided
  if (cvFile && cvFile.size > 0) {
    try {
      const cvUrl = await uploadCV(candidate.id, cvFile)

      // Update candidate with CV URL
      await supabase
        .from('candidates')
        .update({ cv_url: cvUrl })
        .eq('id', candidate.id)

      // Trigger AI CV scoring (async)
      await supabase.functions.invoke('ai-cv-scoring', {
        body: {
          candidate_id: candidate.id,
          cv_text: await extractTextFromCV(cvFile),
          job_requirements: await getJobRequirements(jobPostingId),
        },
      })
    } catch (uploadError) {
      console.error('CV upload failed:', uploadError)
      // Continue - candidate is created, CV upload is optional
    }
  }

  revalidatePath('/recruitment/candidates')
  return candidate
}

async function extractTextFromCV(file: File): Promise<string> {
  // TODO: Implement CV text extraction
  // Use libraries like pdf-parse for PDFs or mammoth for DOCX
  return 'CV text extraction not implemented'
}

async function getJobRequirements(jobPostingId: string): Promise<string> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('job_postings')
    .select('requirements, description')
    .eq('id', jobPostingId)
    .single()

  return `${data?.description}\n\n${data?.requirements}`
}
```

### Candidate Pipeline View

```typescript
// app/recruitment/candidates/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { CandidatePipeline } from '@/components/recruitment/candidate-pipeline'

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { job_posting_id?: string }
}) {
  const supabase = await createServerClient()

  let query = supabase
    .from('candidates')
    .select('*, job_posting:job_postings(*)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (searchParams.job_posting_id) {
    query = query.eq('job_posting_id', searchParams.job_posting_id)
  }

  const { data: candidates } = await query

  // Group by status
  const grouped = {
    new: candidates?.filter(c => c.status === 'new') || [],
    screening: candidates?.filter(c => c.status === 'screening') || [],
    interview: candidates?.filter(c => c.status === 'interview') || [],
    offer: candidates?.filter(c => c.status === 'offer') || [],
    hired: candidates?.filter(c => c.status === 'hired') || [],
    rejected: candidates?.filter(c => c.status === 'rejected') || [],
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Candidate Pipeline</h1>
      <CandidatePipeline candidates={grouped} />
    </div>
  )
}
```

## Performance Examples

### Create Performance Review

```typescript
// app/performance/reviews/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPerformanceReview(data: {
  reviewee_id: string
  review_period: string
  review_type: string
  scheduled_date: string
}) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!['admin', 'hr', 'manager'].includes(profile?.role || '')) {
    throw new Error('Insufficient permissions')
  }

  const { data: review, error } = await supabase
    .from('performance_reviews')
    .insert({
      ...data,
      organization_id: profile.organization_id!,
      reviewer_id: user.id,
      status: 'scheduled',
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/performance/reviews')
  return review
}
```

### Complete Review with AI Synthesis

```typescript
// app/performance/reviews/[id]/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeReviewWithAI(
  reviewId: string,
  reviewData: {
    overall_rating: number
    overall_comments: string
    strengths: string
    areas_for_improvement: string
  }
) {
  const supabase = await createServerClient()

  // Update review
  const { data: review, error: updateError } = await supabase
    .from('performance_reviews')
    .update({
      ...reviewData,
      status: 'completed',
      completed_date: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (updateError) throw updateError

  // Trigger AI synthesis
  const { data: aiData, error: aiError } = await supabase.functions.invoke(
    'ai-performance-synthesis',
    {
      body: {
        review_id: reviewId,
        profile_id: review.reviewee_id,
        include_historical: true,
      },
    }
  )

  if (aiError) {
    console.error('AI synthesis failed:', aiError)
    // Don't throw - review is already saved
  }

  revalidatePath(`/performance/reviews/${reviewId}`)
  return { review, aiData }
}
```

## Real-time Subscriptions

### Subscribe to Goal Updates

```typescript
// components/goals/real-time-goals.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Goal } from '@/types/supabase'

export function RealTimeGoals({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGoals(prev => [payload.new as Goal, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setGoals(prev =>
              prev.map(goal =>
                goal.id === payload.new.id ? (payload.new as Goal) : goal
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setGoals(prev => prev.filter(goal => goal.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {goals.map(goal => (
        <div key={goal.id}>{goal.title}</div>
      ))}
    </div>
  )
}
```

## Server Components

### Fetch Data in Server Component

```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  // Parallel data fetching
  const [
    { data: profile },
    { data: goals },
    { data: candidates },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*').single(),
    supabase.from('goals_with_progress').select('*').limit(5),
    supabase.from('candidates').select('*').limit(10),
    supabase.from('performance_review_summary').select('*').limit(5),
  ])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {profile?.full_name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Active Goals" count={goals?.length || 0} />
        <DashboardCard title="New Candidates" count={candidates?.length || 0} />
        <DashboardCard title="Pending Reviews" count={reviews?.length || 0} />
      </div>
    </div>
  )
}
```

## API Routes

### API Route for External Integrations

```typescript
// app/api/candidates/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get query params
  const searchParams = request.nextUrl.searchParams
  const jobPostingId = searchParams.get('job_posting_id')
  const status = searchParams.get('status')

  // Build query
  let query = supabase
    .from('candidates')
    .select('*')
    .is('deleted_at', null)

  if (jobPostingId) {
    query = query.eq('job_posting_id', jobPostingId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('candidates')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

## Error Handling

### Unified Error Handler

```typescript
// lib/error-handler.ts
import { PostgrestError } from '@supabase/supabase-js'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleSupabaseError(error: PostgrestError): never {
  console.error('Supabase error:', error)

  if (error.code === '23505') {
    throw new AppError('Duplicate entry', 'DUPLICATE_ENTRY', 409)
  }

  if (error.code === '42501') {
    throw new AppError('Permission denied', 'PERMISSION_DENIED', 403)
  }

  if (error.code === '23503') {
    throw new AppError('Referenced record not found', 'NOT_FOUND', 404)
  }

  throw new AppError(error.message, error.code, 500)
}
```

### Usage in Actions

```typescript
'use server'

import { handleSupabaseError } from '@/lib/error-handler'

export async function createGoal(data: any) {
  try {
    const supabase = await createServerClient()
    const { data: goal, error } = await supabase
      .from('goals')
      .insert(data)
      .select()
      .single()

    if (error) handleSupabaseError(error)

    return { success: true, data: goal }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}
```

## Testing Utilities

See separate test examples in the testing documentation.

## Next Steps

1. Implement authentication flow (Phase 1)
2. Create UI components for each module
3. Add form validation with Zod
4. Implement file upload UI
5. Add real-time subscriptions where needed
6. Test RLS policies thoroughly
7. Deploy Edge Functions
8. Monitor performance and optimize queries
