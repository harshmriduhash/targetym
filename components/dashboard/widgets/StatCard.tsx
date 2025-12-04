'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, suffix = '', className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-xl border border-border p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-1.5">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              {value}
              {suffix && <span className="text-sm sm:text-base text-muted-foreground">{suffix}</span>}
            </h3>
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
