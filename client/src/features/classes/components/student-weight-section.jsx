import { useMemo, useState } from 'react';
import { format, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAddMemberWeight } from '~/features/classes/api/classes';

const WEEKS_PER_VIEW = 6;
const LINE_COLOR = '#2563eb';

const chartConfig = {
  weight: {
    label: 'Cân nặng (kg)',
    color: LINE_COLOR
  }
};

const buildWeeklySeries = (weightRecord = []) => {
  const byWeek = new Map();

  for (const record of weightRecord) {
    if (!record?.date || record.weight == null) continue;
    const weekStart = startOfWeek(new Date(record.date), { weekStartsOn: 1 });
    const key = weekStart.getTime();
    const existing = byWeek.get(key);
    if (
      !existing ||
      new Date(record.date).getTime() > new Date(existing.date).getTime()
    ) {
      byWeek.set(key, {
        weekStart,
        date: record.date,
        weight: Number(record.weight),
        label: format(weekStart, 'dd/MM', { locale: vi })
      });
    }
  }

  return [...byWeek.values()].sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
  );
};

export default function StudentWeightSection({
  classId,
  memberId,
  weightRecord = [],
  latestWeight,
  canEdit = true,
  embedded = false
}) {
  const [weightInput, setWeightInput] = useState('');
  const [weekPage, setWeekPage] = useState(0);
  const { mutate: addWeight, isPending } = useAddMemberWeight({
    classId,
    memberId,
    onSuccess: () => setWeightInput('')
  });

  const allWeeks = useMemo(
    () => buildWeeklySeries(weightRecord),
    [weightRecord]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(allWeeks.length / WEEKS_PER_VIEW) || 1
  );
  const maxPage = totalPages - 1;

  const chartData = useMemo(() => {
    if (!allWeeks.length) return [];
    const end = allWeeks.length - weekPage * WEEKS_PER_VIEW;
    const start = Math.max(0, end - WEEKS_PER_VIEW);
    return allWeeks.slice(start, end);
  }, [allWeeks, weekPage]);

  const handleSubmit = event => {
    event.preventDefault();
    const value = Number(weightInput);
    if (!value || value <= 0) return;
    addWeight({ weight: value });
  };

  const content = (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {canEdit && (
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 sm:flex-row sm:items-end'
        >
          <div className='flex-1 space-y-1.5'>
            <Label htmlFor='student-weight' className='text-xs'>
              Cân nặng (kg)
            </Label>
            <Input
              id='student-weight'
              type='number'
              min='1'
              step='0.1'
              className='h-9'
              placeholder={
                latestWeight?.weight
                  ? `${latestWeight.weight} kg`
                  : 'VD: 65.5'
              }
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
            />
          </div>
          <Button type='submit' size='sm' disabled={isPending}>
            Lưu
          </Button>
        </form>
      )}

      {chartData.length > 0 ? (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              disabled={weekPage >= maxPage}
              onClick={() => setWeekPage(p => Math.min(maxPage, p + 1))}
              title='Tuần trước'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-xs font-medium text-muted-foreground'>
              {chartData[0]?.label} – {chartData[chartData.length - 1]?.label}
            </span>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              disabled={weekPage <= 0}
              onClick={() => setWeekPage(p => Math.max(0, p - 1))}
              title='Tuần sau'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <ChartContainer config={chartConfig} className='h-44 w-full'>
            <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray='4 4' />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                unit=' kg'
                fontSize={11}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={value => [`${value} kg`, 'Cân nặng']}
                  />
                }
              />
              <Line
                type='monotone'
                dataKey='weight'
                stroke={LINE_COLOR}
                strokeWidth={2.5}
                dot={{ fill: LINE_COLOR, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      ) : (
        <p className='rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground'>
          Chưa có dữ liệu cân nặng.
        </p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div>
        <p className='mb-3 flex items-center gap-2 text-sm font-semibold'>
          <Scale className='h-4 w-4 text-primary' />
          Theo dõi cân nặng
        </p>
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Scale className='h-5 w-5 text-primary' />
          Theo dõi cân nặng
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
