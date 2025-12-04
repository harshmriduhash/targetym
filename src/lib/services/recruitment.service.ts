
import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'
import { NotFoundError, ForbiddenError } from '@/src/lib/utils/errors'
import {
  type PaginationParams,
  type PaginatedResponse,
  normalizePagination,
  getPaginationOffset,
  createPaginatedResponse,
} from '@/src/lib/utils/pagination'
import { getCached, CacheKeys, invalidateCache } from '@/src/lib/cache'
import { log } from '@/src/lib/logger'

type JobPosting = Database['public']['Tables']['job_postings']['Row']
type JobPostingInsert = Database['public']['Tables']['job_postings']['Insert']
type JobPostingUpdate = Database['public']['Tables']['job_postings']['Update']
type Candidate = Database['public']['Tables']['candidates']['Row']
type CandidateInsert = Database['public']['Tables']['candidates']['Insert']
type Interview = Database['public']['Tables']['interviews']['Row']
type InterviewInsert = Database['public']['Tables']['interviews']['Insert']

export interface CreateJobPostingData {
  title: string
  description: string
  requirements?: string[] | string
  responsibilities?: string[] | string
  department?: string
  location?: string
  employment_type: string
  salary_range_min?: number
  salary_range_max?: number
  currency?: string
  status?: string
  hiring_manager_id?: string
  posted_date?: string
  closing_date?: string
  organization_id: string
  posted_by: string
}

export interface CreateCandidateData {
  name: string
  email: string
  phone?: string
  cv_url?: string
  cover_letter?: string
  linkedin_url?: string
  portfolio_url?: string
  status?: string
  source?: string
  job_posting_id: string
  organization_id: string
}

export class RecruitmentService {
  private async getClient() {
    return await createClient()
  }

