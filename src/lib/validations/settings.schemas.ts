import { z } from 'zod';

// ============================================================================
// Organization Settings Schemas
// ============================================================================

export const organizationSettingsSchema = z.object({
  // AI Features Configuration
  ai_provider: z.enum(['openai', 'anthropic', 'none']).default('openai'),
  ai_enabled: z.boolean().default(false),
  ai_cv_scoring_enabled: z.boolean().default(false),
  ai_performance_synthesis_enabled: z.boolean().default(false),
  ai_career_recommendations_enabled: z.boolean().default(false),
  ai_api_key_encrypted: z.string().optional(),
  ai_model: z.string().default('gpt-4o'),
  ai_max_tokens: z.number().int().min(1).max(100000).default(2000),
  ai_temperature: z.number().min(0).max(2).default(0.7),

  // Integration Settings
  integrations_enabled: z.boolean().default(true),
  microsoft365_enabled: z.boolean().default(false),
  asana_enabled: z.boolean().default(false),
  notion_enabled: z.boolean().default(false),
  slack_enabled: z.boolean().default(false),
  teams_enabled: z.boolean().default(false),
  github_enabled: z.boolean().default(false),
  gitlab_enabled: z.boolean().default(false),
  jira_enabled: z.boolean().default(false),

  // Notification Preferences
  email_notifications_enabled: z.boolean().default(true),
  slack_notifications_enabled: z.boolean().default(false),
  teams_notifications_enabled: z.boolean().default(false),
  notification_channels: z.object({
    email: z.boolean().default(true),
    slack: z.boolean().default(false),
    teams: z.boolean().default(false),
  }).default({ email: true, slack: false, teams: false }),

  // Email Notification Categories
  notify_new_goal: z.boolean().default(true),
  notify_goal_update: z.boolean().default(true),
  notify_goal_completion: z.boolean().default(true),
  notify_new_candidate: z.boolean().default(true),
  notify_interview_scheduled: z.boolean().default(true),
  notify_performance_review_due: z.boolean().default(true),
  notify_performance_review_submitted: z.boolean().default(true),
  notify_team_member_joined: z.boolean().default(true),

  // Data Retention Policies
  retention_audit_logs_days: z.number().int().min(30).default(365),
  retention_deleted_records_days: z.number().int().min(0).default(90),
  retention_candidate_data_days: z.number().int().min(180).optional(),
  auto_archive_completed_goals_days: z.number().int().min(90).optional(),

  // Security Settings
  enforce_2fa: z.boolean().default(false),
  password_min_length: z.number().int().min(8).max(128).default(12),
  password_require_uppercase: z.boolean().default(true),
  password_require_lowercase: z.boolean().default(true),
  password_require_numbers: z.boolean().default(true),
  password_require_special_chars: z.boolean().default(true),
  password_expiry_days: z.number().int().min(30).optional(),
  session_timeout_minutes: z.number().int().min(15).default(480),
  ip_whitelist: z.array(z.string()).optional(),
  allowed_email_domains: z.array(z.string()).optional(),

  // Branding Settings
  brand_logo_url: z.string().url().optional(),
  brand_primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brand_secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brand_accent_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  custom_domain: z.string().optional(),
  company_tagline: z.string().optional(),

  // Localization Defaults
  default_language: z.enum(['en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']).default('en'),
  default_timezone: z.string().default('UTC'),
  default_date_format: z.enum(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).default('YYYY-MM-DD'),
  default_currency: z.string().length(3).default('USD'),

  // Feature Flags
  features_goals_enabled: z.boolean().default(true),
  features_recruitment_enabled: z.boolean().default(true),
  features_performance_enabled: z.boolean().default(true),
  features_career_dev_enabled: z.boolean().default(true),
  features_analytics_enabled: z.boolean().default(true),

  // Compliance & Privacy
  gdpr_enabled: z.boolean().default(false),
  data_processing_region: z.enum(['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-southeast', 'ap-northeast']).default('us-east'),
  anonymize_candidate_data: z.boolean().default(false),

  // Advanced Settings
  advanced_settings: z.record(z.string(), z.any()).default({}),
});

