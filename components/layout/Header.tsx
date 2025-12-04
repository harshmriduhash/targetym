'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, RefreshCw, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps = {}) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(3); // Mock notifications count

  // Initialize time only on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 md:px-6">
      {/* Mobile Menu Button + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Here..."
            className="pl-10 bg-muted/50 text-sm"
          />
        </div>
      </div>

      {/* Center - Date & Time */}
      <div className="hidden md:flex items-center gap-2 text-sm font-medium">
        {currentTime ? (
          <>
            <span>{formatDate(currentTime)}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-primary">{formatTime(currentTime)}</span>
          </>
        ) : (
          <span className="text-muted-foreground">--:-- --</span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* Theme Toggle - Hidden on mobile */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Refresh Button - Hidden on mobile */}
        <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Sync Status - Hidden on mobile */}
        <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 text-green-600">
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <div className="p-2 font-semibold border-b text-sm">Notifications</div>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New leave request</p>
                <p className="text-xs text-muted-foreground">John Doe requested 3 days off</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Interview scheduled</p>
                <p className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Performance review due</p>
                <p className="text-xs text-muted-foreground">3 reviews pending</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
