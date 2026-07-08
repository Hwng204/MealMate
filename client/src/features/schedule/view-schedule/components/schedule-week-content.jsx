import { addWeeks, startOfWeek, subWeeks } from 'date-fns';
import { useState } from 'react';
import { HiSparkles } from 'react-icons/hi';

import ScheduleHeader from '~/features/schedule/view-schedule/components/schedule-header';
import ScheduleWeek from '~/features/schedule/view-schedule/components/schedule-week';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

export default function ScheduleWeekContent() {
  const [currentWeekDate, setCurrentWeekDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const { data: profile } = useProfileForPage();
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

      {typeof remainingTokens === 'number' && (
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/[0.03] px-6 py-5 shadow-xs'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 text-primary'>
              <HiSparkles className='h-5 w-5 shrink-0' />
              <p className='text-sm font-black tracking-tight uppercase'>
                Gợi ý thực đơn & bài tập theo tuần bằng AI
              </p>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Tự động thiết lập thực đơn và lịch trình luyện tập tối ưu phù hợp với chỉ số của bạn trong suốt cả tuần.
            </p>
            <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs'>
              <p className='font-semibold text-primary/80'>
                AI tokens còn lại: <span className='font-bold text-foreground'>{remainingTokens.toLocaleString('vi-VN')}</span>
                {typeof dailyTokenLimit === 'number' ? ` / ${dailyTokenLimit.toLocaleString('vi-VN')}` : ''}
              </p>
              <span className='hidden md:inline text-muted-foreground/35'>•</span>
              <p className='font-semibold text-muted-foreground/80'>
                Chi phí gợi ý theo tuần: <span className='font-bold text-emerald-700'>100.000 tokens / lần</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            disabled
            className='flex shrink-0 items-center gap-2 rounded-xl bg-primary/20 px-5 py-3 text-[12px] font-black uppercase tracking-wider text-primary/70 cursor-not-allowed border border-primary/10'
            title='Tính năng VIP dành cho tài khoản Premium'
          >
            <HiSparkles size={14} />
            AI gợi ý tuần (Premium)
          </button>
        </div>
      )}

      <div className='rounded-3xl border border-slate-200 px-6 py-6'>
        <ScheduleWeek startOfSelectedWeek={currentWeekDate} />
      </div>
    </div>
  );
}
