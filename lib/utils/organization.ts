import { ORGANIZATION_SIZE_LABELS, INDUSTRY_LABELS } from '@/lib/constants/organization';

/**
 * Get organization size label
 */
export function getOrganizationSizeLabel(size: string): string {
  return ORGANIZATION_SIZE_LABELS[size] || size;
}

/**
 * Get industry label
 */
export function getIndustryLabel(industry: string): string {
  return INDUSTRY_LABELS[industry] || industry;
}

/**
 * Format organization name with legal form
 */
export function formatOrganizationName(name: string, legalForm?: string): string {
  if (!legalForm) return name;
  return `${name} (${legalForm})`;
}

/**
 * Validate SIRET number (French)
 */
export function isValidSiret(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Format SIRET number with spaces
 */
export function formatSiret(siret: string): string {
  const cleaned = siret.replace(/\s/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
}

/**
 * Calculate organization age in years
 */
export function getOrganizationAge(foundedDate: string): number {
  const founded = new Date(foundedDate);
  const now = new Date();
  const years = now.getFullYear() - founded.getFullYear();
  const monthDiff = now.getMonth() - founded.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < founded.getDate())) {
    return years - 1;
  }
  return years;
}

/**
 * Format organization settings for display
 */
export function formatOrganizationSettings(settings: Record<string, any>): string {
  const parts: string[] = [];

  if (settings.timezone) parts.push(`Fuseau: ${settings.timezone}`);
  if (settings.currency) parts.push(`Devise: ${settings.currency}`);
  if (settings.language) parts.push(`Langue: ${settings.language}`);

  return parts.join(' • ');
}
