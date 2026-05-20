import CreateExerciseForm from '~/features/exercises/create-exercise/components/admin/create-exercise-form';

const Page = () => (
  <div className='container mx-auto px-4 py-8'>
    <CreateExerciseForm backPath='/nutritionist/manage-exercises' />
  </div>
);

export default Page;
