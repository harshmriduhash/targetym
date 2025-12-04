'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  /**
   * Show toast notification on error
   */
  showToast?: boolean;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Log to console
   */
  logToConsole?: boolean;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  handleError: (error: Error, options?: ErrorHandlerOptions) => void;
  clearError: () => void;
  isError: boolean;
}

/**
 * Hook for handling errors in functional components
 *
 * @example
 * const { handleError, error, clearError } = useErrorHandler();
 *
 * try {
 *   await fetchData();
 * } catch (err) {
 *   handleError(err as Error, {
 *     showToast: true,
 *     message: "Impossible de charger les données"
 *   });
 * }
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((
    error: Error,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      message,
      logToConsole = process.env.NODE_ENV === 'development',
      onError,
    } = options;

    setError(error);

    // Log to console
    if (logToConsole) {
      console.error('Error handled:', error);
    }

    // Show toast notification
    if (showToast) {
      toast.error(message || error.message || 'Une erreur est survenue', {
        description: process.env.NODE_ENV === 'development' ? error.stack?.split('\n')[0] : undefined,
      });
    }

    // Call custom error handler
    onError?.(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    isError: error !== null,
  };
}

/**
 * Hook for wrapping async functions with error handling
 *
 * @example
 * const fetchUsers = useAsyncError(async () => {
 *   const response = await fetch('/api/users');
 *   return response.json();
 * });
 *
 * await fetchUsers(); // Errors are automatically caught and handled
 */
export function useAsyncError<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: ErrorHandlerOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  const { handleError } = useErrorHandler();

  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        handleError(error as Error, options);
        return undefined;
      }
    },
    [asyncFunction, handleError, options]
  );
}

/**
 * Global error handler for unhandled promise rejections
 * Call this in your root layout or app component
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    toast.error('Une erreur inattendue est survenue', {
      description: process.env.NODE_ENV === 'development'
        ? String(event.reason)
        : undefined,
    });
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
}
