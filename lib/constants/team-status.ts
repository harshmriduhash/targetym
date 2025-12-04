export const TEAM_MEMBER_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on-leave',
  INACTIVE: 'inactive',
} as const;

export type TeamMemberStatus = typeof TEAM_MEMBER_STATUS[keyof typeof TEAM_MEMBER_STATUS];

export const STATUS_CONFIG: Record<
  TeamMemberStatus,
  { label: string; className: string }
> = {
  [TEAM_MEMBER_STATUS.ACTIVE]: {
    label: 'Actif',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [TEAM_MEMBER_STATUS.ON_LEAVE]: {
    label: 'En congé',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [TEAM_MEMBER_STATUS.INACTIVE]: {
    label: 'Inactif',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
} as const;

/**
 * Get status configuration
 */
export function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status as TeamMemberStatus] || {
      label: status,
      className: STATUS_CONFIG[TEAM_MEMBER_STATUS.INACTIVE].className,
    }
  );
}