  // Job Postings
  async createJobPosting(data: CreateJobPostingData): Promise<JobPosting> {
    const supabase = await this.getClient()

    const jobData: JobPostingInsert = {
      title: data.title,
      description: data.description,
      requirements: Array.isArray(data.requirements) 
        ? data.requirements 
        : data.requirements 
          ? [data.requirements] 
          : null,
      responsibilities: Array.isArray(data.responsibilities)
        ? data.responsibilities
        : data.responsibilities
          ? [data.responsibilities]
          : null,
      department: data.department,
      location: data.location,
      employment_type: data.employment_type,
      salary_range_min: data.salary_range_min,
      salary_range_max: data.salary_range_max,
      currency: data.currency,
      status: data.status || 'draft',
      hiring_manager_id: data.hiring_manager_id,
      posted_date: data.posted_date,
      closing_date: data.closing_date,
      organization_id: data.organization_id,
      created_by: data.posted_by,
    }

    const { data: job, error } = await supabase
      .from('job_postings')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create job posting: ${error.message}`)
    }

    // Invalidate organization job postings cache after creation
    await invalidateCache(`${CacheKeys.recruitment.jobPostings.byOrg(data.organization_id)}*`)
    log.cache('invalidate', `recruitment:jobs:org:${data.organization_id}:*`)

    return job
  }

  async getJobPostings(
    organizationId: string,
    filters?: {
      status?: string
      department?: string
      location?: string
      hiring_manager_id?: string
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<JobPosting>> {
    const start = Date.now()

    // Create cache key with filters and pagination
    const filterKey = JSON.stringify(filters || {})
    const paginationKey = JSON.stringify(pagination || {})
    const cacheKey = `${CacheKeys.recruitment.jobPostings.byOrg(organizationId)}:${filterKey}:${paginationKey}`

    return getCached(
      cacheKey,
      async () => {
        const supabase = await this.getClient()

        // Normalize pagination
        const { page, pageSize } = normalizePagination(pagination)
        const offset = getPaginationOffset(page, pageSize)

        // Build base query for count
        let baseQuery = supabase
          .from('job_postings')
          .select('*', { count: 'exact', head: false })
          .eq('organization_id', organizationId)
          .is('deleted_at', null)

        if (filters?.status) {
          baseQuery = baseQuery.eq('status', filters.status)
        }
        if (filters?.department) {
          baseQuery = baseQuery.eq('department', filters.department)
        }
        if (filters?.location) {
          baseQuery = baseQuery.eq('location', filters.location)
        }
        if (filters?.hiring_manager_id) {
          baseQuery = baseQuery.eq('hiring_manager_id', filters.hiring_manager_id)
        }

        // Get total count
        const { count, error: countError } = await baseQuery

        if (countError) {
          throw new Error(`Failed to count job postings: ${countError.message}`)
        }

        // Optimize: Fetch with hiring manager and candidate counts (fixes N+1) with pagination
        let dataQuery = supabase
          .from('job_postings')
          .select(`
            *,
            hiring_manager:profiles!hiring_manager_id(id, email, full_name, avatar_url),
            created_by_user:profiles!created_by(id, email, full_name),
            candidates(count)
          `)
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1)

        if (filters?.status) {
          dataQuery = dataQuery.eq('status', filters.status)
        }
        if (filters?.department) {
          dataQuery = dataQuery.eq('department', filters.department)
        }
        if (filters?.location) {
          dataQuery = dataQuery.eq('location', filters.location)
        }
        if (filters?.hiring_manager_id) {
          dataQuery = dataQuery.eq('hiring_manager_id', filters.hiring_manager_id)
        }

        const { data: jobs, error } = await dataQuery

        if (error) {
          throw new Error(`Failed to fetch job postings: ${error.message}`)
        }

        const duration = Date.now() - start
        log.db('getJobPostings', duration, count || 0)

        return createPaginatedResponse(jobs || [], page, pageSize, count || 0)
      },
      300 // 5 minutes TTL
    )
  }

  async getJobPostingById(id: string): Promise<JobPosting> {
    const start = Date.now()

    return getCached(
      CacheKeys.recruitment.jobPostings.byId(id),
      async () => {
        const supabase = await this.getClient()

        // Optimize: Fetch with all related data (fixes N+1)
        const { data: job, error } = await supabase
          .from('job_postings')
          .select(`
            *,
            hiring_manager:profiles!hiring_manager_id(id, email, full_name, avatar_url, phone),
            created_by_user:profiles!created_by(id, email, full_name),
            candidates(
              id,
              name,
              email,
              status,
              current_stage,
              created_at
            )
          `)
          .eq('id', id)
          .maybeSingle()

        if (error) {
          throw new Error(`Failed to fetch job posting: ${error.message}`)
        }

        if (!job) {
          throw new NotFoundError('Job posting not found')
        }

        const duration = Date.now() - start
        log.db('getJobPostingById', duration, 1)

        return job
      },
      300 // 5 minutes TTL
    )
  }

  async updateJobPosting(id: string, data: JobPostingUpdate): Promise<JobPosting> {
    const supabase = await this.getClient()

    // Fetch existing to get organization_id
    const { data: existing } = await supabase
      .from('job_postings')
      .select('organization_id')
      .eq('id', id)
      .single()

    const { data: updated, error } = await supabase
      .from('job_postings')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update job posting: ${error.message}`)
    }

    // Invalidate both specific job and organization jobs cache
    await invalidateCache(CacheKeys.recruitment.jobPostings.byId(id))
    if (existing?.organization_id) {
      await invalidateCache(`${CacheKeys.recruitment.jobPostings.byOrg(existing.organization_id)}*`)
    }
    log.cache('invalidate', `jobs:id:${id} + org cache`)

    return updated
  }

  async getJobPostingsWithStats(organizationId: string): Promise<any[]> {
    const start = Date.now()

    return getCached(
      `${CacheKeys.recruitment.jobPostings.byOrg(organizationId)}:with-stats`,
      async () => {
        const supabase = await this.getClient()

        const { data: jobs, error } = await supabase
          .from('job_postings_with_stats')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to fetch job postings with stats: ${error.message}`)
        }

        const duration = Date.now() - start
        log.db('getJobPostingsWithStats', duration, jobs?.length || 0)

        return jobs || []
      },
      300 // 5 minutes TTL
    )
  }

  // Candidates
  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    const supabase = await this.getClient()

    const candidateData: CandidateInsert = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cv_url: data.cv_url,
      cover_letter: data.cover_letter,
      linkedin_url: data.linkedin_url,
      portfolio_url: data.portfolio_url,
      status: data.status || 'new',
      source: data.source,
      job_posting_id: data.job_posting_id,
      organization_id: data.organization_id,
    }

    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create candidate: ${error.message}`)
    }

    // Invalidate organization candidates cache and job posting cache
    await invalidateCache(`${CacheKeys.recruitment.candidates.byOrg(data.organization_id)}*`)
    await invalidateCache(CacheKeys.recruitment.jobPostings.byId(data.job_posting_id))
    await invalidateCache(`${CacheKeys.recruitment.jobPostings.byOrg(data.organization_id)}*`)
    log.cache('invalidate', `candidates:org:${data.organization_id}:* + job:${data.job_posting_id}`)

    return candidate
  }

  async getCandidates(
    organizationId: string,
    filters?: {
      job_posting_id?: string
      status?: string
      current_stage?: string
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Candidate>> {
    const start = Date.now()

    // Create cache key with filters and pagination
    const filterKey = JSON.stringify(filters || {})
    const paginationKey = JSON.stringify(pagination || {})
    const cacheKey = `${CacheKeys.recruitment.candidates.byOrg(organizationId)}:${filterKey}:${paginationKey}`

    return getCached(
      cacheKey,
      async () => {
        const supabase = await this.getClient()

        // Normalize pagination
        const { page, pageSize } = normalizePagination(pagination)
        const offset = getPaginationOffset(page, pageSize)

        // Build base query for count
        let baseQuery = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: false })
          .eq('organization_id', organizationId)
          .is('deleted_at', null)

        if (filters?.job_posting_id) {
          baseQuery = baseQuery.eq('job_posting_id', filters.job_posting_id)
        }
        if (filters?.status) {
          baseQuery = baseQuery.eq('status', filters.status)
        }
        if (filters?.current_stage) {
          baseQuery = baseQuery.eq('current_stage', filters.current_stage)
        }

        // Get total count
        const { count, error: countError } = await baseQuery

        if (countError) {
          throw new Error(`Failed to count candidates: ${countError.message}`)
        }

        // Optimize: Fetch with job posting details (fixes N+1) with pagination
        let dataQuery = supabase
          .from('candidates')
          .select(`
            *,
            job_posting:job_postings(id, title, department, location, status),
            interviews(
              id,
              interview_type,
              scheduled_date,
              status,
              rating,
              interviewer:profiles!interviewer_id(id, email, full_name)
            )
          `)
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1)

        if (filters?.job_posting_id) {
          dataQuery = dataQuery.eq('job_posting_id', filters.job_posting_id)
        }
        if (filters?.status) {
          dataQuery = dataQuery.eq('status', filters.status)
        }
        if (filters?.current_stage) {
          dataQuery = dataQuery.eq('current_stage', filters.current_stage)
        }

        const { data: candidates, error } = await dataQuery

        if (error) {
          throw new Error(`Failed to fetch candidates: ${error.message}`)
        }

        const duration = Date.now() - start
        log.db('getCandidates', duration, count || 0)

        return createPaginatedResponse(candidates || [], page, pageSize, count || 0)
      },
      300 // 5 minutes TTL
    )
  }

  async getCandidateById(id: string): Promise<Candidate> {
    const start = Date.now()

    return getCached(
      CacheKeys.recruitment.candidates.byId(id),
      async () => {
        const supabase = await this.getClient()

        // Optimize: Fetch with all related data (fixes N+1)
        const { data: candidate, error } = await supabase
          .from('candidates')
          .select(`
            *,
            job_posting:job_postings(
              id,
              title,
              description,
              department,
              location,
              employment_type,
              salary_range_min,
              salary_range_max,
              currency,
              status,
              hiring_manager:profiles!hiring_manager_id(id, email, full_name)
            ),
            interviews(
              id,
              interview_type,
              scheduled_date,
              duration_minutes,
              location,
              status,
              feedback,
              rating,
              decision,
              notes,
              interviewer:profiles!interviewer_id(id, email, full_name, avatar_url)
            )
          `)
          .eq('id', id)
          .maybeSingle()

        if (error) {
          throw new Error(`Failed to fetch candidate: ${error.message}`)
        }

        if (!candidate) {
          throw new NotFoundError('Candidate not found')
        }

        const duration = Date.now() - start
        log.db('getCandidateById', duration, 1)

        return candidate
      },
      300 // 5 minutes TTL
    )
  }

  async updateCandidate(candidateId: string, data: Partial<CandidateInsert>): Promise<Candidate> {
    const supabase = await this.getClient()

    // Fetch existing to get organization_id
    const { data: existing } = await supabase
      .from('candidates')
      .select('organization_id, job_posting_id')
      .eq('id', candidateId)
      .single()

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: candidate, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', candidateId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update candidate: ${error.message}`)
    }

    // Invalidate caches
    await invalidateCache(CacheKeys.recruitment.candidates.byId(candidateId))
    if (existing?.organization_id) {
      await invalidateCache(`${CacheKeys.recruitment.candidates.byOrg(existing.organization_id)}*`)
    }
    if (existing?.job_posting_id) {
      await invalidateCache(CacheKeys.recruitment.jobPostings.byId(existing.job_posting_id))
    }
    log.cache('invalidate', `candidate:id:${candidateId} + org cache`)

    return candidate
  }

  async updateCandidateStatus(candidateId: string, status: string, currentStage?: string): Promise<Candidate> {
    const supabase = await this.getClient()

    // Fetch existing to get organization_id
    const { data: existing } = await supabase
      .from('candidates')
      .select('organization_id, job_posting_id')
      .eq('id', candidateId)
      .single()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (currentStage) {
      updateData.current_stage = currentStage
    }

    const { data: candidate, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', candidateId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update candidate status: ${error.message}`)
    }

    // Invalidate caches
    await invalidateCache(CacheKeys.recruitment.candidates.byId(candidateId))
    if (existing?.organization_id) {
      await invalidateCache(`${CacheKeys.recruitment.candidates.byOrg(existing.organization_id)}*`)
    }
    if (existing?.job_posting_id) {
      await invalidateCache(CacheKeys.recruitment.jobPostings.byId(existing.job_posting_id))
    }
    log.cache('invalidate', `candidate:id:${candidateId} status updated`)

    return candidate
  }

  // Interviews
  async scheduleInterview(data: {
    candidate_id: string
    interviewer_id: string
    interview_type: string
    scheduled_date: string
    duration_minutes?: number
    location?: string
    organization_id: string
  }): Promise<Interview> {
    const supabase = await this.getClient()

    const interviewData: InterviewInsert = {
      candidate_id: data.candidate_id,
      interviewer_id: data.interviewer_id,
      interview_type: data.interview_type,
      scheduled_date: data.scheduled_date,
      duration_minutes: data.duration_minutes,
      location: data.location,
      status: 'scheduled',
      organization_id: data.organization_id,
    }

    const { data: interview, error } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`)
    }

    // Invalidate candidate cache (interviews are part of candidate details)
    await invalidateCache(CacheKeys.recruitment.candidates.byId(data.candidate_id))
    await invalidateCache(`${CacheKeys.recruitment.candidates.byOrg(data.organization_id)}*`)
    log.cache('invalidate', `interviews: candidate:${data.candidate_id}`)

    return interview
  }

  async updateInterviewFeedback(interviewId: string, feedback: {
    feedback?: string
    rating?: number
    decision?: string
    status?: string
    notes?: any
  }): Promise<Interview> {
    const supabase = await this.getClient()

    // Fetch existing to get candidate_id and organization_id
    const { data: existing } = await supabase
      .from('interviews')
      .select('candidate_id, organization_id')
      .eq('id', interviewId)
      .single()

    const { data: interview, error } = await supabase
      .from('interviews')
      .update({
        ...feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update interview feedback: ${error.message}`)
    }

    // Invalidate candidate cache (interviews are part of candidate details)
    if (existing?.candidate_id) {
      await invalidateCache(CacheKeys.recruitment.candidates.byId(existing.candidate_id))
    }
    if (existing?.organization_id) {
      await invalidateCache(`${CacheKeys.recruitment.candidates.byOrg(existing.organization_id)}*`)
    }
    log.cache('invalidate', `interview:${interviewId} feedback updated`)

    return interview
  }
}

export const recruitmentService = new RecruitmentService()