'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Targetym AI
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu with Sign Out */}
          {mounted && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
