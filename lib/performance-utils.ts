import { useCallback, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

// Memoization helper
export function memoize<T extends Function>(fn: T): T {
  const cache = new Map();
  return function(this: any, ...args: any[]) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }
    return cache.get(key);
  } as T;
}

// Debounce hook
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T, 
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

// Lazy loading with viewport detection
export function useLazyLoad(options = {}) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  });

  return { ref, inView };
}

// Performance-aware memo wrapper
export function performanceMemo<T>(
  factory: () => T, 
  dependencies: any[]
): T {
  const memoizedValue = useMemo(factory, dependencies);

  // Optional: Performance tracking
  if (process.env.NODE_ENV === 'development') {
    console.time('Memo Computation');
    const result = memoizedValue;
    console.timeEnd('Memo Computation');
    return result;
  }

  return memoizedValue;
}

// Re-render prevention helper
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, []);
}
