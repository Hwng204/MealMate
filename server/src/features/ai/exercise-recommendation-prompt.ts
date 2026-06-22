import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';

import { IExerciseCatalogPromptInput, IInputGenerateWorkout } from './ai-type';
import type { WorkoutFocus } from './workout-focus';

const EXERCISE_TYPES = Object.values(EXERCISE_TYPE);
const EXERCISE_TYPES_LIST = EXERCISE_TYPES.map(value => `"${value}"`).join(
  ', '
);

const DIFFICULTY_VALUES = Object.values(EXERCISE_DIFFICULTY);
const DIFFICULTY_LIST = DIFFICULTY_VALUES.map(value => `"${value}"`).join(', ');

const LOG_TYPES = Object.values(WORKOUT_COUNTER_TYPE);
const LOG_TYPES_LIST = LOG_TYPES.map(value => `"${value}"`).join(', ');

export const EXERCISE_RECOMMENDATION_PROMPT_CONFIG = {
  maxCatalogItems: 120
} as const;

type ExerciseRecommendationPromptConfig = {
  dateISO: string;
  dayOfWeek: string;
  targetExerciseCount: number;
  exerciseCatalog: IExerciseCatalogPromptInput[];
  retrievalSummary?: string;
  focus?: WorkoutFocus;
};

const formatExerciseCatalog = (
  exerciseCatalog: IExerciseCatalogPromptInput[]
) =>
  exerciseCatalog
    .map((exercise, index) => {
      const muscles =
        exercise.muscles.length > 0 ? exercise.muscles.join(', ') : 'N/A';
      const equipments =
        exercise.equipments.length > 0 ? exercise.equipments.join(', ') : 'N/A';

      return [
        `       ${index + 1}. id: "${exercise.id}"`,
        `          - name: "${exercise.name}"`,
        `          - difficulty: ${exercise.difficulty}`,
        `          - type: ${exercise.type}`,
        `          - logType: ${exercise.logType}`,
        `          - muscles: ${muscles}`,
        `          - equipments: ${equipments}`
      ].join('\n');
    })
    .join('\n');

const exerciseRecommendationPrompt = (
  input: IInputGenerateWorkout,
  {
    dateISO,
    dayOfWeek,
    targetExerciseCount,
    exerciseCatalog,
    retrievalSummary,
    focus
  }: ExerciseRecommendationPromptConfig
) => {
  const exerciseCatalogBlock = formatExerciseCatalog(exerciseCatalog);
  const retrievalBlock = retrievalSummary
    ? `
     Retrieval notes (reserved for RAG upgrade):
${retrievalSummary}
`
    : '';

  const focusBlock = focus
    ? (() => {
        const muscleList =
          focus.primaryMuscleGroups.length > 0
            ? focus.primaryMuscleGroups.join(', ')
            : 'N/A (rest day)';
        const typeHint =
          focus.preferredExerciseTypes && focus.preferredExerciseTypes.length > 0
            ? `Preferred exercise types for today: ${focus.preferredExerciseTypes.join(', ')}.`
            : '';
        const intensityHint =
          focus.intensity === 'low'
            ? 'Intensity should be LOW — focus on recovery, breathing, and gentle movement.'
            : focus.intensity === 'high'
              ? 'Intensity should be HIGH — push the user on main lifts.'
              : 'Intensity should be MODERATE — mix of compound and accessory work.';
        const isRestDay = focus.key === 'rest';
        return `
     WEEKLY WORKOUT FOCUS (today's plan):
     - Day: ${dayOfWeek}
     - Focus: ${focus.label} — ${focus.description}
     - Primary muscle groups: ${muscleList}
     - Intensity: ${focus.intensity}
     ${intensityHint}
     ${typeHint}
     - PRIORITIZE exercises that target the primary muscle groups listed above.
     - If not enough focus-matching exercises exist in the catalog, you MAY include exercises for other muscle groups to reach the target count.
     ${
       isRestDay
         ? '- REST DAY: Prefer low-intensity exercises (stretching, yoga, mobility, light cardio). Avoid heavy strength training.'
         : '- Do NOT pick exercises whose primary muscles fall completely outside the focus unless necessary to fill the count.'
     }`;
      })()
    : '';

  return `You are an experienced fitness coach creating a daily workout from an existing exercise catalog.

     USER PROFILE:
     - Gender: ${input.gender ?? 'N/A'}
     - Age: ${input.age ?? 'N/A'}
     - Height (cm): ${input.height ?? 'N/A'}
     - Current weight (kg): ${input.weight ?? 'N/A'}
     - Target weight (kg): ${input.targetWeight ?? 'N/A'}
     - Goal: ${input.fitnessGoal ?? 'N/A'}
     - Activity level: ${input.activityLevel ?? 'N/A'}
     - Body fat: ${input.bodyfat ?? 'N/A'}
     - Medical history: ${
       input.medicalHistory && input.medicalHistory.length > 0
         ? input.medicalHistory.join(', ')
         : 'N/A'
     }
${retrievalBlock}${focusBlock}
     SCHEDULE INFORMATION:
     - date: ${dateISO}
     - dayOfWeek: ${dayOfWeek}
     - target exercise count: ${targetExerciseCount}

     EXERCISE CATALOG (ONLY choose from this list, by exact id; focus-matched items appear first):
${exerciseCatalogBlock}

     STRICT REQUIREMENTS:
     - You MUST return EXACTLY ${targetExerciseCount} exercise objects.
     - Each object must contain "exerciseId" only.
     - exerciseId MUST come from the provided catalog only.
     - Do not repeat the same exerciseId.
     - Use the meal context for this date to balance workout intensity (heavier meals -> higher intensity or duration).
     - Respect the user's activity level and goal.
     - Do NOT invent new fields.
     - Allowed exercise types: ${EXERCISE_TYPES_LIST}.
     - Allowed difficulty values: ${DIFFICULTY_LIST}.
     - Allowed logType values: ${LOG_TYPES_LIST}.

     OUTPUT JSON SCHEMA (no markdown, no explanation text):
     [
       {
         "exerciseId": "68de1eca0ac8cfd1a7f68780"
       }
     ]`;
};

export default exerciseRecommendationPrompt;
