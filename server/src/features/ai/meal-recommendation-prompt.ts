import { MEAL_CALORIE_RATIO_LABEL } from '~/shared/constants/meal-calorie-ratio';
import { MEAL_TYPE } from '~/shared/constants/meal-type';

import {
  IDishCatalogPromptInput,
  IInputGenerateMeal,
  IMealSlotPromptInput
} from './ai-type';

const MEAL_TYPES = Object.values(MEAL_TYPE);
const MEAL_TYPES_LIST = MEAL_TYPES.map(value => `"${value}"`).join(', ');

export const MEAL_RECOMMENDATION_PROMPT_CONFIG = {
  maxDishesPerMeal: 3,
  minServings: 1,
  maxServings: 5,
  maxCatalogItems: 120
} as const;

export const MEAL_WEEKLY_RECOMMENDATION_PROMPT_CONFIG = {
  maxDishesPerMeal: 3,
  minServings: 1,
  maxServings: 5,
  maxCatalogItems: 50
} as const;

type MealRecommendationPromptConfig = {
  dateISO: string;
  dayOfWeek: string;
  mealSlots: IMealSlotPromptInput[];
  dishCatalog: IDishCatalogPromptInput[];
  retrievalSummary?: string;
  regenerationNotes?: string;
};

const formatMealSlots = (mealSlots: IMealSlotPromptInput[]) =>
  mealSlots
    .map((slot, index) => {
      const dishCategories =
        slot.dishCategories.length > 0 ? slot.dishCategories.join(', ') : 'N/A';
      const preferredTypes =
        slot.preferredTypes.length > 0 ? slot.preferredTypes.join(', ') : 'N/A';

      return [
        `       ${index + 1}. mealType: "${slot.mealType}"`,
        `          - mealSettingName: "${slot.mealSettingName}"`,
        `          - targetDishCount: ${slot.dishCount}`,
        `          - preferredTypes: ${preferredTypes}`,
        `          - mealSize: ${slot.mealSize ?? 'N/A'}`,
        `          - cookingPreference: ${slot.cookingPreference ?? 'N/A'}`,
        `          - availableTime: ${slot.availableTime ?? 'N/A'}`,
        `          - complexity: ${slot.complexity ?? 'N/A'}`,
        `          - dishCategories: ${dishCategories}`,
        `          - calorieTarget: ${
          typeof slot.calorieTarget === 'number'
            ? `${slot.calorieTarget} kcal`
            : 'N/A'
        }`
      ].join('\n');
    })
    .join('\n');

const formatDishCatalog = (dishCatalog: IDishCatalogPromptInput[]) =>
  dishCatalog
    .map((dish, index) => {
      const nutrientSummary = dish.nutrients
        .slice(0, 6)
        .map(item => `${item.label}: ${item.value}${item.unit}`)
        .join(', ');

      return [
        `       ${index + 1}. id: "${dish.id}"`,
        `          - name: "${dish.name}"`,
        `          - suggestedMealTypes: ${
          dish.suggestedMealTypes.length > 0
            ? dish.suggestedMealTypes.join(', ')
            : 'N/A'
        }`,
        `          - categories: ${
          dish.categories.length > 0 ? dish.categories.join(', ') : 'N/A'
        }`,
        `          - nutritionFocus: ${
          dish.nutritionFocus.length > 0
            ? dish.nutritionFocus.join(', ')
            : 'N/A'
        }`,
        `          - tags: ${dish.tags.length > 0 ? dish.tags.join(', ') : 'N/A'}`,
        `          - totalTimeMinutes: ${dish.totalTimeMinutes}`,
        `          - defaultServings: ${dish.defaultServings}`,
        `          - calories: ${dish.calories ?? 0} kcal`,
        `          - nutrients: ${nutrientSummary || 'N/A'}`
      ].join('\n');
    })
    .join('\n');

const formatDishCatalogCompact = (dishCatalog: IDishCatalogPromptInput[]) =>
  dishCatalog
    .map((dish, index) => {
      const types =
        dish.suggestedMealTypes.length > 0
          ? dish.suggestedMealTypes.join('/')
          : 'N/A';
      const cats =
        dish.categories.length > 0 ? dish.categories.slice(0, 3).join('/') : '-';
      return `   ${index + 1}. "${dish.id}" | ${dish.name} | ${dish.calories ?? 0}kcal | [${types}] | [${cats}]`;
    })
    .join('\n');

