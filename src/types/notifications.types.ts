// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'goal_created'
  | 'goal_updated'
  | 'goal_completed'
  | 'goal_comment'
  | 'goal_assigned'
  | 'goal_deadline_approaching'
  | 'candidate_applied'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'candidate_status_changed'
  | 'performance_review_due'
  | 'performance_review_submitted'
  | 'feedback_received'
  | 'peer_feedback_requested'
  | 'team_member_joined'
  | 'direct_report_update'
  | 'mention'
  | 'system';

export type ResourceType =
  | 'goal'
  | 'key_result'
  | 'candidate'
  | 'interview'
  | 'job_posting'
  | 'performance_review'
  | 'feedback'
  | 'profile'
  | 'organization';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type DigestFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';

// ============================================================================
// Notification Interface
// ============================================================================

export interface Notification {
  id: string;
  organization_id: string;
  recipient_id: string;

  // Notification metadata
  type: NotificationType;
  title: string;
  message: string;

  // Related resource
  resource_type?: ResourceType;
  resource_id?: string;

  // Actor (who triggered the notification)
  actor_id?: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };

  // Status
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  archived_at?: string;

  // Delivery tracking
  email_sent: boolean;
  email_sent_at?: string;
  email_error?: string;
  slack_sent: boolean;
  slack_sent_at?: string;
  teams_sent: boolean;
  teams_sent_at?: string;

  // Additional data
  action_url?: string;
  metadata: Record<string, any>;

  // Priority
  priority: NotificationPriority;

  // Expiration
  expires_at?: string;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Notification Creation Input
// ============================================================================

export interface CreateNotificationInput {
  organization_id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  resource_type?: ResourceType;
  resource_id?: string;
  actor_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
}

export interface BulkCreateNotificationInput {
  recipient_ids: string[];
  notification: Omit<CreateNotificationInput, 'recipient_id'>;
}

// ============================================================================
// Notification Update Input
// ============================================================================

export interface UpdateNotificationInput {
  is_read?: boolean;
  is_archived?: boolean;
}

export interface BulkUpdateNotificationInput {
  notification_ids: string[];
  updates: UpdateNotificationInput;
}

// ============================================================================
// Notification Preferences
// ============================================================================

export interface NotificationPreferences {
  // Email notifications
  email_notifications_enabled: boolean;

  // Individual notification types
  notify_new_goal: boolean;
  notify_goal_update: boolean;
  notify_goal_completion: boolean;
  notify_goal_comment: boolean;
  notify_mentioned_in_comment: boolean;
  notify_assigned_as_collaborator: boolean;

  notify_new_candidate: boolean;
  notify_interview_scheduled: boolean;
  notify_interview_reminder: boolean;

  notify_performance_review_due: boolean;
  notify_performance_review_submitted: boolean;
  notify_feedback_received: boolean;

  notify_team_member_joined: boolean;
  notify_direct_report_update: boolean;

  // Delivery settings
  email_digest_frequency: DigestFrequency;
  slack_notifications_enabled: boolean;
  teams_notifications_enabled: boolean;
}

// ============================================================================
// Notification Template
// ============================================================================

export interface NotificationTemplate {
  id: string;
  organization_id?: string;
  template_key: string;
  notification_type: NotificationType;

  // Template content
  title_template: string;
  message_template: string;
  email_subject_template?: string;
  email_body_template?: string;

  // Configuration
  is_active: boolean;
  default_priority: NotificationPriority;

  // Channels
  enable_in_app: boolean;
  enable_email: boolean;
  enable_slack: boolean;
  enable_teams: boolean;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Notification Statistics
// ============================================================================

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
}

// ============================================================================
// Notification Filter Options
// ============================================================================

export interface NotificationFilters {
  is_read?: boolean;
  is_archived?: boolean;
  type?: NotificationType | NotificationType[];
  resource_type?: ResourceType;
  priority?: NotificationPriority | NotificationPriority[];
  start_date?: string;
  end_date?: string;
  actor_id?: string;
}

// ============================================================================
// Notification Query Result
// ============================================================================

export interface NotificationQueryResult {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
