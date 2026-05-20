import { useQuery } from '@tanstack/react-query';
import { FaCarrot, FaClock, FaFireAlt, FaListOl, FaUtensils } from 'react-icons/fa';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Spinner } from '~/components/ui/spinner';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';
import { findByLabel } from '~/lib/utils';

const fetchDish = async id => {
  const response = await apiClient.get(`/api/dishes/${id}`);
  return response.data.data;
};

export default function DishDetailDialog({ dishId, open, onOpenChange }) {
  const { data: dish, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DISH(dishId),
    queryFn: () => fetchDish(dishId),
    enabled: Boolean(dishId) && open
  });

  const totalCalories =
    findByLabel(dish?.nutrition?.nutrients, 'Năng lượng')?.value ?? 0;
  const totalTime = (dish?.preparationTime ?? 0) + (dish?.cookTime ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        {isLoading || !dish ? (
          <div className='flex h-40 items-center justify-center'>
            <Spinner />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='pr-8 text-left text-xl font-bold'>
                {dish.name}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-6'>
              <div className='flex gap-4'>
                <img
                  src={dish.image || '/logo2.png'}
                  alt={dish.name}
                  className='h-28 w-28 shrink-0 rounded-2xl object-cover'
                />
                <div className='min-w-0 flex-1 space-y-2'>
                  {dish.description && (
                    <p className='text-sm italic text-muted-foreground'>
                      {dish.description}
                    </p>
                  )}
                  <div className='flex flex-wrap gap-3 text-xs font-semibold'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-orange-700'>
                      <FaFireAlt />
                      {totalCalories} kcal
                    </span>
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700'>
                      <FaClock />
                      {totalTime} phút
                    </span>
                    <span className='inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700'>
                      <FaUtensils />
                      {dish.servings ?? 0} phần
                    </span>
                  </div>
                </div>
              </div>

              {dish.ingredients?.length > 0 && (
                <section className='space-y-3'>
                  <h3 className='flex items-center gap-2 text-base font-bold'>
                    <FaCarrot className='text-orange-500' />
                    Nguyên liệu
                  </h3>
                  <ul className='grid gap-2 sm:grid-cols-2'>
                    {dish.ingredients.map(item => {
                      const unit = item.units?.find(u => u.isDefault);
                      return (
                        <li
                          key={item._id}
                          className='flex items-center gap-3 rounded-xl border bg-muted/30 p-3'
                        >
                          <img
                            src={item.image || '/logo2.png'}
                            alt={item.name}
                            className='h-10 w-10 rounded-lg object-cover'
                          />
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold'>
                              {item.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {unit?.quantity ?? '-'} {unit?.unit ?? ''}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {dish.instructions?.length > 0 && (
                <section className='space-y-3'>
                  <h3 className='flex items-center gap-2 text-base font-bold'>
                    <FaListOl className='text-sky-600' />
                    Cách chế biến
                  </h3>
                  <ol className='space-y-3'>
                    {dish.instructions.map((step, idx) => (
                      <li
                        key={step._id || idx}
                        className='flex gap-3 rounded-xl border bg-muted/20 p-3'
                      >
                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                          {idx + 1}
                        </span>
                        <p className='text-sm leading-relaxed'>
                          {step.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