const formatMacroTargets = (input: IInputGenerateMeal) => {
  const macroTargets = input.macroTargets;

  if (!macroTargets) return 'N/A';

  const toRangeText = (value?: { min?: number; max?: number }) => {
    if (!value) return 'N/A';
    if (typeof value.min === 'number' && typeof value.max === 'number') {
      return `${value.min}-${value.max}g`;
    }
    if (typeof value.min === 'number') return `>=${value.min}g`;
    if (typeof value.max === 'number') return `<=${value.max}g`;
    return 'N/A';
  };

  return `Carbs: ${toRangeText(macroTargets.carbs)}, Protein: ${toRangeText(
    macroTargets.protein
  )}, Fat: ${toRangeText(macroTargets.fat)}`;
};

const mealRecommendationPrompt = (
  input: IInputGenerateMeal,
  {
    dateISO,
    dayOfWeek,
    mealSlots,
    dishCatalog,
    retrievalSummary,
    regenerationNotes
  }: MealRecommendationPromptConfig
) => {
  const mealSlotsBlock = formatMealSlots(mealSlots);
  const dishCatalogBlock = formatDishCatalog(dishCatalog);
  const retrievalBlock = retrievalSummary
    ? `     
     Retrieval notes:
${retrievalSummary}
`
    : '';
  const regenerationBlock = regenerationNotes
    ? `
     Regeneration notes:
${regenerationNotes}
`
    : '';
  const calorieTarget = input.caloriesTarget;
  const calorieRule =
    typeof calorieTarget === 'number' && calorieTarget > 0
      ? `     - TOP PRIORITY: Total daily calories (sum of each dish's calories × servings across ALL meals) MUST be between ${calorieTarget - 100} and ${calorieTarget + 100} kcal (target ${calorieTarget} kcal, tolerance ±100).
     - Use the calories values from the dish catalog to calculate the daily total before returning any recommendation.
     - Weekly dish repetition is allowed. Do not sacrifice the daily calorie constraint for variety or meal-level distribution.
     - Meal-level calorie distribution is only a soft preference; if needed, prioritize the daily total within ±100 over meal targets.
     - Adjust servings (within allowed range) to hit the daily calorie target before finalizing dish picks.`
      : `     - Keep total daily calories balanced and realistic for the user's goal.
     - Weekly dish repetition is allowed.
     - When main meals are present, prefer calorie distribution ${MEAL_CALORIE_RATIO_LABEL} (sáng-trưa-tối) only if it does not violate the total daily calorie constraint.`;

  return `You are an experienced nutrition coach creating a daily meal recommendation from an existing dish catalog.
     
     USER PROFILE:
     - Gender: ${input.gender ?? 'N/A'}
     - Age: ${input.age ?? 'N/A'}
     - Height (cm): ${input.height ?? 'N/A'}
     - Current weight (kg): ${input.weight ?? 'N/A'}
     - Target weight (kg): ${input.targetWeight ?? 'N/A'}
     - Goal: ${input.fitnessGoal ?? 'N/A'}
     - Diet: ${input.diet ?? 'N/A'}
     - Activity level: ${input.activityLevel ?? 'N/A'}
     - Body fat: ${input.bodyfat ?? 'N/A'}
     - Allergens: ${
       input.allergens && input.allergens.length > 0
         ? input.allergens.join(', ')
         : 'N/A'
     }
     - Medical history: ${
       input.medicalHistory && input.medicalHistory.length > 0
         ? input.medicalHistory.join(', ')
         : 'N/A'
     }
     - Calories target: ${input.caloriesTarget ?? 'N/A'}
     - Macro targets: ${formatMacroTargets(input)}
${retrievalBlock}${regenerationBlock}
     SCHEDULE INFORMATION:
     - date: ${dateISO}
     - dayOfWeek: ${dayOfWeek}
     - meal slots (${mealSlots.length}):
${mealSlotsBlock}

     DISH CATALOG (ONLY choose from this list, by exact id):
${dishCatalogBlock}

     STRICT REQUIREMENTS:
     - You MUST return EXACTLY ${mealSlots.length} meal objects, in the same order as meal slots.
     - "mealType" MUST match each slot's mealType exactly.
     - For each meal, pick up to ${
       MEAL_RECOMMENDATION_PROMPT_CONFIG.maxDishesPerMeal
     } dishes and do not exceed the slot targetDishCount.
     - Dish IDs MUST come from the provided catalog only.
     - servings must be integer between ${
       MEAL_RECOMMENDATION_PROMPT_CONFIG.minServings
     } and ${MEAL_RECOMMENDATION_PROMPT_CONFIG.maxServings}.
     - Do not repeat the same dishId across different meals in the same day unless there are not enough unique dishes.
     - Use retrieval notes to reduce repeating dishes from recent days when alternatives exist.
     - When regeneration notes are provided, prefer different dishes than the current plan unless no suitable alternatives exist.
${calorieRule}
     - Respect allergens, meal constraints, user goal, and nutrition balance.
     - Do NOT invent new fields.
     
      OUTPUT JSON SCHEMA (no markdown, no explanation text):
      [
        {
          "mealType": "Bữa sáng",
          "dishes": [
            {
              "dishId": "68de1eca0ac8cfd1a7f68780",
              "servings": 1
            }
          ]
        }
      ]`;
};

