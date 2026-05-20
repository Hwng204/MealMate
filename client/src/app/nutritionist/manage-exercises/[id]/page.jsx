import { Suspense } from 'react';
import { useParams } from 'react-router';

import ExerciseDetail from '~/features/exercises/view-exercise-detail/admin/exercise-detail';
import ExerciseDetailSkeleton from '~/features/exercises/view-exercise-detail/admin/exercise-detail-skeleton';

const ExerciseDetailContent = () => {
  const { id } = useParams();

  return <ExerciseDetail id={id} backPath='/nutritionist/manage-exercises' />;
};

const Page = () => (
  <div className='container mx-auto px-4 py-8'>
    <Suspense fallback={<ExerciseDetailSkeleton />}>
      <ExerciseDetailContent />
    </Suspense>
  </div>
);

export default Page;
