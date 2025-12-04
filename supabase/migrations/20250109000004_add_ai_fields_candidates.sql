-- Migration: Add AI fields to candidates table
-- Description: Add fields for AI CV scoring and analysis

-- Add AI scoring fields to candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_strengths TEXT[],
ADD COLUMN IF NOT EXISTS ai_concerns TEXT[],
ADD COLUMN IF NOT EXISTS ai_recommendation TEXT CHECK (ai_recommendation IN ('strong_yes', 'yes', 'maybe', 'no')),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

-- Add index for AI score filtering
CREATE INDEX IF NOT EXISTS idx_candidates_ai_score ON public.candidates(ai_score DESC);

-- Add index for recommendation filtering
CREATE INDEX IF NOT EXISTS idx_candidates_ai_recommendation ON public.candidates(ai_recommendation);

-- Add comment
COMMENT ON COLUMN public.candidates.ai_score IS 'AI-generated score (0-100) based on CV analysis';
COMMENT ON COLUMN public.candidates.ai_summary IS 'AI-generated summary of candidate strengths';
COMMENT ON COLUMN public.candidates.ai_strengths IS 'Array of key strengths identified by AI';
COMMENT ON COLUMN public.candidates.ai_concerns IS 'Array of concerns or gaps identified by AI';
COMMENT ON COLUMN public.candidates.ai_recommendation IS 'AI hiring recommendation';
COMMENT ON COLUMN public.candidates.ai_analyzed_at IS 'Timestamp when AI analysis was performed';