type WeeklyDayPromptInput = {
  dayIndex: number;
  dateISO: string;
  dayOfWeek: string;
  mealSlots: IMealSlotPromptInput[];
};

type WeeklyMealRecommendationPromptConfig = {
  weekStartDateISO: string;
  weekDays: WeeklyDayPromptInput[];
  dishCatalog: IDishCatalogPromptInput[];
  retrievalSummary?: string;
  regenerationNotes?: string;
};

const formatWeeklyDays = (weekDays: WeeklyDayPromptInput[]) =>
  weekDays
    .map(day => {
      const mealSlotsBlock = formatMealSlots(day.mealSlots);
      return [
        `   DAY ${day.dayIndex + 1}:`,
        `   - date: ${day.dateISO}`,
        `   - dayOfWeek: ${day.dayOfWeek}`,
        `   - meal slots (${day.mealSlots.length}):`,
        mealSlotsBlock
      ].join('\n');
    })
    .join('\n\n');

const formatWeeklyDaysCompact = (weekDays: WeeklyDayPromptInput[]) =>
  weekDays
    .map(day => {
      const slots = day.mealSlots
        .map((slot, idx) => {
          const cal =
            typeof slot.calorieTarget === 'number'
              ? `${slot.calorieTarget}kcal`
              : 'N/A';
          return `     ${idx + 1}. ${slot.mealType} (x${slot.dishCount}, ${cal})`;
        })
        .join('\n');
      return [
        `   DAY ${day.dayIndex + 1} (${day.dayOfWeek}, ${day.dateISO}):`,
        slots
      ].join('\n');
    })
    .join('\n');

