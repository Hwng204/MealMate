import { Suspense } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import ClassMemberPhotosSection from '~/features/classes/components/class-member-photos-section';
import ClassProgressStats from '~/features/classes/components/class-progress-stats';
import StudentWeightSection from '~/features/classes/components/student-weight-section';
import { useClassDetail, useMyClassProgress } from '~/features/classes/api/classes';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

const calculateAge = dob => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const ClassDetailContent = () => {
  const { id: classId } = useParams();
  const { data: classDetail } = useClassDetail(classId);
  const { data: progress } = useMyClassProgress(classId);
  const { data: profile } = useProfileForPage();

  const member = progress.member;
  const weight = progress.latestWeight?.weight;
  const height = member?.height ?? profile?.height;
  const age = calculateAge(member?.dob ?? profile?.dob);
  const gender = member?.gender ?? profile?.gender;

  const bmi =
    weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : '--';

  let bmr = '--';
  if (weight && height && age && gender) {
    if (gender === 'Nam') {
      bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5).toString();
    } else {
      bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161).toString();
    }
  }

  return (
    <main className='container mx-auto max-w-5xl space-y-5 px-4 py-8'>
      <Button variant='ghost' size='sm' asChild>
        <Link to='/classes'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Lớp học của tôi
        </Link>
      </Button>

      <Card>
        <CardHeader className='pb-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <CardTitle>{classDetail.className}</CardTitle>
            <Badge>{classDetail.isActive ? 'Đang học' : 'Đã đóng'}</Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {classDetail.description || 'Lớp học với chuyên gia dinh dưỡng'}
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ClassProgressStats
            data={progress}
            member={member}
            weight={weight}
            bmi={bmi}
            bmr={bmr}
            compact
          />
          <StudentWeightSection
            classId={classId}
            memberId={member._id}
            weightRecord={progress.weightRecord}
            latestWeight={progress.latestWeight}
            canEdit={false}
            embedded
          />
        </CardContent>
      </Card>

      <ClassMemberPhotosSection
        classId={classId}
        memberId={member._id}
        canUpload
      />
    </main>
  );
};

const Page = () => (
  <Suspense
    fallback={
      <div className='flex h-60 items-center justify-center'>
        <Spinner />
      </div>
    }
  >
    <ClassDetailContent />
  </Suspense>
);

export default Page;
