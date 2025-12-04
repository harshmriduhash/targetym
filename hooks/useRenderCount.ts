'use client';

import { useRef, useEffect } from 'react';

/**
 * Hook to track component render count (development only)
 * Useful for debugging unnecessary re-renders
 *
 * @example
 * function MyComponent() {
 *   useRenderCount('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderCount(componentName: string = 'Component'): number {
  const renderCount = useRef(0);

  renderCount.current += 1;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
  }

  return renderCount.current;
}

/**
 * Hook to track why a component re-rendered
 * Logs which props/state changed between renders
 *
 * @example
 * function MyComponent({ user, count }) {
 *   useWhyDidYouUpdate('MyComponent', { user, count });
 *   return <div>...</div>;
 * }
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, any>
): void {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[WhyDidYouUpdate] ${componentName}:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Hook to measure component render time
 *
 * @example
 * function MyComponent() {
 *   useRenderTime('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderTime(componentName: string = 'Component'): void {
  const renderStart = useRef<number>(0);

  // Start timing before render
  renderStart.current = performance.now();

  useEffect(() => {
    // Measure after render is committed
    const renderTime = performance.now() - renderStart.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[RenderTime] ${componentName}: ${renderTime.toFixed(2)}ms`);

      // Warn about slow renders
      if (renderTime > 16.67) {
        // 60fps threshold
        console.warn(
          `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (> 16.67ms for 60fps)`
        );
      }
    }
  });
}

/**
 * Performance monitoring hook
 * Tracks renders, time, and memory usage
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderStart = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  renderCount.current += 1;
  renderStart.current = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    renderTimes.current.push(renderTime);

    // Keep only last 100 renders
    if (renderTimes.current.length > 100) {
      renderTimes.current.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      const avgRenderTime =
        renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

      console.group(`[Performance] ${componentName}`);
      console.log(`Render Count: ${renderCount.current}`);
      console.log(`Last Render: ${renderTime.toFixed(2)}ms`);
      console.log(`Avg Render: ${avgRenderTime.toFixed(2)}ms`);

      // Memory usage (if available)
      if (performance.memory) {
        const usedJSHeapSize = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        console.log(`Memory Used: ${usedJSHeapSize}MB`);
      }

      console.groupEnd();
    }
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime:
      renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length,
  };
}
