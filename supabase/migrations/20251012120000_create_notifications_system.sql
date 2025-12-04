-- ============================================================================
-- Migration: Notifications System
-- Created: 2025-01-12
-- Description: Complete notification system with in-app and email notifications
-- ============================================================================

-- SECTION 1: Notifications Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Notification metadata
  type TEXT NOT NULL CHECK (type IN (
    'goal_created', 'goal_updated', 'goal_completed', 'goal_comment',
    'goal_assigned', 'goal_deadline_approaching',
    'candidate_applied', 'interview_scheduled', 'interview_reminder',
    'candidate_status_changed',
    'performance_review_due', 'performance_review_submitted',
    'feedback_received', 'peer_feedback_requested',
    'team_member_joined', 'direct_report_update',
    'mention', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related resource
  resource_type TEXT CHECK (resource_type IN (
    'goal', 'key_result', 'candidate', 'interview', 'job_posting',
    'performance_review', 'feedback', 'profile', 'organization'
  )),
  resource_id UUID,

  -- Actor (who triggered the notification)
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,

  -- Delivery tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  slack_sent BOOLEAN DEFAULT false,
  slack_sent_at TIMESTAMPTZ,
  teams_sent BOOLEAN DEFAULT false,
  teams_sent_at TIMESTAMPTZ,

  -- Additional data
  action_url TEXT, -- Deep link to the related resource
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Expiration
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_resource ON public.notifications(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_recipient ON public.notifications(recipient_id, is_read) WHERE is_read = false;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread_created
  ON public.notifications(recipient_id, is_read, created_at DESC)
  WHERE is_archived = false;

-- SECTION 2: Notification Preferences (extending user_settings)
-- ============================================================================

-- Add notification digest tracking
CREATE TABLE IF NOT EXISTS public.notification_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  digest_type TEXT NOT NULL CHECK (digest_type IN ('hourly', 'daily', 'weekly')),
  notification_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_digests_user_id ON public.notification_digests(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_digests_scheduled_for ON public.notification_digests(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_digests_status ON public.notification_digests(status);

-- SECTION 3: Notification Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Template identification
  template_key TEXT NOT NULL, -- e.g., 'goal_created', 'interview_scheduled'
  notification_type TEXT NOT NULL,

  -- Template content
  title_template TEXT NOT NULL, -- Supports {{variable}} syntax
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  default_priority TEXT DEFAULT 'normal' CHECK (default_priority IN ('low', 'normal', 'high', 'urgent')),

  -- Channels
  enable_in_app BOOLEAN DEFAULT true,
  enable_email BOOLEAN DEFAULT true,
  enable_slack BOOLEAN DEFAULT false,
  enable_teams BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(organization_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_org ON public.notification_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON public.notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(notification_type);

-- Insert default templates
INSERT INTO public.notification_templates (template_key, notification_type, title_template, message_template, email_subject_template, email_body_template)
VALUES
  -- Goals notifications
  ('goal_created', 'goal_created',
   'New goal created: {{goal_title}}',
   '{{actor_name}} created a new goal: {{goal_title}}',
   'New Goal: {{goal_title}}',
   'Hello {{recipient_name}},\n\n{{actor_name}} has created a new goal: {{goal_title}}\n\n{{goal_description}}\n\nView goal: {{action_url}}'),

  ('goal_updated', 'goal_updated',
   'Goal updated: {{goal_title}}',
   '{{actor_name}} updated the goal: {{goal_title}}',
   'Goal Updated: {{goal_title}}',
   'Hello {{recipient_name}},\n\n{{actor_name}} has updated the goal: {{goal_title}}\n\nView changes: {{action_url}}'),

  ('goal_completed', 'goal_completed',
   'Goal completed: {{goal_title}}',
   '{{actor_name}} marked the goal as completed: {{goal_title}}',
   'Goal Completed: {{goal_title}}',
   'Hello {{recipient_name}},\n\nCongratulations! {{actor_name}} has completed the goal: {{goal_title}}\n\nView goal: {{action_url}}'),

  ('goal_assigned', 'goal_assigned',
   'You were added as a collaborator on: {{goal_title}}',
   '{{actor_name}} added you as a collaborator on: {{goal_title}}',
   'Added as Collaborator: {{goal_title}}',
   'Hello {{recipient_name}},\n\n{{actor_name}} has added you as a collaborator on the goal: {{goal_title}}\n\nView goal: {{action_url}}'),

  -- Recruitment notifications
  ('candidate_applied', 'candidate_applied',
   'New candidate application: {{candidate_name}}',
   '{{candidate_name}} applied for {{job_title}}',
   'New Application: {{job_title}}',
   'Hello {{recipient_name}},\n\n{{candidate_name}} has applied for the position: {{job_title}}\n\nView application: {{action_url}}'),

  ('interview_scheduled', 'interview_scheduled',
   'Interview scheduled with {{candidate_name}}',
   'Interview scheduled for {{scheduled_at}} with {{candidate_name}}',
   'Interview Scheduled: {{candidate_name}}',
   'Hello {{recipient_name}},\n\nAn interview has been scheduled with {{candidate_name}} for {{job_title}}\n\nDate & Time: {{scheduled_at}}\nLocation: {{location}}\n\nView details: {{action_url}}'),

  ('interview_reminder', 'interview_reminder',
   'Interview reminder: {{candidate_name}} in 1 hour',
   'Your interview with {{candidate_name}} starts in 1 hour',
   'Interview Reminder: {{candidate_name}}',
   'Hello {{recipient_name}},\n\nThis is a reminder that your interview with {{candidate_name}} starts in 1 hour.\n\nDate & Time: {{scheduled_at}}\nLocation: {{location}}\n\nView details: {{action_url}}'),

  -- Performance notifications
  ('performance_review_due', 'performance_review_due',
   'Performance review due: {{reviewee_name}}',
   'Performance review for {{reviewee_name}} is due on {{due_date}}',
   'Performance Review Due: {{reviewee_name}}',
   'Hello {{recipient_name}},\n\nThe performance review for {{reviewee_name}} is due on {{due_date}}.\n\nComplete review: {{action_url}}'),

  ('performance_review_submitted', 'performance_review_submitted',
   'Performance review submitted',
   '{{actor_name}} submitted a performance review for {{reviewee_name}}',
   'Performance Review Submitted',
   'Hello {{recipient_name}},\n\n{{actor_name}} has submitted a performance review for {{reviewee_name}}.\n\nView review: {{action_url}}'),

  ('feedback_received', 'feedback_received',
   'New feedback received',
   'You received new feedback from {{actor_name}}',
   'New Feedback Received',
   'Hello {{recipient_name}},\n\nYou have received new feedback from {{actor_name}}.\n\nView feedback: {{action_url}}'),

  -- Team notifications
  ('team_member_joined', 'team_member_joined',
   'New team member: {{member_name}}',
   '{{member_name}} joined {{team_name}}',
   'New Team Member: {{member_name}}',
   'Hello {{recipient_name}},\n\n{{member_name}} has joined {{team_name}}.\n\nView profile: {{action_url}}')
ON CONFLICT (organization_id, template_key) DO NOTHING;

-- SECTION 4: Helper Functions
-- ============================================================================

-- Function to get notification preferences for a user
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID, p_notification_type TEXT)
RETURNS TABLE (
  email_enabled BOOLEAN,
  slack_enabled BOOLEAN,
  teams_enabled BOOLEAN,
  digest_frequency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(us.email_notifications_enabled, true) as email_enabled,
    COALESCE(us.slack_notifications_enabled, false) as slack_enabled,
    COALESCE(us.teams_notifications_enabled, false) as teams_enabled,
    COALESCE(us.email_digest_frequency, 'realtime') as digest_frequency
  FROM public.user_settings us
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive notification based on settings
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_settings JSONB;
  v_user_settings RECORD;
  v_setting_key TEXT;
BEGIN
  -- Map notification type to settings key
  v_setting_key := CASE p_notification_type
    WHEN 'goal_created' THEN 'notify_new_goal'
    WHEN 'goal_updated' THEN 'notify_goal_update'
    WHEN 'goal_completed' THEN 'notify_goal_completion'
    WHEN 'goal_comment' THEN 'notify_goal_comment'
    WHEN 'goal_assigned' THEN 'notify_assigned_as_collaborator'
    WHEN 'candidate_applied' THEN 'notify_new_candidate'
    WHEN 'interview_scheduled' THEN 'notify_interview_scheduled'
    WHEN 'interview_reminder' THEN 'notify_interview_reminder'
    WHEN 'performance_review_due' THEN 'notify_performance_review_due'
    WHEN 'performance_review_submitted' THEN 'notify_performance_review_submitted'
    WHEN 'feedback_received' THEN 'notify_feedback_received'
    WHEN 'team_member_joined' THEN 'notify_team_member_joined'
    WHEN 'mention' THEN 'notify_mentioned_in_comment'
    WHEN 'direct_report_update' THEN 'notify_direct_report_update'
    ELSE NULL
  END;

  -- If no setting key found, allow notification by default
  IF v_setting_key IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check user settings
  SELECT * INTO v_user_settings
  FROM public.user_settings
  WHERE user_id = p_user_id;

  -- Check organization settings if user settings not found
  IF NOT FOUND THEN
    SELECT * INTO v_org_settings
    FROM public.organization_settings
    WHERE organization_id = p_organization_id;

    -- Return org-level setting or true by default
    RETURN COALESCE((v_org_settings->v_setting_key)::BOOLEAN, TRUE);
  END IF;

  -- Use dynamic column access for user settings
  RETURN CASE v_setting_key
    WHEN 'notify_new_goal' THEN COALESCE(v_user_settings.notify_new_goal, TRUE)
    WHEN 'notify_goal_update' THEN COALESCE(v_user_settings.notify_goal_update, TRUE)
    WHEN 'notify_goal_completion' THEN COALESCE(v_user_settings.notify_goal_completion, TRUE)
    WHEN 'notify_goal_comment' THEN COALESCE(v_user_settings.notify_goal_comment, TRUE)
    WHEN 'notify_assigned_as_collaborator' THEN COALESCE(v_user_settings.notify_assigned_as_collaborator, TRUE)
    WHEN 'notify_new_candidate' THEN COALESCE(v_user_settings.notify_new_candidate, TRUE)
    WHEN 'notify_interview_scheduled' THEN COALESCE(v_user_settings.notify_interview_scheduled, TRUE)
    WHEN 'notify_interview_reminder' THEN COALESCE(v_user_settings.notify_interview_reminder, TRUE)
    WHEN 'notify_performance_review_due' THEN COALESCE(v_user_settings.notify_performance_review_due, TRUE)
    WHEN 'notify_performance_review_submitted' THEN COALESCE(v_user_settings.notify_performance_review_submitted, TRUE)
    WHEN 'notify_feedback_received' THEN COALESCE(v_user_settings.notify_feedback_received, TRUE)
    WHEN 'notify_team_member_joined' THEN COALESCE(v_user_settings.notify_team_member_joined, TRUE)
    WHEN 'notify_mentioned_in_comment' THEN COALESCE(v_user_settings.notify_mentioned_in_comment, TRUE)
    WHEN 'notify_direct_report_update' THEN COALESCE(v_user_settings.notify_direct_report_update, TRUE)
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification with preferences check
CREATE OR REPLACE FUNCTION create_notification(
  p_organization_id UUID,
  p_recipient_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_should_send BOOLEAN;
BEGIN
  -- Check if user should receive this notification
  v_should_send := should_send_notification(p_recipient_id, p_type, p_organization_id);

  IF NOT v_should_send THEN
    RETURN NULL;
  END IF;

  -- Create notification
  INSERT INTO public.notifications (
    organization_id, recipient_id, type, title, message,
    resource_type, resource_id, actor_id, action_url, metadata, priority
  ) VALUES (
    p_organization_id, p_recipient_id, p_type, p_title, p_message,
    p_resource_type, p_resource_id, p_actor_id, p_action_url, p_metadata, p_priority
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 5: RLS Policies
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_id = (SELECT id FROM auth.users WHERE id = auth.uid()));

-- Notifications: Users can update own notifications (mark as read/archived)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (recipient_id = (SELECT id FROM auth.users WHERE id = auth.uid()));

-- Notifications: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Notification digests: Users can view own digests
CREATE POLICY "Users can view own digests"
  ON public.notification_digests FOR SELECT
  USING (user_id = (SELECT id FROM auth.users WHERE id = auth.uid()));

-- Templates: Users can view templates for their organization
CREATE POLICY "Users can view organization templates"
  ON public.notification_templates FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Templates: Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON public.notification_templates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- SECTION 6: Cleanup old notifications (optional, can be run periodically)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < (now() - (days_to_keep || ' days')::INTERVAL)
    AND is_read = true
    AND is_archived = true;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_digests_updated_at
  BEFORE UPDATE ON public.notification_digests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration Complete
COMMENT ON TABLE public.notifications IS 'In-app and email notifications for users';
COMMENT ON TABLE public.notification_digests IS 'Notification digests sent to users based on their preferences';
COMMENT ON TABLE public.notification_templates IS 'Templates for different notification types';
