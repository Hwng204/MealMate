import { Activity, CheckCircle2, Dumbbell, Ruler, Scale, UtensilsCrossed } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

import StudentWeightSection from './student-weight-section';

const statItems = ({ weight, height, bmi, data }) => [
  {
    icon: <Scale className='h-4 w-4' />,
    value: weight ? `${weight} kg` : '--',
    label: 'Cân nặng'
  },
  {
    icon: <Ruler className='h-4 w-4' />,
    value: height ? `${height} cm` : '--',
    label: 'Chiều cao'
  },
  {
    icon: <Activity className='h-4 w-4' />,
    value: bmi || '--',
    label: 'BMI'
  },
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
];

const StatCard = ({ icon, value, label }) => (
  <div className='rounded-3xl border border-border/70 bg-muted/30 px-3 py-3 text-center'>
    <div className='mb-2 flex items-center justify-center text-primary'>{icon}</div>
    <div className='text-sm font-semibold leading-tight text-foreground'>
      {value}
    </div>
    <div className='text-[10px] uppercase tracking-[0.12em] text-muted-foreground'>
      {label}
    </div>
  </div>
);

export default function StudentProfileWeightPanel({
  classId,
  memberId,
  member,
  progressData,
  weight,
  bmi,
  bmr,
  canEditWeight = true
}) {
  return (
    <Card>
      <CardContent className='grid gap-6 p-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:p-5'>
        <div className='flex flex-col gap-5'>
          <div className='flex items-center gap-4 lg:items-start'>
            <Avatar className='h-16 w-16 shrink-0 lg:h-20 lg:w-20'>
              <AvatarImage src={member.avatar} />
              <AvatarFallback>
                {member.name?.slice(0, 2)?.toUpperCase() || 'HV'}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='truncate text-lg font-bold'>{member.name}</h1>
                <Badge variant='secondary' className='text-xs'>
                  Đang tập
                </Badge>
              </div>
              <p className='truncate text-sm text-muted-foreground'>
                {member.email}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3'>
            {statItems({
              weight,
              height: member.height,
              bmi,
              data: progressData
            }).map(item => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>
        </div>

        <StudentWeightSection
          classId={classId}
          memberId={memberId}
          weightRecord={progressData.weightRecord}
          latestWeight={progressData.latestWeight}
          canEdit={canEditWeight}
          embedded
        />
      </CardContent>
    </Card>
  );
}
