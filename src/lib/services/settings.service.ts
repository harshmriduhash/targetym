import { createClient } from '@/src/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';
import { NotFoundError } from '@/src/lib/utils/errors';
import type {
  UpdateOrganizationSettings,
  UpdateUserSettings,
  UpdateAISettings,
  UpdateIntegrationSettings,
  UpdateNotificationSettings,
  UpdateSecuritySettings,
  UpdateBrandingSettings,
  UpdateThemeSettings,
  UpdateAccessibilitySettings,
  UpdateWorkPreferences,
} from '@/src/lib/validations/settings.schemas';

type TypedSupabaseClient = SupabaseClient<Database>;

async function getClient(): Promise<TypedSupabaseClient> {
  return createClient();
}

// ============================================================================
// Organization Settings Service Functions
// ============================================================================

export async function getOrganizationSettingsById(organizationId: string): Promise<any> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError(`Organization settings not found for organization: ${organizationId}`);
    }
    throw new Error(`Failed to fetch organization settings: ${error.message}`);
  }

  return data;
}

export async function createOrganizationSettings(organizationId: string): Promise<any> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from('organization_settings')
    .insert([{ organization_id: organizationId }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create organization settings: ${error.message}`);
  }

  return data;
}

export async function updateOrganizationSettingsData(
  organizationId: string,
  updates: Partial<UpdateOrganizationSettings>
): Promise<any> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from('organization_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update organization settings: ${error.message}`);
  }

  return data;
}

export async function updateAISettingsData(organizationId: string, settings: UpdateAISettings): Promise<any> {
  return updateOrganizationSettingsData(organizationId, settings);
}

export async function updateIntegrationSettingsData(
  organizationId: string,
  settings: UpdateIntegrationSettings
): Promise<any> {
  return updateOrganizationSettingsData(organizationId, settings);
}

export async function updateNotificationSettingsData(
  organizationId: string,
  settings: UpdateNotificationSettings
): Promise<any> {
  return updateOrganizationSettingsData(organizationId, settings);
}

export async function updateSecuritySettingsData(
  organizationId: string,
  settings: UpdateSecuritySettings
): Promise<any> {
  return updateOrganizationSettingsData(organizationId, settings);
}

export async function updateBrandingSettingsData(
  organizationId: string,
  settings: UpdateBrandingSettings
): Promise<any> {
  return updateOrganizationSettingsData(organizationId, settings);
}

export async function ensureOrganizationSettings(organizationId: string): Promise<any> {
  try {
    return await getOrganizationSettingsById(organizationId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return await createOrganizationSettings(organizationId);
    }
    throw error;
  }
}

// ============================================================================
// User Settings Service Functions
// ============================================================================

export async function getUserSettingsById(userId: string): Promise<any> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError(`User settings not found for user: ${userId}`);
    }
    throw new Error(`Failed to fetch user settings: ${error.message}`);
  }

  return data;
}

export async function createUserSettings(userId: string, organizationId: string): Promise<any> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from('user_settings')
    .insert([{
      user_id: userId,
      organization_id: organizationId,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user settings: ${error.message}`);
  }

  return data;
}

export async function updateUserSettingsData(userId: string, updates: Partial<UpdateUserSettings>): Promise<any> {
  const supabase = await getClient();

  const { data, error} = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user settings: ${error.message}`);
  }

  return data;
}

export async function updateThemeSettingsData(userId: string, settings: UpdateThemeSettings): Promise<any> {
  return updateUserSettingsData(userId, settings);
}

export async function updateAccessibilitySettingsData(
  userId: string,
  settings: UpdateAccessibilitySettings
): Promise<any> {
  return updateUserSettingsData(userId, settings);
}

export async function updateWorkPreferencesData(userId: string, settings: UpdateWorkPreferences): Promise<any> {
  return updateUserSettingsData(userId, settings);
}

export async function updateNotificationPreferencesData(
  userId: string,
  settings: Partial<UpdateUserSettings>
): Promise<any> {
  return updateUserSettingsData(userId, settings);
}

export async function ensureUserSettings(userId: string, organizationId: string): Promise<any> {
  try {
    return await getUserSettingsById(userId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return await createUserSettings(userId, organizationId);
    }
    throw error;
  }
}

export async function updateOutOfOfficeData(
  userId: string,
  enabled: boolean,
  message?: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  return updateUserSettingsData(userId, {
    out_of_office_enabled: enabled,
    out_of_office_message: message,
    out_of_office_start_date: startDate,
    out_of_office_end_date: endDate,
  });
}

export async function updateDashboardPreferencesData(
  userId: string,
  layout: 'default' | 'compact' | 'detailed' | 'custom',
  widgets: string[]
): Promise<any> {
  return updateUserSettingsData(userId, {
    dashboard_layout: layout,
    dashboard_widgets: widgets,
  });
}
