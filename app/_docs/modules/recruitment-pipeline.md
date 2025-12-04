# Recruitment Pipeline Module

Complete recruitment and hiring management system with job postings, candidate tracking, interview scheduling, and AI-powered CV scoring.

## Installation

```bash
pnpm registry:install recruitment-pipeline
```

## Dependencies

This module requires:

```json
{
  "dependencies": {
    "react-hook-form": "^7.63.0",
    "zod": "^4.1.11",
    "@tanstack/react-query": "^5.90.2",
    "lucide-react": "latest"
  },
  "registryDependencies": [
    "ui-form",
    "ui-dialog",
    "ui-card",
    "ui-badge",
    "ui-select",
    "ui-input",
    "ui-skeleton",
    "ui-avatar"
  ]
}
```

## Components

### JobPostingsList

Display and manage job postings with filtering, sorting, and pagination.

```tsx
import { JobPostingsList } from '@/components/recruitment/job-postings-list'

export default function JobsPage() {
  return (
    <div className="container mx-auto py-6">
      <JobPostingsList
        initialFilters={{ status: 'published' }}
      />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialFilters` | `JobFilters \| undefined` | `undefined` | Initial filter criteria |

**Filter Options:**
```typescript
interface JobFilters {
  status?: 'draft' | 'published' | 'closed' | 'archived'
  department?: string
  location?: string
  hiring_manager_id?: string
}
```

**Features:**
- Real-time search across job titles and descriptions
- Filter by status, department, location, hiring manager
- Pagination with configurable page size
- Candidate count badge for each posting
- Responsive card-based layout
- Employment type and salary range display
- Quick actions: view, edit, duplicate, archive

### CandidatesList

Display and manage candidates with advanced filtering and status tracking.

```tsx
import { CandidatesList } from '@/components/recruitment/candidates-list'

export default function CandidatesPage() {
  return (
    <div className="container mx-auto py-6">
      <CandidatesList
        jobPostingId="optional-job-id"
        initialFilters={{ status: 'interviewing' }}
      />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `jobPostingId` | `string \| undefined` | `undefined` | Filter candidates for specific job |
| `initialFilters` | `CandidateFilters \| undefined` | `undefined` | Initial filter criteria |

**Filter Options:**
```typescript
interface CandidateFilters {
  status?: 'applied' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
  job_posting_id?: string
  current_stage?: 'application_review' | 'phone_screen' | 'technical_interview' | 'final_interview' | 'offer'
}
```

**Features:**
- Avatar with initials for each candidate
- Contact information display (email, phone)
- Status badges with color coding
- AI CV score and recommendation display
- Interview count indicator
- Job posting details in card
- Applied date tracking
- Rating display (1-5 stars)
- Quick access to candidate profile

### InterviewScheduler

Form component for scheduling interviews with candidates.

```tsx
import { InterviewScheduler } from '@/components/recruitment/interview-scheduler'

