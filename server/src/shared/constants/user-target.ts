export const USER_TARGET = {
  LOSE_FAT: 'Giảm mỡ',
  MAINTAIN_WEIGHT: 'Duy trì cân nặng',
  BUILD_MUSCLE: 'Tăng cơ',
  GAIN_WEIGHT: 'Tăng cân'
} as const;

export type Target = (typeof USER_TARGET)[keyof typeof USER_TARGET];
