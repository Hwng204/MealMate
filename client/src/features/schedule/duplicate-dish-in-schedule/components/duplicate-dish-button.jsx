import { HiOutlineDuplicate } from 'react-icons/hi';
import { useDuplicateDishSchedule } from '../api/duplicate-dish-schedule';

export default function DuplicateDishButton({ scheduleId, mealType, dishId }) {
  const { mutate: duplicateDish, isPending } = useDuplicateDishSchedule();

  const handleDuplicate = () => {
    duplicateDish({
      scheduleId,
      mealType,
      dishId,
    });
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={isPending}
      className='flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow transition hover:scale-110 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
      title='Sao chép món ăn'
    >
      {isPending ? (
        <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
      ) : (
        <HiOutlineDuplicate size={14} />
      )}
    </button>
  );
}
