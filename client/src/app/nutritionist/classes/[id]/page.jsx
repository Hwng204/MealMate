import { Suspense, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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
import { Progress } from '~/components/ui/progress';
import { Spinner } from '~/components/ui/spinner';
import {
  useAddClassMember,
  useClassDetail,
  useClassMembers,
  useDeleteClass,
  useRemoveClassMember
} from '~/features/classes/api/classes';

const AddMemberDialog = ({ classId, onMemberAdded }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { mutate, isPending } = useAddClassMember({
    classId,
    onSuccess: () => {
      setEmail('');
      setOpen(false);
      onMemberAdded?.();
    }
  });

  const handleSubmit = event => {
    event.preventDefault();
    mutate({ email });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Thêm học viên
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>Thêm học viên vào lớp</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='memberEmail'>Email học viên</Label>
            <Input
              id='memberEmail'
              type='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder='hocvien@example.com'
              required
            />
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isPending}>
              {isPending && <Spinner className='mr-2 h-4 w-4' />}
              Thêm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ClassDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [nutritionAnalysisOpen, setNutritionAnalysisOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { data: classDetail } = useClassDetail(id);
  const { data: memberData, refetch: refetchMembers } = useClassMembers(id, { limit: 100 });
  const { mutate: removeMember, isPending: isRemoving } = useRemoveClassMember({
    classId: id
  });
  const { mutate: deleteClass, isPending: isDeleting } = useDeleteClass({
    onSuccess: () => navigate('/nutritionist/classes')
  });

  const members = memberData?.docs || [];
  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeCount = filteredMembers.length;

  const handleDeleteClass = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteClass(id);
    setDeleteConfirmOpen(false);
  };

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/nutritionist/classes')}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Quay lại danh sách
      </Button>

      <div className='grid gap-6 xl:grid-cols-[1fr_320px]'>
        <div className='space-y-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Danh sách học viên ({activeCount})</CardTitle>
              <div className='flex items-center gap-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Tìm kiếm theo tên học viên...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10 w-72'
                  />
                </div>
                <AddMemberDialog classId={id} onMemberAdded={refetchMembers} />
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {filteredMembers.map(member => {
                  const progress = member.completionPercent ?? 0;
                  return (
                    <div
                      key={member._id}
                      className='grid gap-4 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name?.slice(0, 2)?.toUpperCase() || 'HV'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/nutritionist/classes/${id}/students/${member._id}`}
                            className='font-medium hover:underline'
                          >
                            {member.name}
                          </Link>
                          <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                            <Mail className='h-3.5 w-3.5' />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant='secondary' className='w-fit'>
                        Đang tập
                      </Badge>
                      <div className='min-w-40'>
                        <div className='mb-1 flex justify-between text-xs'>
                          <span>Tiến độ</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                       <div className='flex items-center gap-1'>
                         <Button asChild variant='outline' size='sm'>
                           <Link
                             to={`/nutritionist/classes/${id}/students/${member._id}`}
                           >
                             Xem
                           </Link>
                         </Button>
                         <Button
                           variant='outline'
                           size='sm'
                           onClick={() => {
                             setSelectedMember(member);
                             setNutritionAnalysisOpen(true);
                           }}
                         >
                           Phân tích dinh dưỡng
                         </Button>
                         <Button
                           variant='ghost'
                           size='icon'
                           disabled={isRemoving}
                           onClick={() => {
                             if (
                               window.confirm(
                                 'Bạn có chắc chắn muốn xóa học viên này khỏi lớp không?'
                               )
                             ) {
                               removeMember(member._id);
                             }
                           }}
                           title='Xóa học viên'
                         >
                           <Trash2 className='h-4 w-4 text-destructive' />
                         </Button>
                       </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin lớp học</CardTitle>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-bold'>{classDetail.className}</h1>
                <Badge>{classDetail.isActive ? 'Đang mở' : 'Đã đóng'}</Badge>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {classDetail.description || 'Chưa có mô tả lớp học.'}
              </p>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div>
                <div className='text-muted-foreground'>Mã lớp</div>
                <div className='mt-1 flex items-center gap-2 rounded-md border px-3 py-2'>
                  <span className='font-semibold tracking-wide'>
                    {classDetail.classCode}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='ml-auto h-7 w-7'
                    onClick={() =>
                      navigator.clipboard?.writeText(classDetail.classCode)
                    }
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid grid-cols-12 gap-3 text-sm'>
                <div className='col-span-6 rounded-md border p-3'>
                  <Users className='mb-2 h-4 w-4 text-primary' />
                  <div className='font-semibold'>{activeCount}</div>
                  <div className='text-muted-foreground'>Học viên</div>
                </div>
                <div className='col-span-6 rounded-md border p-3'>
                  <CalendarDays className='mb-2 h-4 w-4 text-primary' />
                  <div className='font-semibold'>Theo cá nhân</div>
                  <div className='text-muted-foreground'>Lịch trình</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' className='w-full justify-start'>
                <MoreHorizontal className='mr-2 h-4 w-4' />
                Gửi thông báo đến lớp
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <CalendarDays className='mr-2 h-4 w-4' />
                Chia sẻ lịch tập
              </Button>
              <Button
                variant='destructive'
                className='w-full justify-start'
                onClick={handleDeleteClass}
                disabled={isDeleting}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Kết thúc lớp học
              </Button>
            </CardContent>
          </Card>
        </aside>
       </div>
       <Dialog open={nutritionAnalysisOpen} onOpenChange={setNutritionAnalysisOpen}>
         <DialogContent className='w-96'>
           <DialogHeader>
             <DialogTitle>Phân tích dinh dưỡng cho {selectedMember?.name}</DialogTitle>
           </DialogHeader>
           <div className='space-y-4'>
             <p>Chi tiết phân tích dinh dưỡng sẽ được hiển thị ở đây.</p>
           </div>
           <DialogFooter>
             <Button onClick={() => setNutritionAnalysisOpen(false)}>Đóng</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Xác nhận kết thúc lớp học</DialogTitle>
           </DialogHeader>
           <div className='space-y-4'>
             <p>Bạn có chắc chắn muốn xóa lớp học này không?</p>
             <p className='text-sm text-muted-foreground'>Hành động này không thể được hoàn tác.</p>
           </div>
           <DialogFooter>
             <Button variant='outline' onClick={() => setDeleteConfirmOpen(false)}>
               Hủy
             </Button>
             <Button
               variant='destructive'
               onClick={handleConfirmDelete}
               disabled={isDeleting}
             >
               {isDeleting && <Spinner className='mr-2 h-4 w-4' />}
               Xóa
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
};

const Page = () => (
  <Suspense
    fallback={
      <div className='flex h-60 items-center justify-center'>
        <Spinner />
      </div>
    }
  >
    <ClassDetailContent />
  </Suspense>
);

export default Page;