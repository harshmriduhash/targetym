'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizationOptions {
  /**
   * Total number of items
   */
  itemCount: number;

  /**
   * Height of each item in pixels
   */
  itemHeight: number;

  /**
   * Height of the container viewport in pixels
   */
  containerHeight: number;

  /**
   * Number of items to render outside viewport (buffer)
   */
  overscan?: number;
}

interface VirtualizationResult {
  /**
   * Virtual items to render
   */
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    size: number;
  }>;

  /**
   * Total height of all items
   */
  totalHeight: number;

  /**
   * Offset from top
   */
  offsetTop: number;

  /**
   * Scroll handler to attach to container
   */
  onScroll: (event: React.UIEvent<HTMLElement>) => void;
}

/**
 * Virtualization hook for rendering large lists efficiently
 * Only renders items visible in the viewport + overscan buffer
 *
 * @example
 * const { virtualItems, totalHeight, offsetTop, onScroll } = useVirtualization({
 *   itemCount: 10000,
 *   itemHeight: 50,
 *   containerHeight: 600,
 *   overscan: 5
 * });
 *
 * <div style={{ height: containerHeight, overflow: 'auto' }} onScroll={onScroll}>
 *   <div style={{ height: totalHeight, position: 'relative' }}>
 *     {virtualItems.map(virtualItem => (
 *       <div
 *         key={virtualItem.index}
 *         style={{
 *           position: 'absolute',
 *           top: virtualItem.start,
 *           height: virtualItem.size,
 *           width: '100%'
 *         }}
 *       >
 *         {items[virtualItem.index]}
 *       </div>
 *     ))}
 *   </div>
 * </div>
 */
export function useVirtualization({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualizationOptions): VirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = itemCount * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        size: itemHeight,
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return {
    virtualItems,
    totalHeight,
    offsetTop: startIndex * itemHeight,
    onScroll,
  };
}

/**
 * Simple windowing hook for rendering only visible items
 */
export function useWindowing<T>(
  items: T[],
  windowSize: number = 50
): {
  visibleItems: T[];
  loadMore: () => void;
  hasMore: boolean;
} {
  const [visibleCount, setVisibleCount] = useState(windowSize);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + windowSize, items.length));
  };

  const hasMore = visibleCount < items.length;

  return { visibleItems, loadMore, hasMore };
}

/**
 * Infinite scroll hook
 */
export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 0.8, enabled = true } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current && currentTarget) {
        observerRef.current.unobserve(currentTarget);
      }
    };
  }, [callback, threshold, enabled]);

  return targetRef;
}
