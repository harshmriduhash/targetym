'use client';

import React, { memo, useRef } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  /**
   * Array of items to render
   */
  items: T[];

  /**
   * Height of each item in pixels
   */
  itemHeight: number;

  /**
   * Height of the container viewport
   */
  height: number;

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Number of items to render outside viewport
   */
  overscan?: number;

  /**
   * Optional className for the container
   */
  className?: string;

  /**
   * Optional className for each item wrapper
   */
  itemClassName?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state component
   */
  emptyState?: React.ReactNode;
}

/**
 * Virtual list component for efficiently rendering large lists
 *
 * @example
 * <VirtualList
 *   items={users}
 *   itemHeight={80}
 *   height={600}
 *   renderItem={(user, index) => <UserCard key={user.id} user={user} />}
 * />
 */
function VirtualListComponent<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className,
  itemClassName,
  isLoading = false,
  emptyState,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, onScroll } = useVirtualization({
    itemCount: items.length,
    itemHeight,
    containerHeight: height,
    overscan,
  });

  if (!isLoading && items.length === 0 && emptyState) {
    return <div className={cn('flex items-center justify-center', className)}>{emptyState}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.index}
              className={cn('absolute left-0 right-0', itemClassName)}
              style={{
                top: virtualItem.start,
                height: virtualItem.size,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent;
