/**
 * Accessibility Testing Utilities
 * Tools for automated WCAG compliance testing
 */

/**
 * Check color contrast ratio (WCAG 2.1 Level AA)
 * Normal text requires 4.5:1, large text requires 3:1
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    // Calculate relative luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 4.5 : 7;
  return ratio >= requiredRatio;
}

/**
 * Validate ARIA attributes
 */
export function validateARIA(element: HTMLElement): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for aria-label or aria-labelledby on interactive elements
  const role = element.getAttribute('role');
  const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab'];

  if (interactiveRoles.includes(role || '')) {
    const hasLabel =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim();

    if (!hasLabel) {
      errors.push(`Interactive element with role="${role}" is missing accessible label`);
    }
  }

  // Check for valid aria-labelledby references
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const referencedElement = document.getElementById(labelledBy);
    if (!referencedElement) {
      errors.push(`aria-labelledby references non-existent element: ${labelledBy}`);
    }
  }

  // Check for valid aria-describedby references
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const referencedElement = document.getElementById(describedBy);
    if (!referencedElement) {
      errors.push(`aria-describedby references non-existent element: ${describedBy}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if element has sufficient focus indicator
 */
export function hasFocusIndicator(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element, ':focus-visible');

  // Check for outline or box-shadow
  const hasOutline =
    styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none';
  const hasBoxShadow = styles.boxShadow !== 'none';
  const hasBorder =
    styles.borderWidth !== '0px' && styles.borderStyle !== 'none';

  return hasOutline || hasBoxShadow || hasBorder;
}

/**
 * Check keyboard accessibility
 */
export function isKeyboardAccessible(element: HTMLElement): {
  accessible: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex && parseInt(tabindex) > 0) {
    issues.push('Positive tabindex detected - may disrupt natural tab order');
  }

  // Check for click handlers without keyboard handlers
  const hasClickHandler = element.onclick !== null || element.getAttribute('onclick');
  const hasKeyboardHandler =
    element.onkeydown !== null ||
    element.onkeyup !== null ||
    element.getAttribute('onkeydown') ||
    element.getAttribute('onkeyup');

  if (hasClickHandler && !hasKeyboardHandler) {
    const role = element.getAttribute('role');
    const tag = element.tagName.toLowerCase();
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];

    if (!interactiveTags.includes(tag) && role !== 'button' && role !== 'link') {
      issues.push('Click handler present but no keyboard handler');
    }
  }

  // Check if focusable element is actually focusable
  const isFocusable =
    element.tabIndex >= 0 ||
    ['button', 'a', 'input', 'select', 'textarea'].includes(
      element.tagName.toLowerCase()
    );

  if (!isFocusable && element.onclick) {
    issues.push('Interactive element is not keyboard focusable');
  }

  return {
    accessible: issues.length === 0,
    issues,
  };
}

/**
 * Generate accessibility report for an element
 */
export interface AccessibilityReport {
  element: string;
  wcagAA: boolean;
  wcagAAA: boolean;
  aria: { valid: boolean; errors: string[] };
  focusIndicator: boolean;
  keyboard: { accessible: boolean; issues: string[] };
  score: number;
}

export function generateA11yReport(element: HTMLElement): AccessibilityReport {
  const report: AccessibilityReport = {
    element: element.tagName.toLowerCase(),
    wcagAA: true,
    wcagAAA: true,
    aria: validateARIA(element),
    focusIndicator: hasFocusIndicator(element),
    keyboard: isKeyboardAccessible(element),
    score: 0,
  };

  // Calculate score (0-100)
  let score = 100;
  if (!report.aria.valid) score -= 30;
  if (!report.focusIndicator) score -= 20;
  if (!report.keyboard.accessible) score -= 30;

  report.score = Math.max(0, score);

  return report;
}

/**
 * Scan entire page for accessibility issues
 */
export function scanPageAccessibility(): {
  totalElements: number;
  issuesFound: number;
  averageScore: number;
  reports: AccessibilityReport[];
} {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]'
  );

  const reports: AccessibilityReport[] = [];

  interactiveElements.forEach((element) => {
    const report = generateA11yReport(element as HTMLElement);
    reports.push(report);
  });

  const issuesFound = reports.filter((r) => r.score < 100).length;
  const averageScore =
    reports.reduce((sum, r) => sum + r.score, 0) / reports.length || 100;

  return {
    totalElements: interactiveElements.length,
    issuesFound,
    averageScore,
    reports,
  };
}
