'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Stable callback that never changes reference but always uses latest values
 * Prevents unnecessary re-renders of child components
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Throttled callback to limit execution frequency
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Memoized event handler that prevents re-creation on each render
 */
export function useEventCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  const stableCallback = useRef<T>();

  useEffect(() => {
    callbackRef.current = callback;
  });

  if (!stableCallback.current) {
    stableCallback.current = ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T;
  }

  return stableCallback.current;
}

/**
 * Callback with automatic cleanup
 */
export function useCallbackWithCleanup<T extends (...args: any[]) => any>(
  callback: T,
  cleanup?: () => void
): T {
  const cleanupRef = useRef(cleanup);

  useEffect(() => {
    cleanupRef.current = cleanup;
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return useStableCallback(callback);
}
