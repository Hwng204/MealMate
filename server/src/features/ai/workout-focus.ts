import type { ExerciseMuscleName } from '~/shared/constants/exercise-muscles';
import { EXERCISE_TYPE, type ExerciseType } from '~/shared/constants/exercise-type';

export type WorkoutFocusKey =
  | 'core'
  | 'lower'
  | 'upper'
  | 'fullBody'
  | 'rest';

export type WorkoutFocus = {
  key: WorkoutFocusKey;
  label: string;
  description: string;
  primaryMuscleGroups: ExerciseMuscleName[];
  preferredExerciseTypes?: ExerciseType[];
  intensity: 'low' | 'medium' | 'high';
};

const DAY_INDEX_SUNDAY = 0;
const DAY_INDEX_MONDAY = 1;
const DAY_INDEX_TUESDAY = 2;
const DAY_INDEX_WEDNESDAY = 3;
const DAY_INDEX_THURSDAY = 4;
const DAY_INDEX_FRIDAY = 5;
const DAY_INDEX_SATURDAY = 6;

export const WEEKLY_WORKOUT_FOCUS: Record<number, WorkoutFocus> = {
  [DAY_INDEX_SUNDAY]: {
    key: 'rest',
    label: 'Nghỉ ngơi / Phục hồi',
    description: 'Chủ nhật — tập nhẹ để phục hồi cơ thể',
    primaryMuscleGroups: [],
    preferredExerciseTypes: [
      EXERCISE_TYPE.STRETCHING,
      EXERCISE_TYPE.YOGA,
      EXERCISE_TYPE.MOBILITY
    ],
    intensity: 'low'
  },
  [DAY_INDEX_MONDAY]: {
    key: 'core',
    label: 'Cơ trung tâm',
    description: 'Tập trung vào lưng và bụng',
    primaryMuscleGroups: ['Back', 'Abs'],
    intensity: 'medium'
  },
  [DAY_INDEX_TUESDAY]: {
    key: 'lower',
    label: 'Thân dưới',
    description: 'Tập trung vào chân, đùi và mông',
    primaryMuscleGroups: ['Upper Legs', 'Lower Legs', 'Glutes'],
    intensity: 'high'
  },
  [DAY_INDEX_WEDNESDAY]: {
    key: 'upper',
    label: 'Thân trên',
    description: 'Tập trung vào tay, vai và ngực',
    primaryMuscleGroups: [
      'Biceps',
      'Triceps',
      'Forearms',
      'Shoulders',
      'Chest'
    ],
    intensity: 'high'
  },
  [DAY_INDEX_THURSDAY]: {
    key: 'core',
    label: 'Cơ trung tâm',
    description: 'Tập trung vào lưng và bụng',
    primaryMuscleGroups: ['Back', 'Abs'],
    intensity: 'medium'
  },
  [DAY_INDEX_FRIDAY]: {
    key: 'lower',
    label: 'Thân dưới',
    description: 'Tập trung vào chân, đùi và mông',
    primaryMuscleGroups: ['Upper Legs', 'Lower Legs', 'Glutes'],
    intensity: 'high'
  },
  [DAY_INDEX_SATURDAY]: {
    key: 'fullBody',
    label: 'Toàn thân',
    description: 'Tập full body — kết hợp tất cả các vùng cơ',
    primaryMuscleGroups: [
      'Abs',
      'Back',
      'Biceps',
      'Triceps',
      'Forearms',
      'Shoulders',
      'Chest',
      'Upper Legs',
      'Lower Legs',
      'Glutes'
    ],
    intensity: 'medium'
  }
};

export const resolveWorkoutFocus = (date: Date): WorkoutFocus => {
  const dayIndex = date.getUTCDay();
  return (
    WEEKLY_WORKOUT_FOCUS[dayIndex] ?? WEEKLY_WORKOUT_FOCUS[DAY_INDEX_MONDAY]
  );
};

export const focusMatchesMuscle = (
  focus: WorkoutFocus,
  muscleName: string
): boolean => {
  if (focus.primaryMuscleGroups.length === 0) return true;
  return focus.primaryMuscleGroups.includes(
    muscleName as ExerciseMuscleName
  );
};

export const focusMatchesExerciseType = (
  focus: WorkoutFocus,
  exerciseType: string
): boolean => {
  if (!focus.preferredExerciseTypes || focus.preferredExerciseTypes.length === 0) {
    return true;
  }
  return focus.preferredExerciseTypes.includes(exerciseType as ExerciseType);
};
