'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'

export async function uploadCV(
  formData: FormData
): Promise<ActionResponse<{ url: string; path: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    const file = formData.get('file') as File
    if (!file) {
      return errorResponse('No file provided', 'VALIDATION_ERROR')
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only PDF, DOC, and DOCX are allowed', 'VALIDATION_ERROR')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('File size exceeds 10MB limit', 'VALIDATION_ERROR')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${profile.organization_id}/${user.id}/${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return errorResponse(`Failed to upload file: ${uploadError.message}`, 'UPLOAD_ERROR')
    }

    // Generate signed URL (valid for 1 hour)
    // This ensures only authenticated users with proper permissions can access the CV
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(filename, 3600) // 3600 seconds = 1 hour

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError)
      return errorResponse('Failed to generate secure access URL', 'URL_GENERATION_ERROR')
    }

    return successResponse({ url: signedUrlData.signedUrl, path: filename })
  } catch (error) {
    console.error('Upload CV error:', error)
    return errorResponse('Failed to upload CV', 'SERVER_ERROR')
  }
  })
}
