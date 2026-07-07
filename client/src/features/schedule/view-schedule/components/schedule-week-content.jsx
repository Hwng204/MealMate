import { addWeeks, startOfWeek, subWeeks } from 'date-fns';
import { format } from 'date-fns';
import { useState } from 'react';
import { HiSparkles } from 'react-icons/hi';
import AITokenUsage from '~/features/schedule/view-schedule/components/ai-token-usage';
import { useRecommendWeeklyMeals } from '~/features/ai-schedule/recommend-ai-meal/api/recommend-weekly-meals';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

import ScheduleHeader from '~/features/schedule/view-schedule/components/schedule-header';
import ScheduleWeek from '~/features/schedule/view-schedule/components/schedule-week';

export default function ScheduleWeekContent({ userId }) {
  const [currentWeekDate, setCurrentWeekDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const { data: profile } = useProfileForPage();
  const { mutate: generateAI, isPending: isGeneratingAI } =
    useRecommendWeeklyMeals();

  const handleGenerateAI = () => {
    generateAI({
      weekStartDate: format(currentWeekDate, 'yyyy-MM-dd'),
      userId,
    });
  };
  
  const remainingTokens = profile?.aiTokens;
  const dailyTokenLimit = profile?.aiDailyTokenLimit;

  return (
    <div className='max-w-8xl mx-auto space-y-6 px-4 py-8'>
      <ScheduleHeader
        view='week'
        selectedDate={currentWeekDate}
        onSelectDate={setCurrentWeekDate}
        onPrev={() => setCurrentWeekDate(d => subWeeks(d, 1))}
        onNext={() => setCurrentWeekDate(d => addWeeks(d, 1))}
      />

      <div className='flex items-center justify-between gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3'>
        <div className='min-w-0'>
          <p className='text-[12px] font-black tracking-tight text-primary'>
            Gợi ý thực đơn tuần bằng AI
          </p>
          <p className='text-[11px] text-muted-foreground'>
            Tạo nhanh lịch ăn phù hợp với mục tiêu của bạn
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

      <div className='rounded-3xl border border-slate-200 px-6 py-6'>
        <ScheduleWeek startOfSelectedWeek={currentWeekDate} userId={userId} />
      </div>
    </div>
  );
}
