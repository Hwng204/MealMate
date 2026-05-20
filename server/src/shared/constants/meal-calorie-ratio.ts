import { MEAL_TYPE } from '~/shared/constants/meal-type';

/** Calorie share among main meals: breakfast : lunch : dinner = 3 : 5 : 2 */
export const MEAL_CALORIE_RATIO = {
  [MEAL_TYPE.BREAKFAST]: 3,
  [MEAL_TYPE.LUNCH]: 5,
  [MEAL_TYPE.DINNER]: 2
} as const;

export const MEAL_CALORIE_RATIO_SUM = 10;

export const MEAL_CALORIE_RATIO_LABEL = '3-5-2 (sáng-trưa-tối)';

export const computeMealCalorieTargets = (
  dailyTarget: number,
  mealSlots: Array<{ mealType: string }>
): Map<string, number> => {
  const targets = new Map<string, number>();

  if (!dailyTarget || dailyTarget <= 0 || !mealSlots.length) {
    return targets;
  }

  const ratioSlots = mealSlots.filter(
    slot => MEAL_CALORIE_RATIO[slot.mealType as keyof typeof MEAL_CALORIE_RATIO]
  );

  if (!ratioSlots.length) {
    return targets;
  }

  const ratioSum = ratioSlots.reduce(
    (sum, slot) =>
      sum +
      MEAL_CALORIE_RATIO[slot.mealType as keyof typeof MEAL_CALORIE_RATIO],
    0
  );

  let assigned = 0;
  ratioSlots.forEach((slot, index) => {
    const ratio =
      MEAL_CALORIE_RATIO[slot.mealType as keyof typeof MEAL_CALORIE_RATIO];

    if (index === ratioSlots.length - 1) {
      targets.set(slot.mealType, Math.max(0, dailyTarget - assigned));
      return;
    }

    const mealTarget = Math.round((dailyTarget * ratio) / ratioSum);
    targets.set(slot.mealType, mealTarget);
    assigned += mealTarget;
  });

  return targets;
};

export const getMealCalorieTolerance = (
  mealTarget: number,
  dailyTarget: number,
  dailyTolerance: number
) =>
  Math.max(
    15,
    Math.round((dailyTolerance * mealTarget) / Math.max(dailyTarget, 1))
  );
