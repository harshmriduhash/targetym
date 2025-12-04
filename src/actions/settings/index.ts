'use server';

import { createClient } from '@/src/lib/supabase/server';
import {
  ensureOrganizationSettings,
  updateOrganizationSettingsData,
  updateAISettingsData,
  updateIntegrationSettingsData,
  updateNotificationSettingsData,
  updateSecuritySettingsData,
  updateBrandingSettingsData,
  ensureUserSettings,
  updateUserSettingsData,
  updateThemeSettingsData,
  updateAccessibilitySettingsData,
  updateWorkPreferencesData,
  updateOutOfOfficeData,
  updateDashboardPreferencesData,
} from '@/src/lib/services/settings.service';
import {
  updateOrganizationSettingsSchema,
  updateUserSettingsSchema,
  updateAISettingsSchema,
  updateIntegrationSettingsSchema,
  updateNotificationSettingsSchema,
  updateSecuritySettingsSchema,
  updateBrandingSettingsSchema,
  updateThemeSettingsSchema,
  updateAccessibilitySettingsSchema,
  updateWorkPreferencesSchema,
  type UpdateOrganizationSettings,
  type UpdateUserSettings,
  type UpdateAISettings,
  type UpdateIntegrationSettings,
  type UpdateNotificationSettings,
  type UpdateSecuritySettings,
  type UpdateBrandingSettings,
  type UpdateThemeSettings,
  type UpdateAccessibilitySettings,
  type UpdateWorkPreferences,
} from '@/src/lib/validations/settings.schemas';
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response';
import { handleServiceError } from '@/src/lib/utils/errors';

// ============================================================================
// Organization Settings Actions
// ============================================================================

export async function getOrganizationSettings(): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin' && profile.role !== 'hr') {
      return errorResponse('Insufficient permissions', 'FORBIDDEN');
    }

    const settings = await ensureOrganizationSettings(profile.organization_id);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateOrganizationSettings(
  input: UpdateOrganizationSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateOrganizationSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin') {
      return errorResponse('Only admins can update organization settings', 'FORBIDDEN');
    }

    const settings = await updateOrganizationSettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateAISettings(input: UpdateAISettings): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateAISettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin') {
      return errorResponse('Only admins can update AI settings', 'FORBIDDEN');
    }

    const settings = await updateAISettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateIntegrationSettings(
  input: UpdateIntegrationSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateIntegrationSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin' && profile.role !== 'hr') {
      return errorResponse('Insufficient permissions', 'FORBIDDEN');
    }

    const settings = await updateIntegrationSettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateOrganizationNotificationSettings(
  input: UpdateNotificationSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateNotificationSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin') {
      return errorResponse('Only admins can update notification settings', 'FORBIDDEN');
    }

    const settings = await updateNotificationSettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateSecuritySettings(
  input: UpdateSecuritySettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateSecuritySettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin') {
      return errorResponse('Only admins can update security settings', 'FORBIDDEN');
    }

    const settings = await updateSecuritySettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateBrandingSettings(
  input: UpdateBrandingSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateBrandingSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    if (profile.role !== 'admin') {
      return errorResponse('Only admins can update branding settings', 'FORBIDDEN');
    }

    const settings = await updateBrandingSettingsData(profile.organization_id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// User Settings Actions
// ============================================================================

export async function getUserSettings(): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION');
    }

    const settings = await ensureUserSettings(user.id, profile.organization_id);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateUserSettings(
  input: UpdateUserSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateUserSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateUserSettingsData(user.id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateThemeSettings(
  input: UpdateThemeSettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateThemeSettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateThemeSettingsData(user.id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateAccessibilitySettings(
  input: UpdateAccessibilitySettings
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateAccessibilitySettingsSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateAccessibilitySettingsData(user.id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateWorkPreferences(
  input: UpdateWorkPreferences
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateWorkPreferencesSchema.parse(input);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateWorkPreferencesData(user.id, validated);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateOutOfOffice(input: {
  enabled: boolean;
  message?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateOutOfOfficeData(
      user.id,
      input.enabled,
      input.message,
      input.start_date,
      input.end_date
    );

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

export async function updateDashboardPreferences(input: {
  layout: 'default' | 'compact' | 'detailed' | 'custom';
  widgets: string[];
}): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const settings = await updateDashboardPreferencesData(user.id, input.layout, input.widgets);

    return successResponse(settings);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}
