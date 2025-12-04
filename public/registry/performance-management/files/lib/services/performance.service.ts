
import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NotFoundError } from '@/src/lib/utils/errors'

type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row']
type PerformanceReviewInsert = Database['public']['Tables']['performance_reviews']['Insert']
type PerformanceReviewUpdate = Database['public']['Tables']['performance_reviews']['Update']
type PeerFeedback = Database['public']['Tables']['peer_feedback']['Row']
type PeerFeedbackInsert = Database['public']['Tables']['peer_feedback']['Insert']
type TypedSupabaseClient = SupabaseClient<Database>

interface PerformanceReviewSummaryView {
  id: string
  organization_id: string
  reviewee_id: string
  reviewer_id: string
  review_period: string
  status: string
  rating: number
  created_at: string
  updated_at: string
  reviewee_name: string
  reviewer_name: string
}

interface UpdatePerformanceReviewData extends Partial<PerformanceReviewUpdate> {
  overall_rating?: number
  overall_comments?: string
  strengths?: string
  areas_for_improvement?: string
  goals_achieved?: string
  ai_summary?: string
  ai_insights?: Record<string, unknown>
}

export interface CreatePerformanceReviewData extends Omit<PerformanceReviewInsert, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {
  reviewee_id: string
  reviewer_id: string
  review_period: string
  review_period_start: string
  review_period_end: string
  review_type: string
  status?: string
  scheduled_date?: string
  organization_id: string
}

export interface CreateFeedbackData extends Omit<PeerFeedbackInsert, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'deleted_at'> {
  review_id: string
  reviewer_id: string
  feedback_text: string
  strengths?: string
  areas_for_improvement?: string
  is_anonymous?: boolean
  organization_id: string
}

export class PerformanceService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  async createPerformanceReview(data: CreatePerformanceReviewData): Promise<PerformanceReview> {
    const supabase = await this.getClient()

    const reviewData: PerformanceReviewInsert = {
      reviewee_id: data.reviewee_id,
      reviewer_id: data.reviewer_id,
      review_period: data.review_period,
      review_period_start: data.review_period_start,
      review_period_end: data.review_period_end,
      review_type: data.review_type,
      status: data.status || 'draft',
      scheduled_date: data.scheduled_date,
      organization_id: data.organization_id,
    }

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .insert(reviewData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create performance review: ${error.message}`)
    }

    return review as PerformanceReview
  }

  async getPerformanceReviews(organizationId: string, filters?: {
    reviewee_id?: string
    reviewer_id?: string
    status?: string
    review_period?: string
  }): Promise<PerformanceReview[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from('performance_reviews')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters?.reviewee_id) {
      query = query.eq('reviewee_id', filters.reviewee_id)
    }
    if (filters?.reviewer_id) {
      query = query.eq('reviewer_id', filters.reviewer_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.review_period) {
      query = query.eq('review_period', filters.review_period)
    }

    const { data: reviews, error } = await query

    if (error) {
      throw new Error(`Failed to fetch performance reviews: ${error.message}`)
    }

    return reviews || []
  }

  async getPerformanceReviewById(reviewId: string): Promise<PerformanceReview> {
    const supabase = await this.getClient()

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', reviewId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch review: ${error.message}`)
    }

    if (!review) {
      throw new NotFoundError('Performance review not found')
    }

    return review
  }

  async getEmployeeReviews(employeeId: string): Promise<PerformanceReview[]> {
    const supabase = await this.getClient()

    const { data: reviews, error } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('reviewee_id', employeeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch employee reviews: ${error.message}`)
    }

    return reviews || []
  }

  async updatePerformanceReview(reviewId: string, data: UpdatePerformanceReviewData): Promise<PerformanceReview> {
    const supabase = await this.getClient()

    const updateData: PerformanceReviewUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error } = await supabase
      .from('performance_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`)
    }

    return updated as PerformanceReview
  }

  async getPerformanceReviewSummary(organizationId: string): Promise<PerformanceReviewSummaryView[]> {
    const supabase = await this.getClient()

    const { data: reviews, error } = await supabase
      .from('performance_review_summary')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch performance review summary: ${error.message}`)
    }

    return (reviews as unknown as PerformanceReviewSummaryView[]) || []
  }

  async createFeedback(data: CreateFeedbackData): Promise<PeerFeedback> {
    const supabase = await this.getClient()

    const feedbackData: PeerFeedbackInsert = {
      review_id: data.review_id,
      reviewer_id: data.reviewer_id,
      feedback_text: data.feedback_text,
      strengths: data.strengths,
      areas_for_improvement: data.areas_for_improvement,
      is_anonymous: data.is_anonymous || false,
      organization_id: data.organization_id,
    }

    const { data: feedback, error } = await supabase
      .from('peer_feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create feedback: ${error.message}`)
    }

    return feedback as PeerFeedback
  }

  async getEmployeeFeedback(employeeId: string): Promise<PeerFeedback[]> {
    const supabase = await this.getClient()

    const { data: feedback, error } = await supabase
      .from('peer_feedback')
      .select('*')
      .eq('reviewee_id', employeeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch employee feedback: ${error.message}`)
    }

    return feedback || []
  }

  async getFeedbackByReview(reviewId: string): Promise<PeerFeedback[]> {
    const supabase = await this.getClient()

    const { data: feedback, error } = await supabase
      .from('peer_feedback')
      .select('*')
      .eq('review_id', reviewId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`)
    }

    return feedback || []
  }

  async getAveragePerformanceRating(profileId: string, period?: string): Promise<number> {
    const supabase = await this.getClient()

    // @ts-expect-error: Supabase types issue with RPC parameters
    const { data, error } = await supabase.rpc<number>('calculate_avg_performance_rating', {
      profile_id_param: profileId,
      period_param: period,
    })

    if (error) {
      throw new Error(`Failed to calculate average rating: ${error.message}`)
    }

    return data || 0
  }
}

export const performanceService = new PerformanceService()