export default function ScheduleInterviewPage() {
  return (
    <div className="container mx-auto py-6">
      <InterviewScheduler
        candidateId="candidate-uuid"
        jobPostingId="job-uuid"
        candidateName="John Doe"
        onSuccess={() => router.push('/dashboard/recruitment/interviews')}
      />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `candidateId` | `string` | - | Required. Candidate UUID |
| `jobPostingId` | `string` | - | Required. Job posting UUID |
| `candidateName` | `string \| undefined` | `undefined` | Candidate name for display |
| `onSuccess` | `() => void \| undefined` | `undefined` | Callback after successful scheduling |

**Features:**
- Interview type selection (phone, video, onsite, technical, behavioral, panel)
- Date and time picker with validation
- Duration selector (30, 45, 60, 90, 120 minutes)
- Location input (physical or virtual)
- Meeting link field for video calls
- Interviewer assignment
- Zod validation with react-hook-form
- Loading states with spinner
- Error handling with toast notifications
- Auto-refresh on success

### JobPostingForm

Create and edit job postings with rich validation.

```tsx
import { JobPostingForm } from '@/components/recruitment/job-posting-form'

export default function NewJobPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create Job Posting</h1>
      <JobPostingForm />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `jobId` | `string \| undefined` | `undefined` | Job ID for edit mode |
| `onSuccess` | `() => void \| undefined` | `undefined` | Callback after successful save |

**Features:**
- Rich text editor for description and requirements
- Employment type selector (full-time, part-time, contract, internship)
- Salary range with currency selection
- Department and location fields
- Hiring manager assignment
- Posted and closing date pickers
- Draft/publish status toggle
- Validation for salary ranges (max >= min)

## Service Layer

### RecruitmentService

Business logic for recruitment pipeline management.

```typescript
import { recruitmentService } from '@/lib/services/recruitment.service'

// Create job posting
const job = await recruitmentService.createJobPosting({
  title: 'Senior Software Engineer',
  description: 'We are looking for...',
  requirements: 'Requirements...',
  responsibilities: 'Responsibilities...',
  department: 'Engineering',
  location: 'Remote',
  employment_type: 'full_time',
  salary_range_min: 120000,
  salary_range_max: 160000,
  currency: 'USD',
  organization_id: orgId,
  posted_by: userId,
})

// Get job postings with pagination
const { data, pagination } = await recruitmentService.getJobPostings(
  orgId,
  { status: 'published', department: 'Engineering' },
  { page: 1, pageSize: 10 }
)

// Create candidate
const candidate = await recruitmentService.createCandidate({
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1-555-0123',
  cv_url: 'https://storage.example.com/cvs/jane-smith.pdf',
  linkedin_url: 'https://linkedin.com/in/janesmith',
  job_posting_id: jobId,
  organization_id: orgId,
})

// Schedule interview
const interview = await recruitmentService.scheduleInterview({
  candidate_id: candidateId,
  interviewer_id: interviewerId,
  interview_type: 'technical',
  scheduled_date: '2025-12-01T14:00:00Z',
  duration_minutes: 60,
  location: 'Google Meet',
  organization_id: orgId,
})

// Update candidate status
await recruitmentService.updateCandidateStatus(
  candidateId,
  'interviewing',
  'technical_interview'
)

// Submit interview feedback
await recruitmentService.updateInterviewFeedback(interviewId, {
  feedback: 'Strong technical skills...',
  rating: 4,
  decision: 'proceed',
  status: 'completed',
})
```

**Methods:**

**Job Postings:**
- `createJobPosting(data: CreateJobPostingData): Promise<JobPosting>`
- `getJobPostings(orgId: string, filters?, pagination?): Promise<PaginatedResponse<JobPosting>>`
- `getJobPostingById(id: string): Promise<JobPosting>`
- `updateJobPosting(id: string, data: JobPostingUpdate): Promise<JobPosting>`
- `getJobPostingsWithStats(orgId: string): Promise<JobPostingWithStats[]>`

**Candidates:**
- `createCandidate(data: CreateCandidateData): Promise<Candidate>`
- `getCandidates(orgId: string, filters?, pagination?): Promise<PaginatedResponse<Candidate>>`
- `getCandidateById(id: string): Promise<Candidate>`
- `updateCandidate(id: string, data: CandidateUpdate): Promise<Candidate>`
- `updateCandidateStatus(id: string, status: string, stage?: string): Promise<Candidate>`

**Interviews:**
- `scheduleInterview(data: ScheduleInterviewData): Promise<Interview>`
- `updateInterviewFeedback(id: string, feedback: InterviewFeedback): Promise<Interview>`

## Server Actions

### create-job-posting

```typescript
import { createJobPosting } from '@/actions/recruitment/create-job-posting'

const result = await createJobPosting({
  title: 'Product Manager',
  description: 'Leading product strategy...',
  location: 'New York, NY',
  employment_type: 'full_time',
})

if (result.success) {
  console.log('Job created:', result.data.id)
} else {
  console.error('Error:', result.error.message)
}
```

**Authorization:** Requires `admin` or `manager` role.

### create-candidate

```typescript
import { createCandidate } from '@/actions/recruitment/create-candidate'

const result = await createCandidate({
  job_posting_id: 'job-uuid',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1-555-0199',
  linkedin_url: 'https://linkedin.com/in/alexj',
})
```

**Authorization:** Requires `admin`, `manager`, or `employee` role.
**Security:** Validates job posting belongs to user's organization.

### schedule-interview

```typescript
import { scheduleInterview } from '@/actions/recruitment/schedule-interview'

const result = await scheduleInterview({
  candidate_id: 'candidate-uuid',
  job_posting_id: 'job-uuid',
  interview_type: 'technical',
  scheduled_at: '2025-12-05T10:00:00Z',
  duration_minutes: 60,
  location: 'Zoom',
  interviewers: 'interviewer-uuid',
  send_calendar_invite: true,
})
```

### update-candidate-status

```typescript
import { updateCandidateStatus } from '@/actions/recruitment/update-candidate-status'

const result = await updateCandidateStatus({
  candidate_id: 'candidate-uuid',
  status: 'offered',
  notes: 'Extended offer at $140k',
})
```

### update-interview-feedback

```typescript
import { updateInterviewFeedback } from '@/actions/recruitment/update-interview-feedback'

const result = await updateInterviewFeedback({
  interview_id: 'interview-uuid',
  feedback: 'Excellent problem-solving skills...',
  rating: 5,
  recommendation: 'strong_yes',
  feedback_items: [
    { category: 'Technical Skills', rating: 5, notes: 'Excellent' },
    { category: 'Communication', rating: 4, notes: 'Very good' },
  ],
})
```

## Validation Schemas

All inputs are validated using Zod schemas:

```typescript
import {
  createJobPostingSchema,
  createCandidateSchema,
  scheduleInterviewSchema,
  submitInterviewFeedbackSchema,
  updateCandidateStatusSchema,
} from '@/lib/validations/recruitment.schemas'

// Validate job posting
const validatedJob = createJobPostingSchema.parse({
  title: 'DevOps Engineer',
  description: 'Description here...',
  location: 'Remote',
  employment_type: 'full_time',
  salary_range_min: 100000,
  salary_range_max: 130000,
})

// Validate candidate
const validatedCandidate = createCandidateSchema.parse({
  job_posting_id: 'uuid',
  name: 'Candidate Name',
  email: 'candidate@example.com',
})

// Validate interview
const validatedInterview = scheduleInterviewSchema.parse({
  candidate_id: 'uuid',
  interview_type: 'technical',
  scheduled_at: '2025-12-10T15:00:00Z',
  duration_minutes: 90,
})
```

**Schema Details:**

- `createJobPostingSchema`: Validates title (3-200 chars), description (min 50 chars), employment type enum, salary range validation (max >= min)
- `createCandidateSchema`: Validates name, email format, optional URLs (LinkedIn, portfolio), phone format
- `scheduleInterviewSchema`: Validates interview type enum, datetime format, duration range, location, meeting link URL
- `submitInterviewFeedbackSchema`: Validates rating (1-5), recommendation enum, feedback items array
- `updateCandidateStatusSchema`: Validates status enum, optional notes

## Database Schema

The module uses these tables:

### job_postings

```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  department TEXT,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'temporary')),
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  hiring_manager_id UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  posted_date TIMESTAMPTZ,
  closing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### candidates

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
  current_stage TEXT,
  source TEXT,
  rating DECIMAL(3,2),
  ai_cv_score INTEGER,
  ai_cv_recommendation TEXT,
  ai_cv_analysis JSONB,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### interviews

