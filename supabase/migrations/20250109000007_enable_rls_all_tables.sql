-- ============================================================================
-- Migration: Enable RLS (Row-Level Security) for All Tables
-- Created: 2025-10-09
-- Description: Complete RLS implementation with multi-tenant isolation
-- ============================================================================

-- SECTION 1: Helper Functions
-- Note: These functions are already defined in 20250109000000_create_complete_schema.sql
-- Commenting out to avoid parameter name conflicts

-- CREATE OR REPLACE FUNCTION public.get_user_organization_id() RETURNS UUID
-- LANGUAGE SQL STABLE SECURITY DEFINER AS $$
--   SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
-- $$;

-- CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT) RETURNS BOOLEAN
-- LANGUAGE SQL STABLE SECURITY DEFINER AS $$
--   SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = role_name)
-- $$;

-- CREATE OR REPLACE FUNCTION public.has_any_role(role_names TEXT[]) RETURNS BOOLEAN
-- LANGUAGE SQL STABLE SECURITY DEFINER AS $$
--   SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ANY(role_names))
-- $$;

-- CREATE OR REPLACE FUNCTION public.is_manager_of(mgr UUID, emp UUID) RETURNS BOOLEAN
-- LANGUAGE SQL STABLE SECURITY DEFINER AS $$
--   SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = emp AND manager_id = mgr)
-- $$;

CREATE OR REPLACE FUNCTION public.can_access_candidate(cid UUID) RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.candidates c JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = cid AND c.organization_id = p.organization_id
    AND (p.role IN ('admin','hr','manager') OR EXISTS (
      SELECT 1 FROM public.interviews WHERE candidate_id = cid AND interviewer_id = auth.uid()))
  )
$$;

-- Note: GRANT statements for helper functions already exist in 20250109000000_create_complete_schema.sql
-- Commenting out to avoid conflicts
-- GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.has_any_role(TEXT[]) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.is_manager_of(UUID,UUID) TO authenticated;

-- This function is new in this migration, so grant is needed
GRANT EXECUTE ON FUNCTION public.can_access_candidate(UUID) TO authenticated;

-- SECTION 2: Enable RLS on All Tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_development ENABLE ROW LEVEL SECURITY;

-- SECTION 3: Organizations Policies
CREATE POLICY org_select ON public.organizations FOR SELECT USING (id=public.get_user_organization_id());
CREATE POLICY org_update ON public.organizations FOR UPDATE USING (id=public.get_user_organization_id() AND public.has_role('admin'));
CREATE POLICY org_insert ON public.organizations FOR INSERT WITH CHECK (false);

-- SECTION 4: Profiles Policies
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (organization_id=public.get_user_organization_id());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (id=auth.uid());
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));

-- SECTION 5: Goals Policies
CREATE POLICY goals_select ON public.goals FOR SELECT USING (organization_id=public.get_user_organization_id() AND (owner_id=auth.uid() OR public.has_any_role(ARRAY['admin','manager']) OR EXISTS(SELECT 1 FROM public.goal_collaborators WHERE goal_id=goals.id AND profile_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.profiles WHERE id=goals.owner_id AND manager_id=auth.uid())));
CREATE POLICY goals_insert ON public.goals FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND owner_id=auth.uid());
CREATE POLICY goals_update ON public.goals FOR UPDATE USING (organization_id=public.get_user_organization_id() AND (owner_id=auth.uid() OR public.has_role('admin')));
CREATE POLICY goals_delete ON public.goals FOR DELETE USING (organization_id=public.get_user_organization_id() AND (owner_id=auth.uid() OR public.has_role('admin')));

-- SECTION 6: Key Results Policies
CREATE POLICY key_results_select ON public.key_results FOR SELECT USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.goals g WHERE g.id=key_results.goal_id AND (g.owner_id=auth.uid() OR public.has_any_role(ARRAY['admin','manager']) OR EXISTS(SELECT 1 FROM public.goal_collaborators WHERE goal_id=g.id AND profile_id=auth.uid()))));
CREATE POLICY key_results_insert ON public.key_results FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.goals WHERE id=key_results.goal_id AND (owner_id=auth.uid() OR public.has_role('admin'))));
CREATE POLICY key_results_update ON public.key_results FOR UPDATE USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.goals g WHERE g.id=key_results.goal_id AND (g.owner_id=auth.uid() OR public.has_role('admin') OR EXISTS(SELECT 1 FROM public.goal_collaborators WHERE goal_id=g.id AND profile_id=auth.uid()))));
CREATE POLICY key_results_delete ON public.key_results FOR DELETE USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.goals WHERE id=key_results.goal_id AND (owner_id=auth.uid() OR public.has_role('admin'))));

