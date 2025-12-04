
import { notificationsService } from '@/src/lib/services/notifications.service';
import type { CreateNotificationInput } from '@/src/types/notifications.types';

// ============================================================================
// Performance Notification Helpers
// ============================================================================

/**
 * Send notification when a performance review is due
 */
export async function notifyPerformanceReviewDue(params: {
  reviewId: string;
  revieweeId: string;
  revieweeName: string;
  reviewerId: string;
  organizationId: string;
  dueDate: string;
  reviewType: string;
}) {
  const { reviewId, revieweeId, revieweeName, reviewerId, organizationId, dueDate, reviewType } =
    params;

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: reviewerId,
    type: 'performance_review_due',
    title: `Performance review due: ${revieweeName}`,
    message: `${reviewType} performance review for ${revieweeName} is due on ${new Date(dueDate).toLocaleDateString()}`,
    resource_type: 'performance_review',
    resource_id: reviewId,
    action_url: `/dashboard/performance/reviews/${reviewId}`,
    metadata: {
      reviewee_id: revieweeId,
      reviewee_name: revieweeName,
      due_date: dueDate,
      review_type: reviewType,
    },
    priority: 'high',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send notification when a performance review is submitted
 */
export async function notifyPerformanceReviewSubmitted(params: {
  reviewId: string;
  revieweeId: string;
  revieweeName: string;
  reviewerId: string;
  organizationId: string;
  actorId: string;
  recipientIds: string[]; // Reviewee, HR, Manager
}) {
  const { reviewId, revieweeId, revieweeName, reviewerId, organizationId, actorId, recipientIds } =
    params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'performance_review_submitted',
    title: `Performance review submitted: ${revieweeName}`,
    message: `A performance review has been submitted for ${revieweeName}`,
    resource_type: 'performance_review',
    resource_id: reviewId,
    actor_id: actorId,
    action_url: `/dashboard/performance/reviews/${reviewId}`,
    metadata: {
      reviewee_id: revieweeId,
      reviewee_name: revieweeName,
      reviewer_id: reviewerId,
    },
    priority: 'high',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}

/**
 * Send notification when feedback is received
 */
export async function notifyFeedbackReceived(params: {
  feedbackId: string;
  recipientId: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  feedbackType: string;
  isAnonymous?: boolean;
}) {
  const { feedbackId, recipientId, organizationId, actorId, actorName, feedbackType, isAnonymous } =
    params;

  const fromText = isAnonymous ? 'Anonymous' : actorName;

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: recipientId,
    type: 'feedback_received',
    title: 'New feedback received',
    message: `You have received new ${feedbackType} feedback from ${fromText}`,
    resource_type: 'feedback',
    resource_id: feedbackId,
    actor_id: isAnonymous ? undefined : actorId,
    action_url: `/dashboard/performance/feedback/${feedbackId}`,
    metadata: {
      feedback_type: feedbackType,
      is_anonymous: isAnonymous || false,
      actor_name: fromText,
    },
    priority: 'normal',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send notification when peer feedback is requested
 */
export async function notifyPeerFeedbackRequested(params: {
  reviewId: string;
  revieweeId: string;
  revieweeName: string;
  organizationId: string;
  actorId: string;
  recipientId: string;
  dueDate?: string;
}) {
  const { reviewId, revieweeId, revieweeName, organizationId, actorId, recipientId, dueDate } =
    params;

  const dueDateText = dueDate ? ` by ${new Date(dueDate).toLocaleDateString()}` : '';

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: recipientId,
    type: 'peer_feedback_requested',
    title: `Feedback requested: ${revieweeName}`,
    message: `You have been asked to provide peer feedback for ${revieweeName}${dueDateText}`,
    resource_type: 'performance_review',
    resource_id: reviewId,
    actor_id: actorId,
    action_url: `/dashboard/performance/reviews/${reviewId}/peer-feedback`,
    metadata: {
      reviewee_id: revieweeId,
      reviewee_name: revieweeName,
      due_date: dueDate,
    },
    priority: 'high',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send notification to direct reports when manager makes an update
 */
export async function notifyDirectReportUpdate(params: {
  resourceType: string;
  resourceId: string;
  updateType: string;
  organizationId: string;
  managerId: string;
  managerName: string;
  directReportIds: string[];
  actionUrl: string;
}) {
  const {
    resourceType,
    resourceId,
    updateType,
    organizationId,
    managerId,
    managerName,
    directReportIds,
    actionUrl,
  } = params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'direct_report_update',
    title: `Update from your manager`,
    message: `${managerName} made an update: ${updateType}`,
    resource_type: resourceType as any,
    resource_id: resourceId,
    actor_id: managerId,
    action_url: actionUrl,
    metadata: {
      manager_name: managerName,
      update_type: updateType,
    },
    priority: 'normal',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: directReportIds,
    notification: notificationData,
  });
}
