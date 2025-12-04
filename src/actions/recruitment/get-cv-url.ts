'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { z } from 'zod'

const getCVUrlSchema = z.object({
  path: z.string().min(1, 'CV path is required'),
  expiresIn: z.number().min(60).max(86400).optional().default(3600), // 1 min to 24 hours, default 1 hour
})

export type GetCVUrlInput = z.infer<typeof getCVUrlSchema>

/**
 * Get a signed URL to access a CV file securely
 * The URL will be valid for the specified duration (default: 1 hour)
 * Only authorized users (HR, Admin, Manager) can access CVs from their organization
 */
export async function getCVUrl(
  input: GetCVUrlInput
): Promise<ActionResponse<{ url: string; expiresAt: Date }>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = getCVUrlSchema.parse(input)
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 2. Get user's organization and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 3. Check if user has permission to view CVs
    const allowedRoles = ['admin', 'hr', 'manager']
    if (!allowedRoles.includes(profile.role)) {
      return errorResponse(
        'You do not have permission to access CVs. Only HR, Admin, and Manager roles can view CVs.',
        'FORBIDDEN'
      )
    }

    // 4. Verify the CV path belongs to user's organization
    // Path format: {organization_id}/{user_id}/{timestamp}.{extension}
    const pathParts = validated.path.split('/')
    if (pathParts.length < 3) {
      return errorResponse('Invalid CV path format', 'VALIDATION_ERROR')
    }

    const cvOrganizationId = pathParts[0]
    if (cvOrganizationId !== profile.organization_id) {
      return errorResponse(
        'You do not have permission to access this CV (different organization)',
        'FORBIDDEN'
      )
    }

    // 5. Generate signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(validated.path, validated.expiresIn)

    if (urlError || !signedUrlData) {
      console.error('Signed URL generation error:', urlError)
      return errorResponse(
        urlError?.message || 'Failed to generate secure access URL',
        'URL_GENERATION_ERROR'
      )
    }

    // 6. Calculate expiration time
    const expiresAt = new Date(Date.now() + validated.expiresIn * 1000)

    return successResponse({
      url: signedUrlData.signedUrl,
      expiresAt,
    })
  } catch (error) {
    console.error('Get CV URL error:', error)
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 'VALIDATION_ERROR')
    }
    return errorResponse('Failed to get CV URL', 'SERVER_ERROR')
  }
  })
}
