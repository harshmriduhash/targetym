// Supabase type helpers and utilities
import { Database } from './database.types'

// Extract table types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Extract view types
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// Extract function types
export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Returns']

// Specific table types for convenience
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type Goal = Tables<'goals'>
export type KeyResult = Tables<'key_results'>
export type GoalCollaborator = Tables<'goal_collaborators'>
export type JobPosting = Tables<'job_postings'>
export type Candidate = Tables<'candidates'>
export type Interview = Tables<'interviews'>
export type CandidateNote = Tables<'candidate_notes'>
export type PerformanceReview = Tables<'performance_reviews'>
export type PerformanceCriteria = Tables<'performance_criteria'>
export type PerformanceRating = Tables<'performance_ratings'>
export type PerformanceGoal = Tables<'performance_goals'>
export type PeerFeedback = Tables<'peer_feedback'>
export type CareerDevelopment = Tables<'career_development'>

// Insert types
export type OrganizationInsert = TablesInsert<'organizations'>
export type ProfileInsert = TablesInsert<'profiles'>
export type GoalInsert = TablesInsert<'goals'>
export type KeyResultInsert = TablesInsert<'key_results'>
export type JobPostingInsert = TablesInsert<'job_postings'>
export type CandidateInsert = TablesInsert<'candidates'>
export type InterviewInsert = TablesInsert<'interviews'>
export type PerformanceReviewInsert = TablesInsert<'performance_reviews'>

// Update types
export type OrganizationUpdate = TablesUpdate<'organizations'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type GoalUpdate = TablesUpdate<'goals'>
export type KeyResultUpdate = TablesUpdate<'key_results'>
export type CandidateUpdate = TablesUpdate<'candidates'>
export type InterviewUpdate = TablesUpdate<'interviews'>
export type PerformanceReviewUpdate = TablesUpdate<'performance_reviews'>

// View types
export type GoalWithProgress = Views<'goals_with_progress'>
export type JobPostingWithStats = Views<'job_postings_with_stats'>
export type PerformanceReviewSummary = Views<'performance_review_summary'>

// Enum types for better type safety
export type UserRole = 'admin' | 'manager' | 'employee' | 'hr'
export type GoalStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type KeyResultStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed'
export type JobPostingStatus = 'draft' | 'active' | 'closed' | 'filled' | 'cancelled'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary'
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
export type InterviewType = 'phone_screen' | 'technical' | 'behavioral' | 'cultural_fit' | 'final'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
export type ReviewType = 'annual' | 'quarterly' | 'probation' | 'mid_year' | '360_feedback'
export type ReviewStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

// Extended types with relations
export type GoalWithOwner = Goal & {
  owner: Profile
}

export type GoalWithKeyResults = Goal & {
  key_results: KeyResult[]
}

export type CandidateWithJobPosting = Candidate & {
  job_posting: JobPosting
}

export type InterviewWithDetails = Interview & {
  candidate: Candidate
  interviewer: Profile
}

export type PerformanceReviewWithDetails = PerformanceReview & {
  reviewee: Profile
  reviewer: Profile
  ratings: PerformanceRating[]
}

// AI-related types
export interface AICVAnalysis {
  match_score: number
  skills_match: string[]
  skills_missing: string[]
  experience_years: number
  education_level: string
  strengths: string[]
  concerns: string[]
  recommendation: 'strong_match' | 'good_match' | 'weak_match' | 'no_match'
}

export interface AIPerformanceInsights {
  overall_trend: 'improving' | 'stable' | 'declining'
  key_strengths: string[]
  development_areas: string[]
  career_recommendations: string[]
  promotion_readiness: number // 0-100
  retention_risk: 'low' | 'medium' | 'high'
}

export interface AICareerRecommendations {
  suggested_roles: string[]
  skill_gaps: string[]
  learning_paths: {
    skill: string
    courses: string[]
    estimated_time: string
  }[]
  career_trajectory: {
    role: string
    timeline: string
    requirements: string[]
  }[]
}

// Filter and sort types
export interface GoalFilters {
  owner_id?: string
  period?: string
  status?: GoalStatus | GoalStatus[]
  start_date?: string
  end_date?: string
}

export interface CandidateFilters {
  job_posting_id?: string
  status?: CandidateStatus | CandidateStatus[]
  source?: string
  min_ai_score?: number
}

export interface PerformanceReviewFilters {
  reviewee_id?: string
  reviewer_id?: string
  review_period?: string
  review_type?: ReviewType
  status?: ReviewStatus | ReviewStatus[]
}

export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  column: string
  direction: SortDirection
}

// Pagination
export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
