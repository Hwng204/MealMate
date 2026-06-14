import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useNutritionistReviews } from '../api/view-nutritionist-detail';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';

export function NutritionistReviews({ id }) {
  const [page, setPage] = useState(1);
  const { data } = useNutritionistReviews(id, { page, limit: 10, sort: '-createdAt' });

  const reviews = data?.docs || [];
  const stats = data?.stats || { avgRating: 0, totalReviews: 0 };
  const { hasNextPage, hasPrevPage, totalPages } = data || {};

  return (
    <div className='mt-8 rounded-[32px] border border-border/70 bg-card shadow-[0_20px_60px_rgba(15,23,42,0.06)] p-6 md:p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-500'>
            <Star className='h-6 w-6 fill-current' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>Đánh giá học viên</h2>
            <div className='flex items-center gap-2 mt-1'>
              <span className='font-bold text-xl text-amber-500'>{stats.avgRating.toFixed(1)}/10</span>
              <span className='text-sm text-muted-foreground'>({stats.totalReviews} đánh giá)</span>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className='space-y-4'>
          {reviews.map(review => (
            <div key={review._id} className='rounded-2xl border border-border/70 bg-background p-5'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={review.userId?.avatar} />
                    <AvatarFallback>{review.userId?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold text-foreground'>{review.userId?.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1 text-amber-500'>
                  <Star className='h-4 w-4 fill-current' />
                  <span className='font-bold'>{review.rating}/10</span>
                </div>
              </div>
              <p className='mt-4 text-foreground/90 leading-relaxed whitespace-pre-wrap'>
                {review.comment}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className='flex justify-center gap-2 mt-6'>
              <Button
                variant='outline'
                disabled={!hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                Trước
              </Button>
              <div className='flex items-center px-4'>
                Trang {page} / {totalPages}
              </div>
              <Button
                variant='outline'
                disabled={!hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <MessageSquare className='h-12 w-12 text-muted-foreground/30 mb-4' />
          <p className='font-medium text-foreground'>Chưa có đánh giá nào</p>
          <p className='text-sm text-muted-foreground mt-1'>
            Chuyên gia này chưa nhận được đánh giá từ học viên.
          </p>
        </div>
      )}
    </div>
  );
}