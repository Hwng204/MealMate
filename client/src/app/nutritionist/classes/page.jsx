import { Suspense, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Copy, Plus, Users } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { useClasses, useCreateClass } from '~/features/classes/api/classes';

const CreateClassDialog = () => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate, isPending, error } = useCreateClass({
    onSuccess: () => {
      setClassName('');
      setDescription('');
      setOpen(false);
    }
  });

  const handleSubmit = event => {
    event.preventDefault();
    if (!className.trim()) {
      return;
    }
    mutate({ className: className.trim(), description: description.trim() });
  };

  const errorMessage = error?.response?.data?.message || '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Tạo lớp học mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>Tạo lớp học mới</DialogTitle>
          </DialogHeader>
          {errorMessage && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {errorMessage}
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='className'>Tên lớp</Label>
            <Input
              id='className'
              value={className}
              onChange={event => setClassName(event.target.value)}
              placeholder='Giảm mỡ 12 tuần - Nhóm A'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id='description'
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder='Mục tiêu, lịch học, ghi chú cho lớp'
            />
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isPending || !className.trim()}>
              {isPending && <Spinner className='mr-2 h-4 w-4' />}
              Tạo lớp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ClassesContent = () => {
  const { data } = useClasses({ limit: 50, sort: '-createdAt' });
  const classes = data?.docs || [];

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {classes.map(item => (
        <Card key={item._id} className='overflow-hidden'>
          <CardHeader className='space-y-3'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <CardTitle className='line-clamp-2 text-lg'>
                  {item.className}
                </CardTitle>
                <p className='mt-1 text-sm text-muted-foreground line-clamp-2'>
                  {item.description || 'Chưa có mô tả'}
                </p>
              </div>
              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                {item.isActive ? 'Đang mở' : 'Đã đóng'}
              </Badge>
            </div>
            <div className='flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm'>
              <span className='font-medium tracking-wide'>{item.classCode}</span>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='ml-auto h-7 w-7'
                onClick={() => navigator.clipboard?.writeText(item.classCode)}
                title='Sao chép mã lớp'
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='flex items-center justify-between border-t pt-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Users className='h-4 w-4' />
              {item.members?.length || 0} học viên
            </div>
            <Button asChild variant='outline' size='sm'>
              <Link to={`/nutritionist/classes/${item._id}`}>Chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      {classes.length === 0 && (
        <div className='col-span-full rounded-lg border border-dashed p-10 text-center'>
          <BookOpen className='mx-auto h-10 w-10 text-muted-foreground' />
          <h3 className='mt-3 font-semibold'>Chưa có lớp học</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Tạo lớp đầu tiên để cấp mã lớp cho học viên tham gia.
          </p>
        </div>
      )}
    </div>
  );
};

const Page = () => (
  <div className='space-y-6'>
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h1 className='text-2xl font-bold'>Lớp học</h1>
        <p className='text-sm text-muted-foreground'>
          Quản lý lớp, mã tham gia và danh sách học viên.
        </p>
      </div>
      <CreateClassDialog />
    </div>

    <Suspense
      fallback={
        <div className='flex h-40 items-center justify-center'>
          <Spinner />
        </div>
      }
    >
      <ClassesContent />
    </Suspense>
  </div>
);

export default Page;
