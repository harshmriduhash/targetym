'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentCardSkeletonProps {
  variant?: 'default' | 'compact' | 'detailed';
}

function ContentCardSkeleton({ variant = 'default' }: ContentCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <Card className="transition-all duration-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 pt-2 border-t">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="transition-all duration-200">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="transition-all duration-200">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(ContentCardSkeleton);