export const updateOrganizationSettingsSchema = organizationSettingsSchema.partial();

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
export type UpdateOrganizationSettings = z.infer<typeof updateOrganizationSettingsSchema>;

// ============================================================================
// User Settings Schemas
// ============================================================================

export const userSettingsSchema = z.object({
  // Localization Preferences
  language: z.enum(['en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']).default('en'),
  timezone: z.string().default('UTC'),
  date_format: z.enum(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).default('YYYY-MM-DD'),
  time_format: z.enum(['12h', '24h']).default('24h'),

  // Email Notification Preferences
  email_notifications_enabled: z.boolean().default(true),
  notify_new_goal: z.boolean().default(true),
  notify_goal_update: z.boolean().default(true),
  notify_goal_completion: z.boolean().default(true),
  notify_goal_comment: z.boolean().default(true),
  notify_mentioned_in_comment: z.boolean().default(true),
  notify_assigned_as_collaborator: z.boolean().default(true),
  notify_new_candidate: z.boolean().default(true),
  notify_interview_scheduled: z.boolean().default(true),
  notify_interview_reminder: z.boolean().default(true),
  notify_performance_review_due: z.boolean().default(true),
  notify_performance_review_submitted: z.boolean().default(true),
  notify_feedback_received: z.boolean().default(true),
  notify_team_member_joined: z.boolean().default(true),
  notify_direct_report_update: z.boolean().default(true),

  // Notification Delivery Settings
  email_digest_frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly', 'never']).default('daily'),
  slack_notifications_enabled: z.boolean().default(false),
  slack_user_id: z.string().optional(),
  teams_notifications_enabled: z.boolean().default(false),
  teams_user_id: z.string().optional(),

  // Dashboard & UI Preferences
  dashboard_layout: z.enum(['default', 'compact', 'detailed', 'custom']).default('default'),
  dashboard_widgets: z.array(z.string()).default(['goals', 'upcoming_interviews', 'pending_reviews', 'team_performance']),
  sidebar_collapsed: z.boolean().default(false),
  show_onboarding_hints: z.boolean().default(true),

  // Theme Preferences
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  theme_custom_colors: z.record(z.string(), z.string()).default({}),

  // Accessibility Settings
  accessibility_high_contrast: z.boolean().default(false),
  accessibility_reduce_motion: z.boolean().default(false),
  accessibility_screen_reader_mode: z.boolean().default(false),
  accessibility_font_size: z.enum(['small', 'medium', 'large', 'x-large']).default('medium'),
  accessibility_keyboard_shortcuts: z.boolean().default(true),

  // Privacy Settings
  profile_visibility: z.enum(['private', 'team', 'organization', 'public']).default('organization'),
  show_email: z.boolean().default(true),
  show_phone: z.boolean().default(true),
  show_location: z.boolean().default(true),
  allow_analytics_tracking: z.boolean().default(true),

  // Work Preferences
  working_hours_start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).default('09:00:00'),
  working_hours_end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).default('17:00:00'),
  working_days: z.array(z.number().int().min(1).max(7)).default([1, 2, 3, 4, 5]),
  out_of_office_enabled: z.boolean().default(false),
  out_of_office_message: z.string().optional(),
  out_of_office_start_date: z.string().optional(),
  out_of_office_end_date: z.string().optional(),

  // Advanced Preferences
  advanced_preferences: z.record(z.string(), z.any()).default({}),
}).refine((data) => {
  if (data.working_hours_end <= data.working_hours_start) {
    return false;
  }
  return true;
}, {
  message: 'Working hours end must be after working hours start',
  path: ['working_hours_end'],
}).refine((data) => {
  if (data.out_of_office_start_date && data.out_of_office_end_date) {
    return new Date(data.out_of_office_end_date) >= new Date(data.out_of_office_start_date);
  }
  return true;
}, {
  message: 'Out of office end date must be after or equal to start date',
  path: ['out_of_office_end_date'],
});

export const updateUserSettingsSchema = userSettingsSchema.partial();

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

// ============================================================================
// Quick Update Schemas (for specific sections)
// ============================================================================

