'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  className
}: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-normal transition-shadow hover-scale-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4 transition-fast transition-colors', iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={cn('text-2xl font-bold transition-fast transition-colors', iconColor)}>{value}</div>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium transition-fast transition-colors',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(StatCard);
