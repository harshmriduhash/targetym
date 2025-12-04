import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container (e.g., modal, dialog)
 * Ensures keyboard navigation stays within the modal - WCAG 2.1 compliant
 * @param isActive - Whether the focus trap should be active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(getFocusableElements());
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Store the previously focused element
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Generate unique IDs for ARIA attributes
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
let idCounter = 0;
export function useUniqueId(prefix = 'id'): string {
  const idRef = useRef<string>();

  if (!idRef.current) {
    idCounter += 1;
    idRef.current = `${prefix}-${idCounter}`;
  }

  return idRef.current;
}

/**
 * Hook to handle Escape key press
 * @param callback - Function to call when Escape is pressed
 * @param isActive - Whether the handler should be active
 */
export function useEscapeKey(callback: () => void, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [callback, isActive]);
}

/**
 * Hook to lock body scroll (for modals)
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll and add padding to prevent layout shift
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden but accessible
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Legacy compatibility exports
export const AccessibilityUtils = {
  useFocusTrap,
  generateAriaId: (prefix = 'a11y') => `${prefix}-${Math.random().toString(36).substring(2, 11)}`,
  enhanceFormAccessibility: (inputProps: any, errorMessage?: string) => {
    const errorId = errorMessage ? useUniqueId('error') : undefined;
    return {
      ...inputProps,
      'aria-invalid': !!errorMessage,
      'aria-describedby': errorId,
      ...(errorId && { 'aria-errormessage': errorId }),
    };
  },
};
