-- Migration: Add performance indexes
-- Description: Optimize query performance for common operations

-- Goals table indexes
CREATE INDEX IF NOT EXISTS idx_goals_owner_status ON public.goals(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_org_period ON public.goals(organization_id, period);
CREATE INDEX IF NOT EXISTS idx_goals_dates ON public.goals(start_date, end_date);

-- Key Results indexes
CREATE INDEX IF NOT EXISTS idx_key_results_goal ON public.key_results(goal_id);
CREATE INDEX IF NOT EXISTS idx_key_results_progress ON public.key_results(current_value, target_value);

-- Job Postings indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_org_status ON public.job_postings(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_by ON public.job_postings(created_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_dates ON public.job_postings(published_at, closes_at);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_job_status ON public.candidates(job_posting_id, status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidates(source);

-- Interviews indexes
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON public.interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date_status ON public.interviews(scheduled_at, status);

-- Performance Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.performance_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_org_status ON public.performance_reviews(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_period ON public.performance_reviews(review_period_start, review_period_end);

-- Peer Feedback indexes
-- Note: peer_feedback table does NOT have reviewee_id column (reviewee is accessed via review_id -> performance_reviews.reviewee_id)
-- CREATE INDEX IF NOT EXISTS idx_peer_feedback_reviewee ON public.peer_feedback(reviewee_id); -- COLUMN DOES NOT EXIST
CREATE INDEX IF NOT EXISTS idx_peer_feedback_review ON public.peer_feedback(review_id);
CREATE INDEX IF NOT EXISTS idx_peer_feedback_reviewer ON public.peer_feedback(reviewer_id);

-- Note: feedback and review_cycles tables do not exist in current schema
-- Commenting out these indexes to prevent migration errors

-- Add comments
COMMENT ON INDEX idx_goals_owner_status IS 'Optimize user goals queries filtered by status';
COMMENT ON INDEX idx_candidates_job_status IS 'Optimize candidate pipeline queries';
COMMENT ON INDEX idx_reviews_org_status IS 'Optimize performance reviews queries by organization and status';
