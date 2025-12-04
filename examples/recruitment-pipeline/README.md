# Recruitment Pipeline Examples

Complete recruitment and hiring workflow examples from the Targetym Component Registry.

## Overview

The `recruitment-pipeline` module provides end-to-end recruitment management including job postings, candidate tracking, interview scheduling, and AI-powered CV screening.

## Examples

### 1. Basic Usage (`basic.tsx`)

Simple recruitment dashboard with job postings and candidate management.

**Features:**
- Job posting creation and management
- Candidate list with filtering
- Tab-based navigation
- Quick actions for common tasks

**Use Case:** Perfect for small teams or getting started with recruitment features.

```tsx
import { JobPostingForm, JobPostingsList, CandidatesList } from '@/public/registry/recruitment-pipeline/files/components/recruitment'

<JobPostingsList />
<CandidatesList initialFilters={{ status: 'interviewing' }} />
```

### 2. Advanced Filtering (`with-filters.tsx`)

Comprehensive candidate filtering with multiple criteria and saved presets.

**Features:**
- Multi-criteria filtering (status, stage, rating, AI score)
- Quick filter presets for common scenarios
- Interactive sliders for numeric ranges
- Real-time search
- Visual filter count indicator

**Use Case:** Ideal for high-volume recruiting with many candidates to manage.

**Filter Capabilities:**
- Status: applied, screening, interviewing, offered, hired, rejected
- Stage: application review, phone screen, technical, final interview
- Rating: 0-5 stars (manual ratings)
- AI CV Score: 0-100 (automated scoring)
- Text search: name or email

### 3. Interview Scheduling (`interview-scheduling.tsx`)

Complete interview management workflow with calendar integration.

**Features:**
- Interview scheduler form with validation
- Multiple interview types (phone, technical, behavioral, etc.)
- Date/time picker with duration selection
- Video meeting link integration
- Interview timeline visualization
- Feedback and rating collection

**Use Case:** Best for teams conducting structured interview processes with multiple rounds.

**Interview Types:**
- Phone Screening
- Technical Interview
- Behavioral Interview
- Cultural Fit Assessment
- Final Interview

## Installation

### Prerequisites

```bash
npm install react-hook-form zod @tanstack/react-query date-fns
```

### Install from Registry

```bash
npx shadcn@latest add recruitment-pipeline
```

### Manual Installation

Copy files from `public/registry/recruitment-pipeline/files/`:

```
src/
├── components/recruitment/
│   ├── job-posting-form.tsx
│   ├── job-postings-list.tsx
│   ├── candidates-list.tsx
│   └── interview-scheduler.tsx
├── lib/
│   ├── services/recruitment.service.ts
│   └── validations/recruitment.schemas.ts
└── actions/recruitment/
    ├── create-job-posting.ts
    ├── get-job-postings.ts
    ├── create-candidate.ts
    ├── get-candidates.ts
    ├── schedule-interview.ts
    └── update-candidate-status.ts
```

## Component API

### JobPostingForm

```tsx
interface JobPostingFormProps {
  jobPosting?: JobPosting  // Optional: For edit mode
  onSuccess?: () => void
  onError?: (error: Error) => void
}
```

### JobPostingsList

```tsx
interface JobPostingsListProps {
  initialFilters?: {
    status?: 'draft' | 'published' | 'closed'
    department?: string
    location?: string
  }
  onJobClick?: (job: JobPosting) => void
}
```

### CandidatesList

```tsx
interface CandidatesListProps {
  jobPostingId?: string    // Filter to specific job
  initialFilters?: {
    status?: string
    current_stage?: string
    min_rating?: number
    ai_cv_score_min?: number
  }
}
```

### InterviewScheduler

```tsx
interface InterviewSchedulerProps {
  candidateId: string
  jobPostingId: string
  candidateName?: string
  onSuccess?: () => void
}
```

## Database Schema

Required tables:

```sql
-- Job Postings
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  location TEXT,
  type TEXT NOT NULL, -- full-time, part-time, contract, internship
  status TEXT NOT NULL, -- draft, published, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_posting_id UUID REFERENCES job_postings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL, -- applied, screening, interviewing, offered, hired, rejected
  current_stage TEXT,
  rating NUMERIC(2,1),
  ai_cv_score INTEGER,
  ai_cv_recommendation TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  interviewer_id UUID NOT NULL REFERENCES auth.users(id),
  interview_type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  feedback TEXT,
  rating NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Server Actions

### Job Postings

```tsx
import {
  createJobPosting,
  updateJobPosting,
  getJobPostings,
  getJobPostingById,
  deleteJobPosting
} from '@/src/actions/recruitment'

// Create job posting
await createJobPosting({
  title: 'Senior Software Engineer',
  description: 'We are looking for...',
  type: 'full-time',
  status: 'published',
  department: 'Engineering',
  location: 'Remote'
})

