import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';

import ClassProgressStats from './class-progress-stats';
import StudentWeightSection from './student-weight-section';

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
      <CardContent className='grid gap-6 p-4 lg:grid-cols-[minmax(0,240px)_1fr_1.1fr] lg:items-start lg:p-5'>
        <div className='flex items-center gap-4 lg:flex-col lg:items-start lg:text-left'>
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

        <ClassProgressStats
          data={progressData}
          member={member}
          weight={weight}
          bmi={bmi}
          bmr={bmr}
          compact
        />

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
