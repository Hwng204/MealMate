export const NUTRITIONIST_CLIENT_STATUS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  ENDED: 'Ended'
} as const;

export type NutritionistClientStatus =
  (typeof NUTRITIONIST_CLIENT_STATUS)[keyof typeof NUTRITIONIST_CLIENT_STATUS];