-- SECTION 7: Goal Collaborators Policies
CREATE POLICY goal_collab_select ON public.goal_collaborators FOR SELECT USING (profile_id=auth.uid() OR EXISTS(SELECT 1 FROM public.goals WHERE id=goal_collaborators.goal_id AND (owner_id=auth.uid() OR public.has_role('admin'))));
CREATE POLICY goal_collab_insert ON public.goal_collaborators FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.goals g JOIN public.profiles p ON p.id=goal_collaborators.profile_id WHERE g.id=goal_collaborators.goal_id AND g.organization_id=p.organization_id AND (g.owner_id=auth.uid() OR public.has_role('admin'))));
CREATE POLICY goal_collab_delete ON public.goal_collaborators FOR DELETE USING (EXISTS(SELECT 1 FROM public.goals WHERE id=goal_collaborators.goal_id AND (owner_id=auth.uid() OR public.has_role('admin'))));

-- SECTION 8: Job Postings Policies
CREATE POLICY job_post_select ON public.job_postings FOR SELECT USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr','manager']));
CREATE POLICY job_post_insert ON public.job_postings FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']) AND created_by=auth.uid());
CREATE POLICY job_post_update ON public.job_postings FOR UPDATE USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY job_post_delete ON public.job_postings FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 9: Candidates Policies
CREATE POLICY candidates_select ON public.candidates FOR SELECT USING (organization_id=public.get_user_organization_id() AND (public.has_any_role(ARRAY['admin','hr','manager']) OR public.can_access_candidate(id)));
CREATE POLICY candidates_insert ON public.candidates FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY candidates_update ON public.candidates FOR UPDATE USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr','manager']));
CREATE POLICY candidates_delete ON public.candidates FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 10: Interviews Policies
CREATE POLICY interviews_select ON public.interviews FOR SELECT USING (organization_id=public.get_user_organization_id() AND (interviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr','manager'])));
CREATE POLICY interviews_insert ON public.interviews FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY interviews_update ON public.interviews FOR UPDATE USING (organization_id=public.get_user_organization_id() AND (interviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr'])));
CREATE POLICY interviews_delete ON public.interviews FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));

-- SECTION 11: Candidate Notes Policies
CREATE POLICY cand_notes_select ON public.candidate_notes FOR SELECT USING (organization_id=public.get_user_organization_id() AND (created_by=auth.uid() OR public.has_any_role(ARRAY['admin','hr','manager']) OR public.can_access_candidate(candidate_id)));
CREATE POLICY cand_notes_insert ON public.candidate_notes FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND created_by=auth.uid() AND (public.has_any_role(ARRAY['admin','hr','manager']) OR public.can_access_candidate(candidate_id)));
CREATE POLICY cand_notes_update ON public.candidate_notes FOR UPDATE USING (organization_id=public.get_user_organization_id() AND created_by=auth.uid());
CREATE POLICY cand_notes_delete ON public.candidate_notes FOR DELETE USING (organization_id=public.get_user_organization_id() AND (created_by=auth.uid() OR public.has_role('admin')));

-- SECTION 12: Performance Reviews Policies
CREATE POLICY perf_rev_select ON public.performance_reviews FOR SELECT USING (organization_id=public.get_user_organization_id() AND (reviewee_id=auth.uid() OR reviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(reviewee_id)));
CREATE POLICY perf_rev_insert ON public.performance_reviews FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND reviewer_id=auth.uid() AND (public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(reviewee_id)));
CREATE POLICY perf_rev_update ON public.performance_reviews FOR UPDATE USING (organization_id=public.get_user_organization_id() AND (reviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr'])));
CREATE POLICY perf_rev_delete ON public.performance_reviews FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 13: Performance Criteria Policies
CREATE POLICY perf_crit_select ON public.performance_criteria FOR SELECT USING (organization_id=public.get_user_organization_id());
CREATE POLICY perf_crit_insert ON public.performance_criteria FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY perf_crit_update ON public.performance_criteria FOR UPDATE USING (organization_id=public.get_user_organization_id() AND public.has_any_role(ARRAY['admin','hr']));
CREATE POLICY perf_crit_delete ON public.performance_criteria FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 14: Performance Ratings Policies
CREATE POLICY perf_rat_select ON public.performance_ratings FOR SELECT USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews pr WHERE pr.id=performance_ratings.review_id AND (pr.reviewee_id=auth.uid() OR pr.reviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(pr.reviewee_id))));
CREATE POLICY perf_rat_insert ON public.performance_ratings FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews WHERE id=performance_ratings.review_id AND reviewer_id=auth.uid()));
CREATE POLICY perf_rat_update ON public.performance_ratings FOR UPDATE USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews WHERE id=performance_ratings.review_id AND (reviewer_id=auth.uid() OR public.has_role('admin'))));
CREATE POLICY perf_rat_delete ON public.performance_ratings FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 15: Performance Goals Policies
CREATE POLICY perf_goals_select ON public.performance_goals FOR SELECT USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews pr WHERE pr.id=performance_goals.review_id AND (pr.reviewee_id=auth.uid() OR pr.reviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(pr.reviewee_id))));
CREATE POLICY perf_goals_insert ON public.performance_goals FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews WHERE id=performance_goals.review_id AND (reviewer_id=auth.uid() OR reviewee_id=auth.uid())));
CREATE POLICY perf_goals_update ON public.performance_goals FOR UPDATE USING (organization_id=public.get_user_organization_id() AND EXISTS(SELECT 1 FROM public.performance_reviews WHERE id=performance_goals.review_id AND (reviewer_id=auth.uid() OR reviewee_id=auth.uid() OR public.has_role('admin'))));
CREATE POLICY perf_goals_delete ON public.performance_goals FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 16: Peer Feedback Policies
CREATE POLICY peer_fb_select ON public.peer_feedback FOR SELECT USING (organization_id=public.get_user_organization_id() AND (reviewer_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR EXISTS(SELECT 1 FROM public.performance_reviews WHERE id=peer_feedback.review_id AND reviewee_id=auth.uid())));
CREATE POLICY peer_fb_insert ON public.peer_feedback FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND reviewer_id=auth.uid() AND EXISTS(SELECT 1 FROM public.performance_reviews pr JOIN public.profiles p ON p.id=pr.reviewee_id WHERE pr.id=peer_feedback.review_id AND p.organization_id=public.get_user_organization_id()));
CREATE POLICY peer_fb_update ON public.peer_feedback FOR UPDATE USING (organization_id=public.get_user_organization_id() AND reviewer_id=auth.uid() AND submitted_at IS NULL);
CREATE POLICY peer_fb_delete ON public.peer_feedback FOR DELETE USING (organization_id=public.get_user_organization_id() AND (reviewer_id=auth.uid() OR public.has_role('admin')));

-- SECTION 17: Career Development Policies
CREATE POLICY career_dev_select ON public.career_development FOR SELECT USING (organization_id=public.get_user_organization_id() AND (profile_id=auth.uid() OR mentor_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(profile_id)));
CREATE POLICY career_dev_insert ON public.career_development FOR INSERT WITH CHECK (organization_id=public.get_user_organization_id() AND (profile_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr'])));
CREATE POLICY career_dev_update ON public.career_development FOR UPDATE USING (organization_id=public.get_user_organization_id() AND (profile_id=auth.uid() OR mentor_id=auth.uid() OR public.has_any_role(ARRAY['admin','hr']) OR public.is_manager_of(profile_id)));
CREATE POLICY career_dev_delete ON public.career_development FOR DELETE USING (organization_id=public.get_user_organization_id() AND public.has_role('admin'));

-- SECTION 18: Grant Permissions
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Migration Complete
