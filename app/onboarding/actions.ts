'use server';

import { createClient } from '@/src/lib/supabase/server';
import { successResponse, errorResponse } from '@/src/lib/utils/response';
import type { ActionResponse } from '@/src/lib/utils/response';

/**
 * Complete user onboarding process
 * Stores onboarding data in profiles table
 */
export async function completeOnboarding(
  formData?: Record<string, any>
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Not authenticated', 'UNAUTHORIZED');
    }

    // Update user profile with onboarding completion
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        // Store additional form data if provided
        ...(formData && Object.keys(formData).length > 0 ? {
          // Map form data to profile fields as needed
          // Example: full_name, avatar_url, etc.
        } : {})
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to complete onboarding:', updateError);
      return errorResponse('Failed to complete onboarding', 'DATABASE_ERROR');
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    return errorResponse('Failed to complete onboarding', 'INTERNAL_ERROR');
  }
}

/**
 * Skip onboarding process
 * Marks onboarding as completed but skipped
 */
export async function skipOnboarding(): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Not authenticated', 'UNAUTHORIZED');
    }

    // Update user profile to mark onboarding as skipped
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_skipped: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to skip onboarding:', updateError);
      return errorResponse('Failed to skip onboarding', 'DATABASE_ERROR');
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Failed to skip onboarding:', error);
    return errorResponse('Failed to skip onboarding', 'INTERNAL_ERROR');
  }
}
