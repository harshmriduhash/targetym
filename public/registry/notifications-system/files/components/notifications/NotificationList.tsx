'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Trash2, Archive, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  archiveNotification,
} from '@/src/actions/notifications';
import type { Notification } from '@/src/types/notifications.types';
import { cn } from '@/src/lib/utils';

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const result = await getNotifications({ is_archived: false }, 1, 20);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await markNotificationAsRead(notificationId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsAsRead();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark all as read: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await deleteNotification(notificationId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await archiveNotification(notificationId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification archived');
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive: ${error.message}`);
    },
  });

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose?.();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        Failed to load notifications
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-3 w-3" />
            Mark all as read
          </Button>
        </div>
      )}

      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer',
              !notification.is_read && 'bg-muted/30'
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              {/* Actor Avatar or Icon */}
              <div className="flex-shrink-0">
                {notification.actor?.avatar_url ? (
                  <img
                    src={notification.actor.avatar_url}
                    alt={notification.actor.full_name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>

                  {notification.priority === 'high' && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      High
                    </Badge>
                  )}

                  {notification.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons (shown on hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsReadMutation.mutate(notification.id);
                  }}
                  disabled={markAsReadMutation.isPending}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  archiveMutation.mutate(notification.id);
                }}
                disabled={archiveMutation.isPending}
              >
                <Archive className="h-3 w-3" />
                <span className="sr-only">Archive</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(notification.id);
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {data && data.has_more && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              router.push('/dashboard/notifications');
              onClose?.();
            }}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
