import { Suspense, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, KeyRound, Users } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { useJoinClass, useMyClasses } from '~/features/classes/api/classes';

const JoinClassForm = () => {
  const [classCode, setClassCode] = useState('');
  const { mutate, isPending } = useJoinClass({
    onSuccess: () => setClassCode('')
  });

  const handleSubmit = event => {
    event.preventDefault();
    mutate(classCode.trim().toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tham gia lớp học</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:flex-row'>
          <div className='relative flex-1'>
            <KeyRound className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={classCode}
              onChange={event => setClassCode(event.target.value)}
              className='pl-9 uppercase'
              placeholder='Nhập mã lớp'
              required
            />
          </div>
          <Button type='submit' disabled={isPending}>
            {isPending && <Spinner className='mr-2 h-4 w-4' />}
            Tham gia
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const MyClasses = () => {
  const { data } = useMyClasses({ limit: 50, sort: '-createdAt' });
  const classes = data?.docs || [];

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {classes.map(item => (
        <Card key={item._id}>
          <CardHeader>
            <div className='flex items-start justify-between gap-3'>
              <CardTitle className='line-clamp-2 text-lg'>
                {item.className}
              </CardTitle>
              <Badge>{item.isActive ? 'Đang học' : 'Đã đóng'}</Badge>
            </div>
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {item.description || 'Chưa có mô tả'}
            </p>
          </CardHeader>
          <CardContent className='space-y-3 border-t pt-4'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              {item.members?.length || 0} học viên
            </div>
            <span className='font-medium text-foreground'>{item.classCode}</span>
            </div>
            <Button asChild size='sm' className='w-full'>
              <Link to={`/classes/${item._id}`}>Xem lớp</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      {classes.length === 0 && (
        <div className='col-span-full rounded-lg border border-dashed p-10 text-center'>
          <BookOpen className='mx-auto h-10 w-10 text-muted-foreground' />
          <h3 className='mt-3 font-semibold'>Bạn chưa tham gia lớp nào</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Nhập mã lớp do chuyên gia cung cấp để tham gia.
          </p>
        </div>
      )}
    </div>
  );
};

const Page = () => (
  <main className='container mx-auto max-w-6xl space-y-6 px-4 py-8'>
    <div>
      <h1 className='text-2xl font-bold'>Lớp học của tôi</h1>
      <p className='text-sm text-muted-foreground'>
        Tham gia lớp học bằng mã lớp và theo dõi kế hoạch từ chuyên gia.
      </p>
    </div>
    <JoinClassForm />
    <Suspense
      fallback={
        <div className='flex h-40 items-center justify-center'>
          <Spinner />
        </div>
      }
    >
      <MyClasses />
    </Suspense>
  </main>
);

export default Page;