```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES profiles(id),
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'panel')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  decision TEXT CHECK (decision IN ('proceed', 'reject', 'undecided')),
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### job_postings_with_stats (View)

```sql
CREATE VIEW job_postings_with_stats AS
SELECT
  jp.*,
  COUNT(DISTINCT c.id) AS total_candidates,
  COUNT(DISTINCT CASE WHEN c.status = 'screening' THEN c.id END) AS screening_count,
  COUNT(DISTINCT CASE WHEN c.status = 'interviewing' THEN c.id END) AS interviewing_count,
  COUNT(DISTINCT CASE WHEN c.status = 'offered' THEN c.id END) AS offered_count,
  COUNT(DISTINCT CASE WHEN c.status = 'hired' THEN c.id END) AS hired_count
FROM job_postings jp
LEFT JOIN candidates c ON c.job_posting_id = jp.id
GROUP BY jp.id;
```

## RLS Policies

Row-Level Security policies ensure data isolation:

```sql
-- Job Postings: Users can view jobs in their organization
CREATE POLICY "Users can view own org job postings"
  ON job_postings FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Job Postings: Admin/Manager can create
CREATE POLICY "Admin and managers can create job postings"
  ON job_postings FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    has_role(ARRAY['admin', 'manager'])
  );

-- Job Postings: Admin/Manager/Hiring Manager can update
CREATE POLICY "Admin, managers, and hiring managers can update job postings"
  ON job_postings FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    (
      has_role(ARRAY['admin', 'manager']) OR
      hiring_manager_id = auth.uid()
    )
  );

