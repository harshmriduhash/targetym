
import { notificationsService } from '@/src/lib/services/notifications.service';
import type { CreateNotificationInput } from '@/src/types/notifications.types';

// ============================================================================
// Goals Notification Helpers
// ============================================================================

/**
 * Send notification when a goal is created
 */
export async function notifyGoalCreated(params: {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
  organizationId: string;
  ownerId: string;
  actorId: string;
  recipientIds: string[];
}) {
  const { goalId, goalTitle, goalDescription, organizationId, actorId, recipientIds } = params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'goal_created',
    title: `New goal created: ${goalTitle}`,
    message: `A new goal "${goalTitle}" has been created`,
    resource_type: 'goal',
    resource_id: goalId,
    actor_id: actorId,
    action_url: `/dashboard/goals/${goalId}`,
    metadata: {
      goal_title: goalTitle,
      goal_description: goalDescription,
    },
    priority: 'normal',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}

/**
 * Send notification when a goal is updated
 */
export async function notifyGoalUpdated(params: {
  goalId: string;
  goalTitle: string;
  organizationId: string;
  actorId: string;
  recipientIds: string[];
  changes?: string[];
}) {
  const { goalId, goalTitle, organizationId, actorId, recipientIds, changes } = params;

  const changesText = changes && changes.length > 0 ? ` (${changes.join(', ')})` : '';

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'goal_updated',
    title: `Goal updated: ${goalTitle}`,
    message: `The goal "${goalTitle}" has been updated${changesText}`,
    resource_type: 'goal',
    resource_id: goalId,
    actor_id: actorId,
    action_url: `/dashboard/goals/${goalId}`,
    metadata: {
      goal_title: goalTitle,
      changes: changes || [],
    },
    priority: 'normal',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}

/**
 * Send notification when a goal is completed
 */
export async function notifyGoalCompleted(params: {
  goalId: string;
  goalTitle: string;
  organizationId: string;
  actorId: string;
  recipientIds: string[];
}) {
  const { goalId, goalTitle, organizationId, actorId, recipientIds } = params;

  const notificationData: Omit<CreateNotificationInput, 'recipient_id'> = {
    organization_id: organizationId,
    type: 'goal_completed',
    title: `Goal completed: ${goalTitle}`,
    message: `The goal "${goalTitle}" has been marked as completed`,
    resource_type: 'goal',
    resource_id: goalId,
    actor_id: actorId,
    action_url: `/dashboard/goals/${goalId}`,
    metadata: {
      goal_title: goalTitle,
    },
    priority: 'high',
  };

  return await notificationsService.createBulkNotifications({
    recipient_ids: recipientIds,
    notification: notificationData,
  });
}

/**
 * Send notification when someone is added as a collaborator
 */
export async function notifyGoalCollaboratorAdded(params: {
  goalId: string;
  goalTitle: string;
  organizationId: string;
  actorId: string;
  recipientId: string;
  role: string;
}) {
  const { goalId, goalTitle, organizationId, actorId, recipientId, role } = params;

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: recipientId,
    type: 'goal_assigned',
    title: `You were added to: ${goalTitle}`,
    message: `You have been added as a ${role} on the goal "${goalTitle}"`,
    resource_type: 'goal',
    resource_id: goalId,
    actor_id: actorId,
    action_url: `/dashboard/goals/${goalId}`,
    metadata: {
      goal_title: goalTitle,
      role: role,
    },
    priority: 'high',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Send notification when a goal deadline is approaching
 */
export async function notifyGoalDeadlineApproaching(params: {
  goalId: string;
  goalTitle: string;
  organizationId: string;
  ownerId: string;
  daysRemaining: number;
  endDate: string;
}) {
  const { goalId, goalTitle, organizationId, ownerId, daysRemaining, endDate } = params;

  const notificationData: CreateNotificationInput = {
    organization_id: organizationId,
    recipient_id: ownerId,
    type: 'goal_deadline_approaching',
    title: `Goal deadline approaching: ${goalTitle}`,
    message: `The goal "${goalTitle}" is due in ${daysRemaining} days (${endDate})`,
    resource_type: 'goal',
    resource_id: goalId,
    action_url: `/dashboard/goals/${goalId}`,
    metadata: {
      goal_title: goalTitle,
      days_remaining: daysRemaining,
      end_date: endDate,
    },
    priority: daysRemaining <= 3 ? 'urgent' : 'high',
  };

  return await notificationsService.createNotification(notificationData);
}

/**
 * Get recipients for goal notifications
 * Returns owner + collaborators + manager
 */
export async function getGoalNotificationRecipients(params: {
  ownerId: string;
  collaboratorIds?: string[];
  managerId?: string;
  excludeActorId?: string;
}): Promise<string[]> {
  const { ownerId, collaboratorIds = [], managerId, excludeActorId } = params;

  const recipients = new Set<string>();

  // Add owner
  recipients.add(ownerId);

  // Add collaborators
  collaboratorIds.forEach((id) => recipients.add(id));

  // Add manager if exists
  if (managerId) {
    recipients.add(managerId);
  }

  // Remove actor (person who triggered the action)
  if (excludeActorId) {
    recipients.delete(excludeActorId);
  }

  return Array.from(recipients);
}
