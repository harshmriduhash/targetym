/**
 * @jest-environment node
 */

import { performanceService } from '@/src/lib/services/performance.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError, ForbiddenError } from '@/src/lib/utils/errors'

jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('PerformanceService', () => {
  let mockSupabaseClient: any
  let mockQueryBuilder: any

  beforeEach(() => {
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

  describe('createPerformanceReview', () => {
    it('should create a performance review successfully', async () => {
      const mockReview = {
        id: 'review-1',
        reviewee_id: 'user-1',
        reviewer_id: 'manager-1',
        review_period: 'Q4-2025',
        review_period_start: '2025-10-01T00:00:00Z',
        review_period_end: '2025-12-31T23:59:59Z',
        review_type: 'annual',
        status: 'draft',
        organization_id: 'org-1',
        scheduled_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        completed_at: null,
        overall_rating: null,
        overall_comments: null,
        strengths: null,
        areas_for_improvement: null,
        goals_for_next_period: null,
        manager_comments: null,
        ai_summary: null,
        ai_insights: null,
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockReview,
        error: null,
      })

      const result = await performanceService.createPerformanceReview({
        reviewee_id: 'user-1',
        reviewer_id: 'manager-1',
        review_period: 'Q4-2025',
        review_period_start: '2025-10-01T00:00:00Z',
        review_period_end: '2025-12-31T23:59:59Z',
        review_type: 'annual',
        organization_id: 'org-1',
      })

      expect(result).toEqual(mockReview)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('performance_reviews')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('should throw error when creation fails', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(
        performanceService.createPerformanceReview({
          reviewee_id: 'user-1',
          reviewer_id: 'manager-1',
          review_period: 'Q4-2025',
          review_period_start: '2025-10-01T00:00:00Z',
          review_period_end: '2025-12-31T23:59:59Z',
          review_type: 'annual',
          organization_id: 'org-1',
        })
      ).rejects.toThrow('Failed to create performance review')
    })
  })

  describe('getPerformanceReviews', () => {
    it('should fetch reviews with filters', async () => {
      const mockReviews = [
        { id: 'review-1', reviewee_id: 'user-1', status: 'completed' },
        { id: 'review-2', reviewee_id: 'user-2', status: 'in_progress' },
      ]

      // Create a chainable mock that resolves at the end
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      }

      // Make the chain awaitable by adding a then method
      Object.assign(mockChain, {
        then: (resolve: any) => Promise.resolve({ data: mockReviews, error: null }).then(resolve),
      })

      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await performanceService.getPerformanceReviews(
        'org-1',
        { status: 'completed' }
      )

      expect(result).toEqual(mockReviews)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('performance_reviews')
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'completed')
    })
  })

  describe('createFeedback', () => {
    it('should create peer feedback successfully', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        review_id: 'review-1',
        reviewer_id: 'user-2',
        feedback_text: 'Great teamwork',
        strengths: 'Good communicator',
        areas_for_improvement: null,
        is_anonymous: false,
        organization_id: 'org-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockFeedback,
        error: null,
      })

      const result = await performanceService.createFeedback({
        review_id: 'review-1',
        reviewer_id: 'user-2',
        feedback_text: 'Great teamwork',
        organization_id: 'org-1',
      })

      expect(result).toEqual(mockFeedback)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('peer_feedback')
    })
  })

  describe('getPerformanceReviewById', () => {
    it('should fetch review by ID', async () => {
      const mockReview = {
        id: 'review-1',
        reviewee_id: 'user-1',
        reviewer_id: 'manager-1',
        review_period: 'Q4-2025',
        review_period_start: '2025-10-01T00:00:00Z',
        review_period_end: '2025-12-31T23:59:59Z',
        review_type: 'annual',
        status: 'completed',
        organization_id: 'org-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        scheduled_date: null,
        completed_at: new Date().toISOString(),
        overall_rating: 4,
        overall_comments: 'Good performance',
        strengths: 'Strong leadership',
        areas_for_improvement: null,
        goals_for_next_period: null,
        manager_comments: null,
        ai_summary: null,
        ai_insights: null,
      }

      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: mockReview,
        error: null,
      })

      const result = await performanceService.getPerformanceReviewById('review-1')

      expect(result).toEqual(mockReview)
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })

    it('should throw NotFoundError when review does not exist', async () => {
      mockQueryBuilder.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      await expect(
        performanceService.getPerformanceReviewById('nonexistent')
      ).rejects.toThrow(NotFoundError)
    })
  })
})
