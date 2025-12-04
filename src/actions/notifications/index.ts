'use server';

import { createClient } from '@/src/lib/supabase/server';
import { notificationsService } from '@/src/lib/services/notifications.service';
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response';
import { handleServiceError } from '@/src/lib/utils/errors';
import type {
  NotificationFilters,
  NotificationQueryResult,
  NotificationStats,
  Notification,
} from '@/src/types/notifications.types';

// ============================================================================
// Get Notifications
// ============================================================================

export async function getNotifications(
  filters: NotificationFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResponse<NotificationQueryResult>> {
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

    const result = await notificationsService.getNotifications(user.id, filters, page, pageSize);

    return successResponse(result);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Get Notification by ID
// ============================================================================

export async function getNotificationById(
  notificationId: string
): Promise<ActionResponse<Notification>> {
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

    const notification = await notificationsService.getNotificationById(notificationId);

    // Verify user owns this notification
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    return successResponse(notification);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Mark Notification as Read
// ============================================================================

export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResponse<Notification>> {
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

    // Verify ownership before updating
    const notification = await notificationsService.getNotificationById(notificationId);
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    const updated = await notificationsService.markAsRead(notificationId);

    return successResponse(updated);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Mark Notification as Unread
// ============================================================================

export async function markNotificationAsUnread(
  notificationId: string
): Promise<ActionResponse<Notification>> {
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

    // Verify ownership before updating
    const notification = await notificationsService.getNotificationById(notificationId);
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    const updated = await notificationsService.markAsUnread(notificationId);

    return successResponse(updated);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Mark All Notifications as Read
// ============================================================================

export async function markAllNotificationsAsRead(): Promise<ActionResponse<{ count: number }>> {
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

    const count = await notificationsService.markAllAsRead(user.id);

    return successResponse({ count });
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Archive Notification
// ============================================================================

export async function archiveNotification(
  notificationId: string
): Promise<ActionResponse<Notification>> {
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

    // Verify ownership before updating
    const notification = await notificationsService.getNotificationById(notificationId);
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    const updated = await notificationsService.archiveNotification(notificationId);

    return successResponse(updated);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Unarchive Notification
// ============================================================================

export async function unarchiveNotification(
  notificationId: string
): Promise<ActionResponse<Notification>> {
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

    // Verify ownership before updating
    const notification = await notificationsService.getNotificationById(notificationId);
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    const updated = await notificationsService.unarchiveNotification(notificationId);

    return successResponse(updated);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Delete Notification
// ============================================================================

export async function deleteNotification(
  notificationId: string
): Promise<ActionResponse<{ success: boolean }>> {
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

    // Verify ownership before deleting
    const notification = await notificationsService.getNotificationById(notificationId);
    if (notification.recipient_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN');
    }

    await notificationsService.deleteNotification(notificationId);

    return successResponse({ success: true });
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Get Notification Stats
// ============================================================================

export async function getNotificationStats(): Promise<ActionResponse<NotificationStats>> {
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

    const stats = await notificationsService.getNotificationStats(user.id);

    return successResponse(stats);
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}

// ============================================================================
// Get Unread Count
// ============================================================================

export async function getUnreadNotificationCount(): Promise<ActionResponse<{ count: number }>> {
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

    const count = await notificationsService.getUnreadCount(user.id);

    return successResponse({ count });
  } catch (error) {
    const appError = handleServiceError(error);
    return errorResponse(appError.message, appError.code);
  }
  })
}
