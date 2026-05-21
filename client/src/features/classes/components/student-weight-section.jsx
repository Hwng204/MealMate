import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Scale } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Brush
} from 'recharts';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '~/components/ui/chart';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAddMemberWeight } from '~/features/classes/api/classes';

const LINE_COLOR = '#2563eb';

const chartConfig = {
  weight: {
    label: 'Cân nặng (kg)',
    color: LINE_COLOR
  }
};

const buildDailySeries = (weightRecord = []) => {
  return weightRecord
    .filter(record => record?.date && record.weight != null)
    .map(record => ({
      date: new Date(record.date),
      weight: Number(record.weight),
      label: format(new Date(record.date), 'dd/MM', { locale: vi }),
      fullDate: format(new Date(record.date), 'yyyy-MM-dd')
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
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
  const { mutate: addWeight, isPending } = useAddMemberWeight({
    classId,
    memberId,
    onSuccess: () => setWeightInput('')
  });

  const allWeights = useMemo(() => buildDailySeries(weightRecord), [weightRecord]);
  const chartData = useMemo(() => allWeights || [], [allWeights]);

  const weightStats = useMemo(() => {
    if (!allWeights.length) return null;
    const sorted = [...allWeights].sort((a, b) => a.date - b.date);
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const weights = sorted.map(w => w.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    return {
      firstWeight: first,
      lastWeight: last,
      weightChange: last - first,
      minWeight: min,
      maxWeight: max,
      totalEntries: sorted.length
    };
  }, [allWeights]);

  const handleSubmit = e => {
    e.preventDefault();
    const value = Number(weightInput);
    if (!value || value <= 0) return;
    addWeight({ weight: value });
  };

  const content = (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {canEdit && (
        <form onSubmit={handleSubmit} className='flex flex-col gap-2 sm:flex-row sm:items-end'>
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
              placeholder={latestWeight?.weight ? `${latestWeight.weight} kg` : 'VD: 65.5'}
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
        <>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>
                {chartData[0]?.label} – {chartData[chartData.length - 1]?.label}
              </span>
            </div>
            <ChartContainer config={chartConfig} className='h-56 w-full'>
              <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray='4 4' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} unit=' kg' fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  content={<ChartTooltipContent formatter={value => [`${value} kg`, 'Cân nặng']} />}
                  labelFormatter={(label, payload) => payload && payload[0] && payload[0].payload?.fullDate}
                />
                <Line type='monotone' dataKey='weight' stroke={LINE_COLOR} strokeWidth={2.5} dot={{ fill: LINE_COLOR, r: 4 }} activeDot={{ r: 6 }} />
                <Brush dataKey='label' height={30} stroke={LINE_COLOR} travellerWidth={8} />
              </LineChart>
            </ChartContainer>
          </div>

          {weightStats && (
            <div className='mt-4 space-y-3'>
              <div className='text-xs font-medium text-muted-foreground'>Theo dõi thay đổi cân nặng từ đầu đến nay</div>
              <div className='flex items-center'>
                <div className='w-20 text-center text-xs font-semibold'>{weightStats.firstWeight.toFixed(1)}kg</div>
                <div className='flex-1 h-2 bg-muted rounded-full relative'>
                  <div
                    className='absolute left-0 top-0 h-full bg-primary'
                    style={{ width: `${((weightStats.lastWeight - weightStats.minWeight) / (weightStats.maxWeight - weightStats.minWeight) * 100) || 0}%` }}
                  ></div>
                </div>
                <div className='w-20 text-center text-xs font-semibold'>{weightStats.lastWeight.toFixed(1)}kg</div>
              </div>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Thay đổi: {weightStats.weightChange >= 0 ? '+' : ''}{weightStats.weightChange.toFixed(1)}kg</span>
                <span>{weightStats.totalEntries} lần đo</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className='rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground'>Chưa có dữ liệu cân nặng.</p>
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
