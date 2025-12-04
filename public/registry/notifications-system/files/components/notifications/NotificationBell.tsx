'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationList } from './NotificationList';
import { getUnreadNotificationCount } from '@/src/actions/notifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const result = await getUnreadNotificationCount();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error.message);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <NotificationList onClose={() => setIsOpen(false)} />
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
