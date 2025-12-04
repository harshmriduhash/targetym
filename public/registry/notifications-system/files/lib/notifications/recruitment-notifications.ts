
import { notificationsService } from '@/src/lib/services/notifications.service';
import type { CreateNotificationInput } from '@/src/types/notifications.types';

// ============================================================================
// Recruitment Notification Helpers
// ============================================================================

/**
 * Send notification when a candidate applies
 */
export async function notifyCandidateApplied(params: {
  candidateId: string;
  candidateName: string;
  jobPostingId: string;
  jobTitle: string;
  organizationId: string;
  recipientIds: string[]; // Hiring managers, HR team
}) {
  const { candidateId, candidateName, jobPostingId, jobTitle, organizationId, recipientIds } =
    params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'candidate_applied',
    title: `New application: ${candidateName}`,
    message: `${candidateName} has applied for ${jobTitle}`,
    resource_type: 'candidate',
    resource_id: candidateId,
    action_url: `/dashboard/recruitment/candidates/${candidateId}`,
    metadata: {
      candidate_name: candidateName,
      job_posting_id: jobPostingId,
      job_title: jobTitle,
    },
    priority: 'normal',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}

/**
 * Send notification when an interview is scheduled
 */
export async function notifyInterviewScheduled(params: {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  organizationId: string;
  interviewerId: string;
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
  actorId: string;
}) {
  const {
    interviewId,
    candidateId,
    candidateName,
    jobTitle,
    organizationId,
    interviewerId,
    scheduledAt,
    location,
    meetingLink,
    actorId,
  } = params;

  const locationText = location || meetingLink || 'TBD';

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: interviewerId,
    type: 'interview_scheduled',
    title: `Interview scheduled: ${candidateName}`,
    message: `Interview with ${candidateName} for ${jobTitle} on ${new Date(scheduledAt).toLocaleString()}`,
    resource_type: 'interview',
    resource_id: interviewId,
    actor_id: actorId,
    action_url: `/dashboard/recruitment/interviews/${interviewId}`,
    metadata: {
      candidate_id: candidateId,
      candidate_name: candidateName,
      job_title: jobTitle,
      scheduled_at: scheduledAt,
      location: locationText,
      meeting_link: meetingLink,
    },
    priority: 'high',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send interview reminder (1 hour before)
 */
export async function notifyInterviewReminder(params: {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  organizationId: string;
  interviewerId: string;
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
}) {
  const {
    interviewId,
    candidateId,
    candidateName,
    organizationId,
    interviewerId,
    scheduledAt,
    location,
    meetingLink,
  } = params;

  const locationText = location || meetingLink || 'TBD';

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: interviewerId,
    type: 'interview_reminder',
    title: `Interview in 1 hour: ${candidateName}`,
    message: `Your interview with ${candidateName} starts in 1 hour at ${locationText}`,
    resource_type: 'interview',
    resource_id: interviewId,
    action_url: `/dashboard/recruitment/interviews/${interviewId}`,
    metadata: {
      candidate_id: candidateId,
      candidate_name: candidateName,
      scheduled_at: scheduledAt,
      location: locationText,
      meeting_link: meetingLink,
    },
    priority: 'urgent',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send notification when candidate status changes
 */
export async function notifyCandidateStatusChanged(params: {
  candidateId: string;
  candidateName: string;
  oldStatus: string;
  newStatus: string;
  organizationId: string;
  actorId: string;
  recipientIds: string[];
}) {
  const { candidateId, candidateName, oldStatus, newStatus, organizationId, actorId, recipientIds } =
    params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'candidate_status_changed',
    title: `Candidate status updated: ${candidateName}`,
    message: `${candidateName}'s status changed from ${oldStatus} to ${newStatus}`,
    resource_type: 'candidate',
    resource_id: candidateId,
    actor_id: actorId,
    action_url: `/dashboard/recruitment/candidates/${candidateId}`,
    metadata: {
      candidate_name: candidateName,
      old_status: oldStatus,
      new_status: newStatus,
    },
    priority: newStatus === 'offer' || newStatus === 'hired' ? 'high' : 'normal',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}
