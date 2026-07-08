import { useRef, useState } from 'react';
import { Camera, ImageIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '~/components/ui/dialog';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Spinner } from '~/components/ui/spinner';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';
import { cn } from '~/lib/utils';

const MAX_PHOTOS = 10;

const fetchPhotos = async ({ classId, memberId, asNutritionist, dateStr }) => {
  const url = asNutritionist
    ? `/api/classes/${classId}/members/${memberId}/progress-photos`
    : `/api/classes/${classId}/progress-photos`;
  const response = await apiClient.get(url, { params: { date: dateStr } });
  return response.data.data;
};

const uploadPhotos = async ({ classId, files, dateStr }) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  const response = await apiClient.post(
    `/api/classes/${classId}/progress-photos`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { date: dateStr }
    }
  );
  return response.data.data;
};

function ImageGallery({ open, onOpenChange, images, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const goToPrevious = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl p-0'>
        <div className='relative'>
          <AnimatePresence initial={false} mode='wait'>
            <motion.img
              key={currentImage._id}
              src={currentImage.url}
              alt={`Ảnh ${currentIndex + 1}`}
              className='h-auto w-full max-h-[80vh] object-contain'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          <div className='absolute inset-0 flex items-center justify-between'>
            <Button variant='ghost' size='icon' onClick={goToPrevious} className='m-2 bg-black/30 text-white hover:bg-black/50'>
              <ChevronLeft className='h-6 w-6' />
            </Button>
            <Button variant='ghost' size='icon' onClick={goToNext} className='m-2 bg-black/30 text-white hover:bg-black/50'>
              <ChevronRight className='h-6 w-6' />
            </Button>
          </div>
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white'>
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function ClassMemberPhotosSection({
  classId,
  memberId,
  canUpload = false,
  asNutritionist = false
}) {
  const inputRef = useRef(null);
  const [galleryState, setGalleryState] = useState({ open: false, index: 0 });
  const [date, setDate] = useState(new Date());
  const queryClient = useQueryClient();

  const dateStr = format(date, 'yyyy-MM-dd');
  const photoKey = QUERY_KEYS.CLASS_MEMBER_PHOTOS(classId, memberId, asNutritionist, dateStr);

  const { data, isLoading } = useQuery({
    queryKey: photoKey,
    queryFn: () => fetchPhotos({ classId, memberId, asNutritionist, dateStr })
  });

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: files => uploadPhotos({ classId, files, dateStr }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKey });
      toast.success('Tải ảnh lên thành công');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Tải ảnh lên thất bại. File ảnh có thể quá lớn.');
    }
  });

  const images = data?.images || [];
  const remaining = MAX_PHOTOS - images.length;

  const handleFileChange = event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    upload(files.slice(0, remaining));
    event.target.value = '';
  };

  const openGallery = (index) => {
    setGalleryState({ open: true, index });
  };

  return (
    <>
      <Card>
        <CardHeader className='flex flex-col space-y-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div className='flex items-center gap-4'>
            <CardTitle className='text-base'>Ảnh tiến độ</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className={cn(
                    'w-[130px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {date ? format(date, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={date}
                  onSelect={d => d && setDate(d)}
                  initialFocus
                  disabled={(d) => d > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          {canUpload && remaining > 0 && (
            <>
              <input
                ref={inputRef}
                type='file'
                accept='image/*'
                capture='environment'
                multiple
                className='hidden'
                onChange={handleFileChange}
              />
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                {isUploading ? (
                  <Spinner className='mr-2 h-4 w-4' />
                ) : (
                  <Camera className='mr-2 h-4 w-4' />
                )}
                Chụp / tải ({remaining} còn lại)
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex h-28 items-center justify-center'>
              <Spinner />
            </div>
          ) : images.length > 0 ? (
            <div className='flex space-x-3 overflow-x-auto pb-2'>
              {images.map((img, index) => (
                <button
                  key={img._id}
                  type='button'
                  onClick={() => openGallery(index)}
                  className='group relative block w-28 h-28 shrink-0 overflow-hidden rounded-xl border'
                >
                  <img
                    src={img.url}
                    alt={`Ảnh tiến độ ${index + 1}`}
                    className='aspect-square w-full h-full object-cover transition group-hover:scale-105'
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className='flex h-28 max-w-full flex-col items-center justify-center rounded-xl border border-dashed text-center text-xs text-muted-foreground'>
              <ImageIcon className='mb-2 h-6 w-6' />
              {canUpload
                ? 'Chưa có ảnh trong ngày này.'
                : 'Học viên chưa gửi ảnh ngày này.'}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ImageGallery
        open={galleryState.open}
        onOpenChange={(isOpen) => setGalleryState({ open: isOpen, index: 0 })}
        images={images}
        startIndex={galleryState.index}
      />
    </>
  );
}