export const updateAISettingsSchema = z.object({
  ai_provider: z.enum(['openai', 'anthropic', 'none']),
  ai_enabled: z.boolean(),
  ai_cv_scoring_enabled: z.boolean().optional(),
  ai_performance_synthesis_enabled: z.boolean().optional(),
  ai_career_recommendations_enabled: z.boolean().optional(),
  ai_api_key_encrypted: z.string().optional(),
  ai_model: z.string().optional(),
  ai_max_tokens: z.number().int().min(1).max(100000).optional(),
  ai_temperature: z.number().min(0).max(2).optional(),
});

export const updateIntegrationSettingsSchema = z.object({
  integrations_enabled: z.boolean(),
  microsoft365_enabled: z.boolean().optional(),
  asana_enabled: z.boolean().optional(),
  notion_enabled: z.boolean().optional(),
  slack_enabled: z.boolean().optional(),
  teams_enabled: z.boolean().optional(),
  github_enabled: z.boolean().optional(),
  gitlab_enabled: z.boolean().optional(),
  jira_enabled: z.boolean().optional(),
});

export const updateNotificationSettingsSchema = z.object({
  email_notifications_enabled: z.boolean(),
  notify_new_goal: z.boolean().optional(),
  notify_goal_update: z.boolean().optional(),
  notify_goal_completion: z.boolean().optional(),
  notify_new_candidate: z.boolean().optional(),
  notify_interview_scheduled: z.boolean().optional(),
  notify_performance_review_due: z.boolean().optional(),
  notify_performance_review_submitted: z.boolean().optional(),
  notify_team_member_joined: z.boolean().optional(),
});

export const updateSecuritySettingsSchema = z.object({
  enforce_2fa: z.boolean(),
  password_min_length: z.number().int().min(8).max(128).optional(),
  password_require_uppercase: z.boolean().optional(),
  password_require_lowercase: z.boolean().optional(),
  password_require_numbers: z.boolean().optional(),
  password_require_special_chars: z.boolean().optional(),
  password_expiry_days: z.number().int().min(30).optional(),
  session_timeout_minutes: z.number().int().min(15).optional(),
  ip_whitelist: z.array(z.string()).optional(),
  allowed_email_domains: z.array(z.string()).optional(),
});

export const updateBrandingSettingsSchema = z.object({
  brand_logo_url: z.string().url().optional(),
  brand_primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brand_secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brand_accent_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  custom_domain: z.string().optional(),
  company_tagline: z.string().optional(),
});

export const updateThemeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  theme_custom_colors: z.record(z.string(), z.string()).optional(),
});

export const updateAccessibilitySettingsSchema = z.object({
  accessibility_high_contrast: z.boolean(),
  accessibility_reduce_motion: z.boolean(),
  accessibility_screen_reader_mode: z.boolean(),
  accessibility_font_size: z.enum(['small', 'medium', 'large', 'x-large']),
  accessibility_keyboard_shortcuts: z.boolean(),
});

export const updateWorkPreferencesSchema = z.object({
  working_hours_start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  working_hours_end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  working_days: z.array(z.number().int().min(1).max(7)),
  out_of_office_enabled: z.boolean().optional(),
  out_of_office_message: z.string().optional(),
  out_of_office_start_date: z.string().optional(),
  out_of_office_end_date: z.string().optional(),
}).refine((data) => {
  return data.working_hours_end > data.working_hours_start;
}, {
  message: 'Working hours end must be after working hours start',
  path: ['working_hours_end'],
});

export type UpdateAISettings = z.infer<typeof updateAISettingsSchema>;
export type UpdateIntegrationSettings = z.infer<typeof updateIntegrationSettingsSchema>;
export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
export type UpdateSecuritySettings = z.infer<typeof updateSecuritySettingsSchema>;
export type UpdateBrandingSettings = z.infer<typeof updateBrandingSettingsSchema>;
export type UpdateThemeSettings = z.infer<typeof updateThemeSettingsSchema>;
export type UpdateAccessibilitySettings = z.infer<typeof updateAccessibilitySettingsSchema>;
export type UpdateWorkPreferences = z.infer<typeof updateWorkPreferencesSchema>;