-- Candidates: Users can view candidates in their organization
CREATE POLICY "Users can view own org candidates"
  ON candidates FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Candidates: All authenticated users can create (for referrals)
CREATE POLICY "Users can create candidates"
  ON candidates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Candidates: Admin/Manager can update
CREATE POLICY "Admin and managers can update candidates"
  ON candidates FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    has_role(ARRAY['admin', 'manager'])
  );

-- Interviews: Users can view interviews they're involved in
CREATE POLICY "Users can view related interviews"
  ON interviews FOR SELECT
  USING (
    organization_id = get_user_organization_id() AND
    (
      interviewer_id = auth.uid() OR
      has_role(ARRAY['admin', 'manager'])
    )
  );

-- Interviews: Admin/Manager can schedule
CREATE POLICY "Admin and managers can schedule interviews"
  ON interviews FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    has_role(ARRAY['admin', 'manager'])
  );

-- Interviews: Interviewer can update their feedback
CREATE POLICY "Interviewers can update own interviews"
  ON interviews FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    (interviewer_id = auth.uid() OR has_role(ARRAY['admin', 'manager']))
  );
```

## React Query Hooks

Optimized data fetching with React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJobPostings, createJobPosting } from '@/actions/recruitment'

// Fetch job postings
function JobsComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['job-postings', { status: 'published' }],
    queryFn: async () => {
      const result = await getJobPostings({ filters: { status: 'published' } })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorState error={error} />

  return (
    <div>
      {data?.data.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

// Mutation with optimistic updates
function useCreateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createJobPosting,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
    },
  })
}
```

**Available Query Keys:**
- `['job-postings', filters, pagination]` - List job postings
- `['job-posting', id]` - Single job posting
- `['candidates', filters, pagination]` - List candidates
- `['candidate', id]` - Single candidate
- `['interviews', candidateId]` - Interviews for candidate

## Real-time Updates

