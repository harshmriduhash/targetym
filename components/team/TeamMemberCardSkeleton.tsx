'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function TeamMemberCardSkeleton() {
  return (
    <Card className="transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar skeleton */}
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />

          <div className="flex-1 min-w-0 space-y-3">
            {/* Header skeleton */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            {/* Contact info skeleton */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </div>
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
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Badges skeleton */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TeamMemberCardSkeleton);
