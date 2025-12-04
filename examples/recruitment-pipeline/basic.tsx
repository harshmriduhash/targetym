/**
 * Example: Basic Recruitment Pipeline Usage
 *
 * Demonstrates how to use the job posting and candidate components
 * for building a complete recruitment workflow.
 *
 * @package recruitment-pipeline
 */

import { JobPostingForm, JobPostingsList, CandidatesList } from '@/public/registry/recruitment-pipeline/files/components/recruitment'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Briefcase, Users } from 'lucide-react'

export default function BasicRecruitmentExample() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recruitment Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Manage job postings, candidates, and interview scheduling
        </p>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            All Candidates
          </TabsTrigger>
          <TabsTrigger value="create">Create Job</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {/* Display all job postings with stats */}
          <JobPostingsList
            onJobClick={(job) => {
              // Navigate to job detail page
              console.log('Selected job:', job)
            }}
          />
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          {/* Display all candidates across all jobs */}
          <CandidatesList
            initialFilters={{
              status: 'interviewing' // Show active candidates
            }}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          {/* Create new job posting */}
          <JobPostingForm
            onSuccess={() => {
              toast.success('Job posting created!', {
                description: 'Your job is now live and accepting applications.'
              })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Usage Notes:
 *
 * 1. JobPostingForm component:
 *    - Form validation with Zod
 *    - Job types: full-time, part-time, contract, internship
 *    - Status management: draft, published, closed
 *    - Rich text description support
 *    - Department and location fields
 *
 * 2. JobPostingsList component:
 *    - Displays all job postings with candidate counts
 *    - Filter by status, department, location
 *    - Search functionality
 *    - Quick actions: edit, close, view candidates
 *
 * 3. CandidatesList component:
 *    - Shows candidates across all or specific job postings
 *    - Filter by status, stage, rating
 *    - AI CV scoring integration
 *    - Interview scheduling shortcuts
 *    - Email and phone contact info
 *
 * 4. Required Server Actions:
 *    - createJobPosting, getJobPostings
 *    - createCandidate, getCandidates
 *    - scheduleInterview
 *
 * 5. Database Requirements:
 *    - job_postings table
 *    - candidates table
 *    - interviews table
 *    - RLS policies for organization isolation
 */
