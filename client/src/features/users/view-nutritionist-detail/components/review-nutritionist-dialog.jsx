import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Spinner } from '~/components/ui/spinner';
import { useSubmitNutritionistReview, useMyNutritionistReview } from '../api/view-nutritionist-detail';

export function ReviewNutritionistDialog({ nutritionistId, classId, asChild, children }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: myReview, isLoading: isFetchingReview } = useMyNutritionistReview(nutritionistId);

  useEffect(() => {
    if (open && myReview) {
      setRating(myReview.rating || 0);
      setComment(myReview.comment || '');
    } else if (open && !myReview) {
      setRating(0);
      setComment('');
    }
  }, [open, myReview]);

  const { mutate: submitReview, isPending } = useSubmitNutritionistReview({
    id: nutritionistId,
    onSuccess: () => {
      setOpen(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    submitReview({ classId, rating, comment });
  };

  const isUpdating = !!myReview;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>
        {children || <Button>Đánh giá chuyên gia</Button>}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Đánh giá chuyên gia</DialogTitle>
        </DialogHeader>
        {isFetchingReview ? (
          <div className='flex justify-center py-8'><Spinner /></div>
        ) : (
          <form onSubmit={handleSubmit} className='mt-4 space-y-6'>
            <div className='flex flex-col items-center gap-2'>
              <p className='text-sm font-medium'>Vui lòng chọn số sao (1-10)</p>
              <div className='flex items-center gap-1'>
                {[...Array(10)].map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type='button'
                      className='focus:outline-none transition-transform hover:scale-110'
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          value <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {rating > 0 && (
                <span className='text-sm font-bold text-amber-500 mt-1'>{rating} sao</span>
              )}
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium'>Bình luận</p>
              <Textarea
                placeholder='Chia sẻ trải nghiệm của bạn với chuyên gia này...'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                className='resize-none'
              />
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={rating === 0 || !comment.trim() || isPending}>
                {isPending && <Spinner className='mr-2 h-4 w-4' />}
                {isUpdating ? 'Xác nhận thay đổi' : 'Gửi đánh giá'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}