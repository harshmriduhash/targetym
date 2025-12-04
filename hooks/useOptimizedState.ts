'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Optimized setState that prevents unnecessary re-renders
 * Only updates if the value has actually changed (deep equality check)
 */
export function useOptimizedState<T>(
  initialValue: T
): [T, (newValue: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const nextState = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;

      // Deep equality check
      if (JSON.stringify(nextState) === JSON.stringify(prevState)) {
        return prevState; // Prevent re-render
      }

      return nextState;
    });
  }, []);

  return [state, setOptimizedState];
}

/**
 * Batched state updates to reduce re-renders
 */
export function useBatchedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Array<(prev: T) => T>>([]);

  const setBatchedState = useCallback((updater: (prev: T) => T) => {
    pendingUpdatesRef.current.push(updater);

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(() => {
      setState((prevState) => {
        let newState = prevState;
        pendingUpdatesRef.current.forEach((update) => {
          newState = update(newState);
        });
        pendingUpdatesRef.current = [];
        return newState;
      });
    }, 16); // ~60fps
  }, []);

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return [state, setBatchedState] as const;
}

/**
 * Lazy initialization for expensive initial state
 */
export function useLazyState<T>(
  initializer: () => T
): [T, (newValue: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initializer);
  return [state, setState];
}

/**
 * State with previous value tracking
 */
export function useStateWithPrevious<T>(
  initialValue: T
): [T, T | undefined, (newValue: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const previousRef = useRef<T | undefined>(undefined);

  const setStateWithPrevious = useCallback((newValue: T | ((prev: T) => T)) => {
    setState((prevState) => {
      previousRef.current = prevState;
      return typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;
    });
  }, []);

  return [state, previousRef.current, setStateWithPrevious];
}