Subscribe to real-time recruitment updates via Supabase Realtime:

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeCandidates(jobPostingId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`job-${jobPostingId}-candidates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `job_posting_id=eq.${jobPostingId}`,
        },
        (payload) => {
          // Invalidate candidates query
          queryClient.invalidateQueries({ queryKey: ['candidates', { job_posting_id: jobPostingId }] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobPostingId, queryClient, supabase])
}
```

## Examples

### Complete Recruitment Dashboard

```tsx
'use client'

import { useState } from 'react'
import { JobPostingsList } from '@/components/recruitment/job-postings-list'
import { CandidatesList } from '@/components/recruitment/candidates-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function RecruitmentDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">Recruitment</h1>
          <p className="text-muted-foreground">
            Manage job postings, candidates, and interviews
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/recruitment/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Job Posting
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <JobPostingsList />
        </TabsContent>

        <TabsContent value="candidates">
          <CandidatesList />
        </TabsContent>

        <TabsContent value="pipeline">
          {/* Kanban board component */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Candidate Detail with Interview Scheduling

```tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCandidateById } from '@/actions/recruitment'
import { InterviewScheduler } from '@/components/recruitment/interview-scheduler'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Phone, FileText } from 'lucide-react'

export default function CandidatePage({ params }: { params: { id: string } }) {
  const [showScheduler, setShowScheduler] = useState(false)

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', params.id],
    queryFn: async () => {
      const result = await getCandidateById({ id: params.id })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (!candidate) return <div>Not found</div>

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{candidate.name}</CardTitle>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </div>
                )}
              </div>
            </div>
            <Badge>{candidate.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidate.cv_url && (
              <Button variant="outline" asChild>
                <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  View CV
                </a>
              </Button>
            )}

            <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <InterviewScheduler
                  candidateId={candidate.id}
                  jobPostingId={candidate.job_posting_id}
                  candidateName={candidate.name}
                  onSuccess={() => setShowScheduler(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Testing

Test your recruitment components:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobPostingForm } from '@/components/recruitment/job-posting-form'
import { createJobPosting } from '@/actions/recruitment/create-job-posting'

jest.mock('@/actions/recruitment/create-job-posting')

describe('JobPostingForm', () => {
  it('creates a job posting successfully', async () => {
    const user = userEvent.setup()
    const mockCreateJobPosting = createJobPosting as jest.MockedFunction<typeof createJobPosting>
    mockCreateJobPosting.mockResolvedValue({ success: true, data: { id: 'job-123' } })

    render(<JobPostingForm />)

    await user.type(screen.getByLabelText(/title/i), 'Software Engineer')
    await user.type(screen.getByLabelText(/description/i), 'We are looking for a talented software engineer...')
    await user.type(screen.getByLabelText(/location/i), 'Remote')
    await user.selectOptions(screen.getByLabelText(/employment type/i), 'full_time')

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockCreateJobPosting).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Software Engineer',
          location: 'Remote',
          employment_type: 'full_time',
        })
      )
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<JobPostingForm />)

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })
})
```

## Troubleshooting

### Candidates not loading

1. Check Supabase connection
2. Verify RLS policies allow SELECT
3. Ensure user is authenticated
4. Check organization_id in profile
5. Verify job_posting_id exists and belongs to organization

### Interview scheduling fails

1. Verify interviewer_id is valid UUID
2. Check interviewer belongs to same organization
3. Ensure scheduled_date is in the future
4. Verify meeting_link is valid URL (if provided)
5. Check user has `admin` or `manager` role

### CV file upload not working

1. Check Supabase Storage bucket exists
2. Verify bucket is public or has correct RLS policies
3. Ensure file size is within limits
4. Check file type is allowed (PDF, DOC, DOCX)
5. Verify storage quota is not exceeded

### AI CV scoring not appearing

1. Check `OPENAI_API_KEY` environment variable is set
2. Verify API key has sufficient quota
3. Check candidate has `cv_url` populated
4. Review error logs for API errors
5. Ensure AI service is enabled in organization settings

## Related Documentation

- [AI Features](./ai-features.md) - CV scoring and candidate recommendations
- [React Query Hooks](../utilities/react-query.md)
- [Supabase Storage](../utilities/supabase-storage.md) - CV file uploads
- [Form Validation](../utilities/validation.md)
- [Real-time Features](./realtime-features.md)
