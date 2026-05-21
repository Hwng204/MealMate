export const MEMBERSHIP_LEVEL = {
  NORMAL: 'Tài khoản thường',
  VIP: 'Tài khoản VIP',
  EXPERT_CLASS: 'Tài khoản chuyên gia Lớp học',
  EXPERT_BASIC: 'Tài khoản chuyên gia Basic',
  EXPERT_STANDARD: 'Tài khoản chuyên gia Standard',
  EXPERT_PREMIUM: 'Tài khoản chuyên gia Premium'
};

export const EXPERT_MEMBERSHIP_LEVELS = [
  MEMBERSHIP_LEVEL.EXPERT_CLASS,
  MEMBERSHIP_LEVEL.EXPERT_BASIC,
  MEMBERSHIP_LEVEL.EXPERT_STANDARD,
  MEMBERSHIP_LEVEL.EXPERT_PREMIUM
];

export const isExpertMembership = level =>
  EXPERT_MEMBERSHIP_LEVELS.includes(level);
