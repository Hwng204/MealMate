import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import ClassMemberPhotosSection from '~/features/classes/components/class-member-photos-section';
import StudentProfileWeightPanel from '~/features/classes/components/student-profile-weight-panel';
import { useClassMemberProgress } from '~/features/classes/api/classes';
import NutritionistSchedulePanel from '~/features/schedule/view-schedule/components/nutritionist-schedule-panel';

const calculateAge = (dob) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const StudentDetailContent = () => {
  const { id: classId, memberId } = useParams();
  const navigate = useNavigate();
  const { data } = useClassMemberProgress(classId, memberId);

  const member = data.member;
  const weight = data.latestWeight?.weight;
  const height = member.height;
  const age = calculateAge(member.dob);
  const gender = member.gender;

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
    <div className='space-y-5'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate(`/nutritionist/classes/${classId}`)}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Quay lại lớp
      </Button>

      <StudentProfileWeightPanel
        classId={classId}
        memberId={memberId}
        member={member}
        progressData={data}
        weight={weight}
        bmi={bmi}
        bmr={bmr}
        canEditWeight
      />

      <ClassMemberPhotosSection
        classId={classId}
        memberId={memberId}
        asNutritionist
      />

      <section className='space-y-3'>
        <h2 className='text-lg font-bold'>Lịch trình học viên</h2>
        <NutritionistSchedulePanel userId={memberId} memberProfile={member} />
      </section>
    </div>
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
    <StudentDetailContent />
  </Suspense>
);

export default Page;
