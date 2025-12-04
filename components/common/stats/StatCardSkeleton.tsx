'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardSkeletonProps {
  className?: string;
}

function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-32 mt-1" />
      </CardContent>
    </Card>
  );
}

export default memo(StatCardSkeleton);
