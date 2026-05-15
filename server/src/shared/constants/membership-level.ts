export const MEMBERSHIP_LEVEL = {
  NORMAL: 'Tài khoản thường',
  VIP: 'Tài khoản VIP',
  EXPERT_BASIC: 'Tài khoản chuyên gia Basic',
  EXPERT_STANDARD: 'Tài khoản chuyên gia Standard',
  EXPERT_PREMIUM: 'Tài khoản chuyên gia Premium'
} as const;

export type MembershipLevel =
  (typeof MEMBERSHIP_LEVEL)[keyof typeof MEMBERSHIP_LEVEL];

export const USER_PURCHASABLE_MEMBERSHIPS = [
  MEMBERSHIP_LEVEL.VIP
] as const satisfies readonly MembershipLevel[];

export const NUTRITIONIST_PURCHASABLE_MEMBERSHIPS = [
  MEMBERSHIP_LEVEL.EXPERT_BASIC,
  MEMBERSHIP_LEVEL.EXPERT_STANDARD,
  MEMBERSHIP_LEVEL.EXPERT_PREMIUM
] as const satisfies readonly MembershipLevel[];

export const EXPERT_MEMBERSHIP_LEVELS = [
  ...NUTRITIONIST_PURCHASABLE_MEMBERSHIPS
] as const;

export const PAID_MEMBERSHIP_LEVELS = [
  MEMBERSHIP_LEVEL.VIP,
  ...EXPERT_MEMBERSHIP_LEVELS
] as const;

const EXPERT_MEMBERSHIP_RANK: Record<string, number> = {
  [MEMBERSHIP_LEVEL.EXPERT_BASIC]: 1,
  [MEMBERSHIP_LEVEL.EXPERT_STANDARD]: 2,
  [MEMBERSHIP_LEVEL.EXPERT_PREMIUM]: 3
};

export const isExpertMembership = (
  level: string | null | undefined
): level is MembershipLevel =>
  !!level &&
  EXPERT_MEMBERSHIP_LEVELS.includes(level as (typeof EXPERT_MEMBERSHIP_LEVELS)[number]);

export const isPaidMembership = (
  level: string | null | undefined
): level is MembershipLevel =>
  !!level &&
  PAID_MEMBERSHIP_LEVELS.includes(level as (typeof PAID_MEMBERSHIP_LEVELS)[number]);

export const getExpertMembershipRank = (level: string): number =>
  EXPERT_MEMBERSHIP_RANK[level] ?? 0;
