'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Target,
  Briefcase,
  TrendingUp,
  Clock,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Shield,
  BookOpen,
  Menu,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Leaves', href: '/dashboard/leaves', icon: Calendar },
  { label: 'Goals & OKRs', href: '/dashboard/goals', icon: Target },
  { label: 'Recruitment', href: '/dashboard/recruitment', icon: Briefcase },
  { label: 'Performance', href: '/dashboard/performance', icon: TrendingUp },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Notice', href: '/dashboard/notices', icon: Bell },
  { label: 'Form Entries', href: '/dashboard/forms', icon: FileText },
  { label: 'Info Portal', href: '/dashboard/portal', icon: BookOpen },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Security', href: '/dashboard/security', icon: Shield },
  { label: 'Help Centre', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen border-r border-border bg-background transition-all duration-300',
        // Mobile: drawer from left
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop: responsive width
        isCollapsed ? 'w-16 lg:w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Targetym"
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <Image
              src="/logo.png"
              alt="Targetym"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </Link>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileClose?.()}
            >
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-[#4C6FFF] text-white hover:bg-[#4C6FFF]/90',
                  !isActive && 'text-muted-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Theme Toggle */}
      <div className="border-t border-border p-4 space-y-2">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
