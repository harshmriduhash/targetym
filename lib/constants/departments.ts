export const DEPARTMENTS = {
  TECH: 'tech',
  HR: 'hr',
  SALES: 'sales',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  OPERATIONS: 'operations',
  SUPPORT: 'support',
} as const;

export const DEPARTMENT_LABELS: Record<string, string> = {
  [DEPARTMENTS.TECH]: 'Technologie',
  [DEPARTMENTS.HR]: 'Ressources Humaines',
  [DEPARTMENTS.SALES]: 'Ventes',
  [DEPARTMENTS.MARKETING]: 'Marketing',
  [DEPARTMENTS.FINANCE]: 'Finance',
  [DEPARTMENTS.OPERATIONS]: 'Opérations',
  [DEPARTMENTS.SUPPORT]: 'Support',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  employee: 'Employé',
  manager: 'Manager',
  hr: 'RH',
  admin: 'Administrateur',
} as const;

export type DepartmentType = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];
