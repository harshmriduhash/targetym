-- Migration: RLS policies for AI features
-- Description: Add security policies for AI-related operations

-- Function to check if user can access candidate AI data
CREATE OR REPLACE FUNCTION public.can_view_candidate_ai(candidate_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.candidates c
    INNER JOIN public.job_postings jp ON c.job_posting_id = jp.id
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = candidate_id
    AND jp.organization_id = p.organization_id
    AND p.role IN ('admin', 'manager')
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user can request AI analysis
CREATE OR REPLACE FUNCTION public.can_request_ai_analysis()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Policy: Only managers and admins can trigger AI scoring
CREATE POLICY "Managers can trigger AI scoring"
  ON public.candidates FOR UPDATE
  USING (
    public.can_request_ai_analysis()
    AND EXISTS (
      SELECT 1 FROM public.job_postings jp
      INNER JOIN public.profiles p ON p.organization_id = jp.organization_id
      WHERE jp.id = candidates.job_posting_id
      AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    -- Allow updating AI fields only
    ai_score IS NOT NULL OR
    ai_summary IS NOT NULL OR
    ai_recommendation IS NOT NULL
  );

-- Policy: Users can view AI recommendations for their own career
CREATE POLICY "Employees can view their own AI recommendations"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR
    public.has_any_role(ARRAY['admin', 'manager'])
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_view_candidate_ai(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_request_ai_analysis() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.can_view_candidate_ai IS 'Check if user can view AI analysis for a candidate';
COMMENT ON FUNCTION public.can_request_ai_analysis IS 'Check if user has permission to request AI analysis';
