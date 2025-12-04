'use server'

import { createClient } from '@/src/lib/supabase/server'
import { aiService } from '@/src/lib/services/ai.service'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { CVScoringResult } from '@/src/lib/services/ai.service'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { withCSRFProtection } from '@/src/lib/middleware/csrf-protection'

export async function scoreCandidateCV(
  candidateId: string
): Promise<ActionResponse<CVScoringResult>>   {
  return withActionRateLimit('ai', async () =>  {
  return withCSRFProtection(async () => {
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            return errorResponse('Unauthorized', 'UNAUTHORIZED')
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (!profile || !['admin', 'manager'].includes(profile.role)) {
            return errorResponse('Insufficient permissions', 'FORBIDDEN')
          }

          // Fetch candidate and job posting
          const candidate = await recruitmentService.getCandidateById(candidateId)
          const jobPosting = await recruitmentService.getJobPostingById(candidate.job_posting_id)

          // For demo: simulate CV text fetch from storage
          // In production, fetch actual CV from storage using candidate.cv_url
          const cvText = `Candidate: ${candidate.name}
      Email: ${candidate.email}
      Phone: ${candidate.phone}
      LinkedIn: ${candidate.linkedin_url || 'N/A'}
      Portfolio: ${candidate.portfolio_url || 'N/A'}

      Cover Letter:
      ${candidate.cover_letter || 'No cover letter provided'}
      `

          // Score the CV
          const scoring = await aiService.scoreCandidateCV(
            cvText,
            jobPosting.description,
            jobPosting.requirements || []
          )

          // Update candidate with AI score and summary
          await recruitmentService.updateCandidate(candidateId, {
            ai_score: scoring.score,
            ai_summary: scoring.summary,
          })

          return successResponse(scoring)
        } catch (error) {
          const appError = handleServiceError(error)
          return errorResponse(appError.message, appError.code)
        }
    })
  })
}
