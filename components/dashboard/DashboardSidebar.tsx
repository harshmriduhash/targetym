'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  UserPlus,
  TrendingUp,
  GraduationCap,
  BrainCircuit,
  Briefcase,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Objectifs & OKRs',
    href: '/dashboard/goals',
    icon: Target,
    badge: 'Core',
  },
  {
    title: 'Recrutement',
    href: '/dashboard/recruitment',
    icon: UserPlus,
    badge: 'Core',
  },
  {
    title: 'Carrière & Talents',
    href: '/dashboard/career',
    icon: Briefcase,
    badge: 'Core',
  },
  {
    title: 'Formation & Développement',
    href: '/dashboard/learning',
    icon: GraduationCap,
    badge: 'Core',
  },
  {
    title: 'Performance',
    href: '/dashboard/performance',
    icon: TrendingUp,
    badge: 'Core',
  },
  {
    title: 'People Analytics',
    href: '/dashboard/analytics',
    icon: BrainCircuit,
    badge: 'IA',
    subItems: [
      { title: 'Vue d\'ensemble', href: '/dashboard/analytics/overview', locked: true },
      { title: 'Insights IA', href: '/dashboard/analytics/ai-insights', locked: true },
      { title: 'Risque de turnover', href: '/dashboard/analytics/turnover-risk', locked: true },
      { title: 'Inventaire des compétences', href: '/dashboard/analytics/skills-inventory', locked: true },
    ],
  },
  {
    title: 'Équipe',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Organisation',
    href: '/dashboard/organization',
    icon: Building2,
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs font-semibold rounded',
                      item.badge === 'Nouveau' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                      item.badge === 'IA' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                      item.badge === 'Core' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub-items */}
              {item.subItems && isActive && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-3">
                  {item.subItems.map((subItem: any) => {
                    const isSubActive = pathname === subItem.href;
                    const isLocked = subItem.locked;

                    if (isLocked) {
                      return (
                        <div
                          key={subItem.href}
                          className="flex items-center justify-between px-3 py-1.5 rounded text-xs text-muted-foreground cursor-not-allowed opacity-60"
                        >
                          <span>{subItem.title}</span>
                          <Lock className="h-3 w-3" />
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'block px-3 py-1.5 rounded text-xs transition-colors',
                          isSubActive
                            ? 'text-primary font-medium bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