// Get all job postings with filters
await getJobPostings({
  filters: { status: 'published' },
  pagination: { page: 1, pageSize: 20 }
})
```

### Candidates

```tsx
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidateStatus
} from '@/src/actions/recruitment'

// Add candidate
await createCandidate({
  job_posting_id: 'job-uuid',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  status: 'applied'
})

// Update status
await updateCandidateStatus({
  id: 'candidate-uuid',
  status: 'interviewing',
  current_stage: 'technical_interview'
})
```

### Interviews

```tsx
import {
  scheduleInterview,
  getInterviews,
  updateInterviewFeedback
} from '@/src/actions/recruitment'

// Schedule interview
await scheduleInterview({
  candidate_id: 'candidate-uuid',
  job_posting_id: 'job-uuid',
  interviewer_id: 'user-uuid',
  interview_type: 'technical',
  scheduled_at: '2025-12-01T14:00:00Z',
  duration_minutes: 90,
  location: 'Video Call',
  meeting_link: 'https://meet.google.com/abc-defg-hij'
})

// Add feedback after interview
await updateInterviewFeedback({
  id: 'interview-uuid',
  feedback: 'Strong technical skills, good communication',
  rating: 4.5,
  status: 'completed'
})
```

## AI CV Scoring

Optional AI-powered CV analysis:

```tsx
import { scoreCandidateCV } from '@/src/actions/ai'

// Requires OPENAI_API_KEY or ANTHROPIC_API_KEY
const result = await scoreCandidateCV({
  candidate_id: 'candidate-uuid'
})

// Returns:
// {
//   score: 85,
//   recommendation: 'strong_yes',
//   reasoning: 'Candidate has strong technical background...'
// }
```

## Workflow Examples

### Complete Hiring Flow

```tsx
// 1. Create job posting
const job = await createJobPosting({...})

// 2. Add candidates
const candidate = await createCandidate({
  job_posting_id: job.id,
  ...candidateData
})

// 3. Score CV (optional)
await scoreCandidateCV({ candidate_id: candidate.id })

// 4. Schedule phone screen
await scheduleInterview({
  candidate_id: candidate.id,
  interview_type: 'phone_screen',
  ...
})

// 5. Update status after screening
await updateCandidateStatus({
  id: candidate.id,
  status: 'interviewing',
  current_stage: 'technical_interview'
})

// 6. Schedule technical interview
await scheduleInterview({
  interview_type: 'technical',
  ...
})

// 7. Add feedback and rating
await updateInterviewFeedback({
  id: interview.id,
  rating: 4.5,
  feedback: '...'
})

// 8. Make offer
await updateCandidateStatus({
  id: candidate.id,
  status: 'offered'
})
```

## Common Patterns

### Filter Candidates by Job

```tsx
<CandidatesList
  jobPostingId="specific-job-uuid"
  initialFilters={{ status: 'interviewing' }}
/>
```

### Quick Filter Presets

```tsx
const presets = {
  topCandidates: {
    ai_cv_score_min: 80,
    status: 'interviewing'
  },
  needsReview: {
    status: 'screening',
    current_stage: 'application_review'
  }
}
```

### Interview Status Tracking

```tsx
const statuses = ['scheduled', 'completed', 'cancelled', 'no_show']

// Update after interview
await updateInterviewFeedback({
  id: interview.id,
  status: 'completed',
  rating: 4.0
})
```

## Best Practices

1. **Structured Pipeline**: Define clear interview stages
2. **Timely Feedback**: Collect ratings immediately after interviews
3. **Status Updates**: Keep candidate status current
4. **Communication**: Use meeting links for all remote interviews
5. **AI Scoring**: Use as supplement, not replacement for human judgment
6. **Data Privacy**: Handle candidate data securely (GDPR/privacy laws)
7. **Filtering**: Use presets for common scenarios
8. **Calendar Integration**: Send calendar invites (requires email service)

## Troubleshooting

### Candidates Not Showing

- Check `job_posting_id` filter is correct
- Verify RLS policies allow read access
- Check organization_id matches current user

### Interview Scheduling Fails

- Ensure interviewer_id exists in auth.users
- Verify scheduled_at is future date
- Check datetime format: ISO 8601 string

### AI Scoring Not Working

- Verify API key is set (OPENAI_API_KEY or ANTHROPIC_API_KEY)
- Check candidate has CV file uploaded
- Review error logs for API issues

## Related Modules

- **ai-features**: AI CV scoring and candidate recommendations
- **notifications-system**: Interview reminders and status updates
- **cache-manager**: Cache frequently accessed job postings
- **rate-limiter**: Protect CV scoring API endpoints

## Support

For issues:
- Review recruitment.schemas.ts for validation rules
- Check Supabase Studio for database errors
- Test RLS: `npm run supabase:test`
- Review Server Action responses for error details
