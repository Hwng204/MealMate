import {
  Activity,
  CheckCircle2,
  Dumbbell,
  Flame,
  Percent,
  Ruler,
  Scale,
  UtensilsCrossed
} from 'lucide-react';

const StatItem = ({ icon, value, label }) => (
  <div className='rounded-lg border bg-muted/20 px-3 py-2 text-center'>
    <div className='mb-1 flex justify-center text-primary'>{icon}</div>
    <div className='text-sm font-bold leading-tight'>{value}</div>
    <div className='text-[10px] text-muted-foreground'>{label}</div>
  </div>
);

export default function ClassProgressStats({
  data,
  member,
  weight,
  bmi,
  bmr,
  compact = false
}) {
  const stats = [
    {
      icon: <Scale className='h-4 w-4' />,
      value: weight ? `${weight} kg` : '--',
      label: 'Cân nặng'
    },
    {
      icon: <Ruler className='h-4 w-4' />,
      value: member?.height ? `${member.height} cm` : '--',
      label: 'Cao'
    },
    {
      icon: <Activity className='h-4 w-4' />,
      value: bmi,
      label: 'BMI'
    }
  ];

  if (!compact) {
    stats.push(
      {
        icon: <Percent className='h-4 w-4' />,
        value: member?.bodyfat || '--',
        label: 'Mỡ'
      },
      {
        icon: <Flame className='h-4 w-4' />,
        value: bmr,
        label: 'BMR'
      }
    );
  }

  stats.push(
    {
      icon: <UtensilsCrossed className='h-4 w-4' />,
      value: data?.mealScheduleCount ?? 0,
      label: 'Lịch ăn'
    },
    {
      icon: <Dumbbell className='h-4 w-4' />,
      value: data?.workoutScheduleCount ?? 0,
      label: 'Lịch tập'
    },
    {
      icon: <CheckCircle2 className='h-4 w-4' />,
      value: `${data?.completionPercent ?? 0}%`,
      label: 'Tiến độ'
    }
  );

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-3 gap-2 sm:grid-cols-6'
          : 'grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8'
      }
    >
      {stats.map(item => (
        <StatItem key={item.label} {...item} />
      ))}
    </div>
  );
}
