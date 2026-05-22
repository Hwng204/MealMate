import { addDays, addWeeks, startOfWeek, subDays, subWeeks } from 'date-fns';
import { useState } from 'react';

import DishDetailDialog from '~/features/classes/components/dish-detail-dialog';
import ExerciseDetailDialog from '~/features/classes/components/exercise-detail-dialog';
import { formatScheduleTitle } from '~/lib/utils';

import ScheduleHeader from './schedule-header';
import ScheduleToday from './schedule-today';
import ScheduleViewSwitcher from './schedule-view-switcher';
import ScheduleWeek from './schedule-week';

export default function NutritionistSchedulePanel({ userId, memberProfile }) {
  const [view, setView] = useState('day');
  const [date, setDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [dishDialogId, setDishDialogId] = useState(null);
  const [exerciseDialogId, setExerciseDialogId] = useState(null);

  const selectedDateForHeader = view === 'day' ? date : weekStart;

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 rounded-[28px] border border-border/60 bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6'>
        <ScheduleViewSwitcher view={view} onChange={setView} />
        <div className='min-w-0 text-right'>
          <h2 className='truncate text-lg font-black capitalize text-foreground'>
            {formatScheduleTitle(view, selectedDateForHeader)}
          </h2>
          <p className='text-[10px] font-bold uppercase tracking-widest text-primary'>
            {view === 'day' ? 'Lịch trình ngày' : 'Kế hoạch tuần'}
          </p>
        </div>
      </div>

      {view === 'day' ? (
        <>
          <ScheduleHeader
            view='day'
            embedded
            selectedDate={date}
            onSelectDate={setDate}
            onPrev={() => setDate(d => subDays(d, 1))}
            onNext={() => setDate(d => addDays(d, 1))}
          />
          <div className='rounded-3xl border px-4 py-4 sm:px-6 sm:py-6'>
            <ScheduleToday
              selectedDate={date}
              userId={userId}
              readOnly={false}
              onDishClick={setDishDialogId}
              onExerciseClick={setExerciseDialogId}
              memberProfile={memberProfile}
            />
          </div>
        </>
      ) : (
        <>
          <ScheduleHeader
            view='week'
            embedded
            selectedDate={weekStart}
            onSelectDate={setWeekStart}
            onPrev={() => setWeekStart(d => subWeeks(d, 1))}
            onNext={() => setWeekStart(d => addWeeks(d, 1))}
          />
          <div className='rounded-3xl border px-2 py-4 sm:px-4'>
            <ScheduleWeek
              startOfSelectedWeek={weekStart}
              userId={userId}
              readOnly={false}
              onDishClick={setDishDialogId}
              onExerciseClick={setExerciseDialogId}
            />
          </div>
        </>
      )}

      <DishDetailDialog
        dishId={dishDialogId}
        open={Boolean(dishDialogId)}
        onOpenChange={open => {
          if (!open) setDishDialogId(null);
        }}
      />

      <ExerciseDetailDialog
        exerciseId={exerciseDialogId}
        open={Boolean(exerciseDialogId)}
        onOpenChange={open => {
          if (!open) setExerciseDialogId(null);
        }}
      />
    </div>
  );
}
