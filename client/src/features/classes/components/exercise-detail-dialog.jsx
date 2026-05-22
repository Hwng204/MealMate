import { useQuery } from '@tanstack/react-query';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import {
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineLightningBolt,
  HiOutlinePlay
} from 'react-icons/hi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Spinner } from '~/components/ui/spinner';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';
import { formatInstructions, getPreviewImage, isGifUrl } from '~/lib/utils';

const fetchExercise = async id => {
  const response = await apiClient.get(`/api/exercises/${id}`);
  return response.data.data;
};

export default function ExerciseDetailDialog({ exerciseId, open, onOpenChange }) {
  const { data: exercise, isLoading } = useQuery({
    queryKey: QUERY_KEYS.EXERCISE(exerciseId),
    queryFn: () => fetchExercise(exerciseId),
    enabled: Boolean(exerciseId) && open
  });

  const isGif = exercise ? isGifUrl(exercise.tutorial) : false;
  const preview = exercise ? getPreviewImage(exercise.tutorial) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        {isLoading || !exercise ? (
          <div className='flex h-40 items-center justify-center'>
            <Spinner />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='pr-8 text-left text-xl font-bold'>
                {exercise.name}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-6'>
              <div className='relative overflow-hidden rounded-2xl border border-border bg-muted'>
                <img
                  src={preview || '/logo2.png'}
                  alt={exercise.name}
                  loading='lazy'
                  decoding='async'
                  className='h-64 w-full object-cover transition-transform duration-500 hover:scale-105'
                  onMouseEnter={e => {
                    if (isGif) e.currentTarget.src = exercise.tutorial;
                  }}
                  onMouseLeave={e => {
                    if (isGif) e.currentTarget.src = preview;
                  }}
                />
                <div className='absolute bottom-3 left-3'>
                  <span className='flex items-center gap-2 rounded-lg bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground backdrop-blur'>
                    <HiOutlinePlay className='text-xs' />
                    Video hướng dẫn
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <span className='rounded-md bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase text-orange-600'>
                  {exercise.difficulty || 'Trung bình'}
                </span>

                <span className='rounded-md bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase text-blue-600'>
                  {exercise.type}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-2 rounded-xl border border-border bg-card p-4'>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Kiểu ghi chép
                  </p>
                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='rounded-lg bg-muted p-2 text-primary'>
                      {exercise.logType === 'Thời gian' ? (
                        <HiOutlineClock size={16} />
                      ) : (
                        <GiWeightLiftingUp size={16} />
                      )}
                    </div>
                    <span className='text-sm'>{exercise.logType}</span>
                  </div>
                </div>

                <div className='flex flex-col gap-2 rounded-xl border border-border bg-card p-4'>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Cường độ
                  </p>
                  <div className='flex items-center gap-3 font-semibold'>
                    <div className='rounded-lg bg-muted p-2 text-orange-500'>
                      <HiOutlineLightningBolt size={16} />
                    </div>
                    <span className='text-sm'>High Intensity</span>
                  </div>
                </div>
              </div>

              {exercise.instructions && (
                <section className='space-y-3 rounded-2xl border border-border bg-card p-5'>
                  <h3 className='flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground'>
                    <HiOutlineFire className='text-lg text-primary' />
                    Hướng dẫn thực hiện
                  </h3>
                  <div className='whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
                    {formatInstructions(exercise.instructions)}
                  </div>
                </section>
              )}

              {exercise.muscles?.length > 0 && (
                <section className='space-y-3 rounded-2xl border border-border bg-card p-5'>
                  <h3 className='flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground'>
                    <GiMuscleUp className='text-lg text-primary' />
                    Nhóm cơ tác động
                  </h3>
                  <div className='space-y-2'>
                    {exercise.muscles.map(muscle => (
                      <div
                        key={muscle._id}
                        className='flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-3'
                      >
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-background p-1'>
                          <img
                            src={muscle.image || '/logo2.png'}
                            alt={muscle.name}
                            className='h-full w-full object-contain'
                          />
                        </div>
                        <span className='text-sm font-semibold'>{muscle.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
