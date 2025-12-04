'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface FilterLayoutProps {
  search?: React.ReactNode;
  filters?: React.ReactNode[];
  className?: string;
}

function FilterLayout({
  search,
  filters = [],
  className,
}: FilterLayoutProps) {
  const filterCount = filters.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar - Full Width */}
      {search && (
        <div className="w-full">
          {search}
        </div>
      )}

      {/* Filter Selects - Grid Layout */}
      {filters.length > 0 && (
        <div className={cn(
          "grid gap-4",
          filterCount === 1 && "grid-cols-1",
          filterCount === 2 && "grid-cols-1 sm:grid-cols-2",
          filterCount === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          filterCount >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {filters.map((filter, index) => (
            <div key={index}>
              {filter}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(FilterLayout);
