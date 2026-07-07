import { addDays, addWeeks, startOfWeek, subDays, subWeeks, format } from 'date-fns';
import { useState } from 'react';
import { HiSparkles } from 'react-icons/hi';

import AITokenUsage from '~/features/schedule/view-schedule/components/ai-token-usage';
import { useRecommendWeeklyMeals } from '~/features/ai-schedule/recommend-ai-meal/api/recommend-weekly-meals';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
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

  const { data: profile } = useProfileForPage();
  const { mutate: generateAI, isPending: isGeneratingAI } =
    useRecommendWeeklyMeals();

  const handleGenerateAI = () => {
    generateAI({
      weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      userId,
    });
  };

  const remainingTokens = profile?.aiTokens;
  const dailyTokenLimit = profile?.aiDailyTokenLimit;

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
          <div className='flex items-center justify-between gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3'>
            <div className='min-w-0'>
              <p className='text-[12px] font-black tracking-tight text-primary'>
                Gợi ý thực đơn tuần bằng AI
              </p>
              <p className='text-[11px] text-muted-foreground'>
                Tạo nhanh lịch ăn phù hợp với mục tiêu của học viên
              </p>

              <AITokenUsage
                remainingTokens={remainingTokens}
                dailyTokenLimit={dailyTokenLimit}
              />
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className='flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12px] font-black tracking-tight text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isGeneratingAI ? (
                <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <HiSparkles size={14} />
              )}
              AI gợi ý theo tuần
            </button>
          </div>
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
