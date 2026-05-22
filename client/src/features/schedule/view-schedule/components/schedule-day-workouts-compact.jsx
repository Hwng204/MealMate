import { CheckCircle2, Circle, Dumbbell } from 'lucide-react';

export default function ScheduleDayWorkoutsCompact({ schedule, onExerciseClick }) {
  const workouts = Array.isArray(schedule?.workout) ? schedule.workout : [];
  if (!workouts.length) return null;

  const done = workouts.filter(w => w.isCompleted).length;

  return (
    <div className='mt-4 rounded-2xl border border-orange-200/60 bg-orange-50/40 p-3'>
      <div className='mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-700'>
        <Dumbbell className='h-3.5 w-3.5' />
        Tập luyện ({done}/{workouts.length})
      </div>
      <ul className='space-y-1.5'>
        {workouts.map(item => (
          <li
            key={item.exerciseId}
            onClick={() => onExerciseClick?.(item.exerciseId)}
            className={`flex items-center gap-2 text-xs text-foreground transition-colors ${
              onExerciseClick ? 'cursor-pointer hover:text-orange-600' : ''
            }`}
          >
            {item.isCompleted ? (
              <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-primary' />
            ) : (
              <Circle className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            )}
            <span
              className={
                item.isCompleted ? 'text-muted-foreground line-through' : ''
              }
            >
              {item.exerciseName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
