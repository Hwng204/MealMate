import { useRef, useState } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Spinner } from '~/components/ui/spinner';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const MAX_PHOTOS = 10;

const fetchPhotos = async ({ classId, memberId, asNutritionist }) => {
  const url = asNutritionist
    ? `/api/classes/${classId}/members/${memberId}/progress-photos`
    : `/api/classes/${classId}/progress-photos`;
  const response = await apiClient.get(url);
  return response.data.data;
};

const uploadPhotos = async ({ classId, files }) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  const response = await apiClient.post(
    `/api/classes/${classId}/progress-photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export default function ClassMemberPhotosSection({
  classId,
  memberId,
  canUpload = false,
  asNutritionist = false
}) {
  const inputRef = useRef(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const queryClient = useQueryClient();

  const photoKey = QUERY_KEYS.CLASS_MEMBER_PHOTOS(classId, memberId, asNutritionist);

  const { data, isLoading } = useQuery({
    queryKey: photoKey,
    queryFn: () => fetchPhotos({ classId, memberId, asNutritionist })
  });

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: files => uploadPhotos({ classId, files }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKey });
    }
  });

  const images = data?.images || [];
  const remaining = MAX_PHOTOS - images.length;
  const preview = images[0];

  const handleFileChange = event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    upload(files.slice(0, remaining));
    event.target.value = '';
  };

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
          <CardTitle className='text-base'>Ảnh tiến độ</CardTitle>
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
          ) : preview ? (
            <button
              type='button'
              onClick={() => setGalleryOpen(true)}
              className='group relative block w-full max-w-[200px] overflow-hidden rounded-xl border'
            >
              <img
                src={preview.url}
                alt='Ảnh tiến độ'
                className='aspect-square w-full object-cover transition group-hover:scale-105'
              />
              {images.length > 1 && (
                <span className='absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white'>
                  +{images.length - 1}
                </span>
              )}
            </button>
          ) : (
            <div className='flex h-28 max-w-[200px] flex-col items-center justify-center rounded-xl border border-dashed text-center text-xs text-muted-foreground'>
              <ImageIcon className='mb-2 h-6 w-6' />
              {canUpload
                ? 'Chưa có ảnh. Chụp ảnh để gửi cho PT.'
                : 'Học viên chưa gửi ảnh.'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Ảnh tiến độ ({images.length})</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-5 gap-3'>
            {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
              const img = images[index];
              return (
                <div
                  key={img?.url || `empty-${index}`}
                  className='aspect-square overflow-hidden rounded-lg border bg-muted'
                >
                  {img ? (
                    <img
                      src={img.url}
                      alt={`Ảnh ${index + 1}`}
                      className='h-full w-full object-cover'
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
