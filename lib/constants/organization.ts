export const ORGANIZATION_SIZE = {
  SMALL: '1-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  ENTERPRISE: '201-1000',
  CORPORATION: '1000+',
} as const;

export const INDUSTRY_TYPES = {
  TECHNOLOGY: 'technology',
  HEALTHCARE: 'healthcare',
  FINANCE: 'finance',
  EDUCATION: 'education',
  RETAIL: 'retail',
  MANUFACTURING: 'manufacturing',
  SERVICES: 'services',
  CONSULTING: 'consulting',
  OTHER: 'other',
} as const;

export const ORGANIZATION_SIZE_LABELS: Record<string, string> = {
  [ORGANIZATION_SIZE.SMALL]: '1-10 employés',
  [ORGANIZATION_SIZE.MEDIUM]: '11-50 employés',
  [ORGANIZATION_SIZE.LARGE]: '51-200 employés',
  [ORGANIZATION_SIZE.ENTERPRISE]: '201-1000 employés',
  [ORGANIZATION_SIZE.CORPORATION]: '1000+ employés',
} as const;

export const INDUSTRY_LABELS: Record<string, string> = {
  [INDUSTRY_TYPES.TECHNOLOGY]: 'Technologie',
  [INDUSTRY_TYPES.HEALTHCARE]: 'Santé',
  [INDUSTRY_TYPES.FINANCE]: 'Finance',
  [INDUSTRY_TYPES.EDUCATION]: 'Éducation',
  [INDUSTRY_TYPES.RETAIL]: 'Commerce',
  [INDUSTRY_TYPES.MANUFACTURING]: 'Industrie',
  [INDUSTRY_TYPES.SERVICES]: 'Services',
  [INDUSTRY_TYPES.CONSULTING]: 'Consulting',
  [INDUSTRY_TYPES.OTHER]: 'Autre',
} as const;

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+11)' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: '€ Euro (EUR)', symbol: '€' },
  { value: 'USD', label: '$ Dollar US (USD)', symbol: '$' },
  { value: 'GBP', label: '£ Livre Sterling (GBP)', symbol: '£' },
  { value: 'JPY', label: '¥ Yen (JPY)', symbol: '¥' },
  { value: 'CNY', label: '¥ Yuan (CNY)', symbol: '¥' },
  { value: 'CAD', label: '$ Dollar Canadien (CAD)', symbol: 'C$' },
  { value: 'AUD', label: '$ Dollar Australien (AUD)', symbol: 'A$' },
] as const;

export type OrganizationSizeType = typeof ORGANIZATION_SIZE[keyof typeof ORGANIZATION_SIZE];
export type IndustryType = typeof INDUSTRY_TYPES[keyof typeof INDUSTRY_TYPES];
