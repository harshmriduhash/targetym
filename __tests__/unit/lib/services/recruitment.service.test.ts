/**
 * @jest-environment node
 */

import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError } from '@/src/lib/utils/errors'

// Mock Supabase client
jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('RecruitmentService', () => {
  let mockSupabaseClient: any
  let mockQueryBuilder: any

  beforeEach(() => {
    // Reset mock before each test
    // Create a mock query builder that supports chaining
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
      then: jest.fn(), // Makes it awaitable
    }

    // Create a mock Supabase client that returns the query builder
    mockSupabaseClient = {
      from: jest.fn(() => mockQueryBuilder),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createJobPosting', () => {
    it('should create a job posting successfully', async () => {
      const mockJobPosting = {
        id: 'job-1',
        title: 'Software Engineer',
        description: 'We are hiring',
        employment_type: 'full_time',
        status: 'draft',
        organization_id: 'org-1',
        created_by: 'user-1',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockJobPosting,
        error: null,
      })

      const result = await recruitmentService.createJobPosting({
        title: 'Software Engineer',
        description: 'We are hiring',
        employment_type: 'full_time',
        organization_id: 'org-1',
        posted_by: 'user-1',
      })

      expect(result).toEqual(mockJobPosting)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('job_postings')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('should throw error when creation fails', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(
        recruitmentService.createJobPosting({
          title: 'Software Engineer',
          description: 'We are hiring',
          employment_type: 'full_time',
          organization_id: 'org-1',
          posted_by: 'user-1',
        })
      ).rejects.toThrow('Failed to create job posting')
    })
  })

  describe('getJobPostings', () => {
    it('should fetch job postings with pagination', async () => {
      const mockJobs = [
        { id: 'job-1', title: 'Software Engineer' },
        { id: 'job-2', title: 'Product Manager' },
      ]

      // Track which query we're on (count vs data)
      let queryCount = 0

      // Mock the 'then' method to make queries awaitable
      mockQueryBuilder.then.mockImplementation((resolve: any) => {
        queryCount++
        if (queryCount === 1) {
          // First await: count query
          return Promise.resolve({
            count: 50,
            error: null,
          }).then(resolve)
        } else {
          // Second await: data query
          return Promise.resolve({
            data: mockJobs,
            error: null,
          }).then(resolve)
        }
      })

      const result = await recruitmentService.getJobPostings(
        'org-1',
        { status: 'open' },
        { page: 1, pageSize: 20 }
      )

      expect(result.data).toEqual(mockJobs)
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      })
    })

    it('should apply filters correctly', async () => {
      // Mock queries with filters
      let queryCount = 0

      mockQueryBuilder.then.mockImplementation((resolve: any) => {
        queryCount++
        if (queryCount === 1) {
          // Count query
          return Promise.resolve({
            count: 0,
            error: null,
          }).then(resolve)
        } else {
          // Data query
          return Promise.resolve({
            data: [],
            error: null,
          }).then(resolve)
        }
      })

      await recruitmentService.getJobPostings(
        'org-1',
        {
          status: 'open',
          department: 'Engineering',
          location: 'Remote',
        },
        { page: 1, pageSize: 20 }
      )

      expect(mockSupabaseClient.from).toHaveBeenCalled()
      // Verify filters were applied (each filter calls eq twice: once for count, once for data query)
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'open')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('department', 'Engineering')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('location', 'Remote')
    })
  })

  describe('getJobPostingById', () => {
    it('should fetch a job posting by ID with relations', async () => {
      const mockJob = {
        id: 'job-1',
        title: 'Software Engineer',
        hiring_manager: { id: 'user-1', full_name: 'John Doe' },
        candidates: [{ id: 'candidate-1', name: 'Jane Smith' }],
      }

      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: mockJob,
        error: null,
      })

      const result = await recruitmentService.getJobPostingById('job-1')

      expect(result).toEqual(mockJob)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('job_postings')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })

    it('should throw NotFoundError when job posting does not exist', async () => {
      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      await expect(
        recruitmentService.getJobPostingById('nonexistent')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('createCandidate', () => {
    it('should create a candidate successfully', async () => {
      const mockCandidate = {
        id: 'candidate-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'new',
        job_posting_id: 'job-1',
        organization_id: 'org-1',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockCandidate,
        error: null,
      })

      const result = await recruitmentService.createCandidate({
        name: 'Jane Smith',
        email: 'jane@example.com',
        job_posting_id: 'job-1',
        organization_id: 'org-1',
      })

      expect(result).toEqual(mockCandidate)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('candidates')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })
  })

  describe('getCandidates', () => {
    it('should fetch candidates with pagination and relations', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          name: 'Jane Smith',
          job_posting: { id: 'job-1', title: 'Software Engineer' },
          interviews: [],
        },
      ]

      // Mock count and data queries
      let queryCount = 0

      mockQueryBuilder.then.mockImplementation((resolve: any) => {
        queryCount++
        if (queryCount === 1) {
          // First await: count query
          return Promise.resolve({
            count: 25,
            error: null,
          }).then(resolve)
        } else {
          // Second await: data query
          return Promise.resolve({
            data: mockCandidates,
            error: null,
          }).then(resolve)
        }
      })

      const result = await recruitmentService.getCandidates(
        'org-1',
        { status: 'new' },
        { page: 1, pageSize: 20 }
      )

      expect(result.data).toEqual(mockCandidates)
      expect(result.meta.totalItems).toBe(25)
    })
  })

  describe('updateCandidateStatus', () => {
    it('should update candidate status successfully', async () => {
      const mockCandidate = {
        id: 'candidate-1',
        status: 'interviewing',
        current_stage: 'technical',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockCandidate,
        error: null,
      })

      const result = await recruitmentService.updateCandidateStatus(
        'candidate-1',
        'interviewing',
        'technical'
      )

      expect(result).toEqual(mockCandidate)
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })
  })

  describe('scheduleInterview', () => {
    it('should schedule an interview successfully', async () => {
      const mockInterview = {
        id: 'interview-1',
        candidate_id: 'candidate-1',
        interviewer_id: 'user-1',
        interview_type: 'technical',
        scheduled_date: '2025-10-15T10:00:00Z',
        status: 'scheduled',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockInterview,
        error: null,
      })

      const result = await recruitmentService.scheduleInterview({
        candidate_id: 'candidate-1',
        interviewer_id: 'user-1',
        interview_type: 'technical',
        scheduled_date: '2025-10-15T10:00:00Z',
        organization_id: 'org-1',
      })

      expect(result).toEqual(mockInterview)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('interviews')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })
  })

  describe('updateInterviewFeedback', () => {
    it('should update interview feedback successfully', async () => {
      const mockInterview = {
        id: 'interview-1',
        feedback: 'Great technical skills',
        rating: 5,
        decision: 'hire',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockInterview,
        error: null,
      })

      const result = await recruitmentService.updateInterviewFeedback('interview-1', {
        feedback: 'Great technical skills',
        rating: 5,
        decision: 'hire',
      })

      expect(result).toEqual(mockInterview)
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })
  })
})
