type Tier = 'free' | 'pro' | 'enterprise';

const TIERS: Record<Tier, { members: number; goals: number }> = {
  free: { members: 5, goals: 10 },
  pro: { members: 50, goals: 1000 },
  enterprise: { members: Infinity, goals: Infinity },
};

export function getTierLimits(tier: Tier) {
  return TIERS[tier] ?? TIERS.free;
}

export function canCreateMember(tier: Tier, currentMembers: number) {
  const limits = getTierLimits(tier);
  return currentMembers < limits.members;
}

export function canCreateGoal(tier: Tier, currentGoals: number) {
  const limits = getTierLimits(tier);
  return currentGoals < limits.goals;
}

export function isEnterprise(tier: string) {
  return tier === 'enterprise';
}

export default {
  getTierLimits,
  canCreateMember,
  canCreateGoal,
  isEnterprise,
};
