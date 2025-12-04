'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLoadingStateOptions {
  /**
   * Minimum loading duration in milliseconds
   * Ensures skeleton is visible long enough to avoid flickering
   */
  minDuration?: number;

  /**
   * Initial loading state
   */
  initialLoading?: boolean;
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Hook to manage loading state with minimum duration
 * Prevents skeleton flicker by enforcing minimum display time
 *
 * @example
 * const { isLoading, startLoading, stopLoading } = useLoadingState({ minDuration: 500 });
 *
 * useEffect(() => {
 *   startLoading();
 *   fetchData().finally(() => stopLoading());
 * }, []);
 */
export function useLoadingState(
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn {
  const { minDuration = 300, initialLoading = false } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingStartTime(Date.now());
  }, []);

  const stopLoading = useCallback(() => {
    if (loadingStartTime === null) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - loadingStartTime;
    const remaining = minDuration - elapsed;

    if (remaining > 0) {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remaining);
    } else {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, [loadingStartTime, minDuration]);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      setLoadingStartTime(null);
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
  };
}