const mealRecommendationWeeklyPrompt = (
  input: IInputGenerateMeal,
  {
    weekStartDateISO,
    weekDays,
    dishCatalog,
    retrievalSummary,
    regenerationNotes
  }: WeeklyMealRecommendationPromptConfig
) => {
  const weekDaysBlock = formatWeeklyDaysCompact(weekDays);
  const dishCatalogBlock = formatDishCatalogCompact(dishCatalog);
  const retrievalBlock = retrievalSummary
    ? `     
     Retrieval notes:
${retrievalSummary}
`
    : '';
  const regenerationBlock = regenerationNotes
    ? `
     Regeneration notes:
${regenerationNotes}
`
    : '';
  const calorieTarget = input.caloriesTarget;
  const calorieRule =
    typeof calorieTarget === 'number' && calorieTarget > 0
      ? `     - TOP PRIORITY: Total daily calories (sum of each dish's calories × servings across ALL meals) MUST be between ${calorieTarget - 100} and ${calorieTarget + 100} kcal for EACH of the 7 days (target ${calorieTarget} kcal/day, tolerance ±100).
     - Use the calories values from the dish catalog to calculate the daily total before returning any recommendation.
     - Meal-level calorie distribution is only a soft preference; if needed, prioritize the daily total within ±100 over meal targets.
     - Adjust servings (within allowed range) to hit the daily calorie target before finalizing dish picks.`
      : `     - Keep total daily calories balanced and realistic for the user's goal for EACH of the 7 days.
     - When main meals are present, prefer calorie distribution ${MEAL_CALORIE_RATIO_LABEL} (sáng-trưa-tối) only if it does not violate the total daily calorie constraint.`;

  return `You are an experienced nutrition coach creating a 7-day (Monday to Sunday) meal plan from an existing dish catalog.

     USER PROFILE:
     - Gender: ${input.gender ?? 'N/A'}
     - Age: ${input.age ?? 'N/A'}
     - Height (cm): ${input.height ?? 'N/A'}
     - Current weight (kg): ${input.weight ?? 'N/A'}
     - Target weight (kg): ${input.targetWeight ?? 'N/A'}
     - Goal: ${input.fitnessGoal ?? 'N/A'}
     - Diet: ${input.diet ?? 'N/A'}
     - Activity level: ${input.activityLevel ?? 'N/A'}
     - Body fat: ${input.bodyfat ?? 'N/A'}
     - Allergens: ${
       input.allergens && input.allergens.length > 0
         ? input.allergens.join(', ')
         : 'N/A'
     }
     - Medical history: ${
       input.medicalHistory && input.medicalHistory.length > 0
         ? input.medicalHistory.join(', ')
         : 'N/A'
     }
     - Calories target: ${input.caloriesTarget ?? 'N/A'}
     - Macro targets: ${formatMacroTargets(input)}
${retrievalBlock}${regenerationBlock}
     WEEK START: ${weekStartDateISO}

     WEEK SCHEDULE (7 days, Monday → Sunday):
${weekDaysBlock}

     DISH CATALOG (ONLY choose from this list, by exact id):
${dishCatalogBlock}

     STRICT REQUIREMENTS:
     - You MUST return EXACTLY 7 day objects, in the same order as WEEK SCHEDULE (Monday first, Sunday last).
     - Each day object MUST include: "date" (ISO string matching the schedule exactly), "dayOfWeek" (EXACT string from schedule, e.g. "${
       weekDays[0]?.dayOfWeek ?? 'N/A'
     }" for day 1, do NOT translate), and "meals" (array of meal objects in the same order as that day's meal slots).
     - For each meal, "mealType" MUST match the slot's mealType exactly.
     - For each meal, pick up to ${
       MEAL_WEEKLY_RECOMMENDATION_PROMPT_CONFIG.maxDishesPerMeal
     } dishes and do not exceed the slot targetDishCount.
     - Dish IDs MUST come from the provided catalog only.
     - servings must be integer between ${
       MEAL_WEEKLY_RECOMMENDATION_PROMPT_CONFIG.minServings
     } and ${MEAL_WEEKLY_RECOMMENDATION_PROMPT_CONFIG.maxServings}.
     - VARIETY PREFERENCE: Prefer different dishes across the week. A dish should ideally appear at most 3 times across the entire week, and never on 2 consecutive days. Try to spread variety, but do NOT sacrifice the daily calorie constraint for variety.
     - Repetition within the same day across different meals is allowed only if there are not enough unique dishes.
     - Use retrieval notes to reduce repeating dishes from recent days when alternatives exist.
     - When regeneration notes are provided, prefer different dishes than the current plan unless no suitable alternatives exist.
${calorieRule}
     - Respect allergens, meal constraints, user goal, and nutrition balance.
     - Do NOT invent new fields.
     
     OUTPUT JSON SCHEMA (no markdown, no explanation text):
     [
       {
         "date": "${weekDays[0]?.dateISO ?? '2026-06-22T00:00:00.000Z'}",
         "dayOfWeek": "${weekDays[0]?.dayOfWeek ?? 'Thứ Hai'}",
         "meals": [
           {
             "mealType": "${weekDays[0]?.mealSlots[0]?.mealType ?? 'Bữa sáng'}",
             "dishes": [
               { "dishId": "68de1eca0ac8cfd1a7f68780", "servings": 1 }
             ]
           }
         ]
       }
     ]`;
};

export default mealRecommendationPrompt;
export { mealRecommendationWeeklyPrompt };
