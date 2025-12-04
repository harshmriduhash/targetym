import { DEPARTMENT_LABELS } from '@/lib/constants/departments';

/**
 * Get initials from a full name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '??';

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get department label in French
 * @param dept - Department code
 * @returns French label
 */
export function getDepartmentLabel(dept: string): string {
  return DEPARTMENT_LABELS[dept] || dept;
}

/**
 * Get pluralized text based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized text
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count > 1 ? (plural || `${singular}s`) : singular;
}

/**
 * Format member count text
 * @param count - Number of members
 * @returns Formatted text (e.g., "5 membres", "1 membre")
 */
export function formatMemberCount(count: number): string {
  return `${count} ${pluralize(count, 'membre')}`;
}

/**
 * Format direct reports text
 * @param count - Number of direct reports
 * @returns Formatted text
 */
export function formatDirectReports(count: number): string {
  return `${count} ${pluralize(count, 'collaborateur')} ${pluralize(count, 'direct')}`;
}
