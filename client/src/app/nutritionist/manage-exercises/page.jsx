import { Suspense } from 'react';

import ExercisesFilter from '~/features/exercises/view-exercises/admin/exercise-filter';
import ExercisesTableSkeleton from '~/features/exercises/view-exercises/admin/exercise-table-skeleton';
import ExercisesTable from '~/features/exercises/view-exercises/admin/exercises-table';

const Page = () => (
  <div className='space-y-4'>
    <ExercisesFilter createPath='/nutritionist/manage-exercises/create-exercise' />
    <Suspense fallback={<ExercisesTableSkeleton />}>
      <ExercisesTable viewDetailPath='/nutritionist/manage-exercises' />
    </Suspense>
  </div>
);

export default Page;
