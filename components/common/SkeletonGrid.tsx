'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid wrapper for displaying skeleton loaders
 * @param count - Number of skeleton items to display (default: 6)
 * @param columns - Number of columns in grid (default: 3)
 * @param children - Skeleton component to repeat
 * @param className - Additional CSS classes
 */
function SkeletonGrid({
  count = 6,
  columns = 3,
  children,
  className
}: SkeletonGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{children}</React.Fragment>
      ))}
    </div>
  );
}

export default memo(SkeletonGrid);
