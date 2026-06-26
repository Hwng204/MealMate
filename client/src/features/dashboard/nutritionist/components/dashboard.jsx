import {
  AlertCircle,
  BookText,
  ChefHat,
  Eye,
  RefreshCw,
  School,
  Sparkles,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { useNutritionistDashboard } from '~/features/dashboard/api/dashboard';

import DashboardSkeleton from './dashboard-skeleton';

const formatNumber = value => Number(value ?? 0).toLocaleString('vi-VN');

const Dashboard = () => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useNutritionistDashboard();
  const [selectedClass, setSelectedClass] = useState('all');

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='size-5' />
            Không thể tải dashboard chuyên gia
          </CardTitle>
          <CardDescription>
            {error?.response?.data?.message ||
              'Đã xảy ra lỗi khi lấy dữ liệu từ máy chủ.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='size-4 mr-2' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overview = data?.overview || {};
  const students = data?.students || [];
  const openClasses = data?.openClasses || [];

  const filteredStudents =
    selectedClass === 'all'
      ? students
      : students.filter(s => s.classId === selectedClass);

  const metricCards = [
    {
      title: 'Số lượng học viên',
      value: formatNumber(overview.totalStudents),
      description: 'Học viên trong các lớp đang mở',
      icon: Users,
      iconTone:
        'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/30'
    },
    {
      title: 'Tổng lớp học đang mở',
      value: formatNumber(overview.totalOpenClasses),
      description: 'Lớp học bạn đang quản lý',
      icon: School,
      iconTone:
        'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30'
    },
    {
      title: 'Tổng món ăn',
      value: formatNumber(overview.totalDishes),
      description: 'Món ăn bạn đã tạo',
      icon: ChefHat,
      iconTone:
        'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30'
    },
    {
      title: 'Món ăn công khai',
      value: formatNumber(overview.totalPublicDishes),
      description: 'Món ăn hiển thị cho cộng đồng',
      icon: Sparkles,
      iconTone:
        'text-cyan-600 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950/30'
    },
    {
      title: 'Tổng bài viết',
      value: formatNumber(overview.totalPosts),
      description: 'Bài viết bạn đã tạo',
      icon: BookText,
      iconTone:
        'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/30'
    }
  ];

  return (
    <div className='space-y-6'>
      <Card className='relative overflow-hidden'>
        <div className='pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl' />
        <div className='pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-cyan-500/15 blur-2xl' />
        <CardContent className='relative pt-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Dashboard chuyên gia
              </h1>
              <p className='text-sm text-muted-foreground'>
                Tổng quan nội dung và hiệu suất tương tác của bạn.
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>Cập nhật theo thời gian thực</Badge>
              <Button
                variant='outline'
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
        {metricCards.map(item => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className='border'>
              <CardContent className='pt-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-foreground/80'>
                      {item.title}
                    </p>
                    <p className='text-2xl font-semibold'>{item.value}</p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${item.iconTone}`}
                  >
                    <Icon className='size-5' />
                  </div>
                </div>
                <p className='mt-3 text-xs text-muted-foreground'>
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div>
            <CardTitle>Danh sách học viên</CardTitle>
            <CardDescription>
              Danh sách các học viên đang theo học trong các lớp đang mở.
            </CardDescription>
          </div>
          <div className='w-52'>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder='Lọc theo lớp' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả các lớp</SelectItem>
                {openClasses.map(c => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Lớp học</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead className='text-right'>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student._id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{student.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{student.className}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='w-40'>
                      <Progress value={student.progress} />
                    </div>

                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      asChild
                      className='gap-2'
                    >
                      <Link
                        to={`/nutritionist/classes/${student.classId}/students/${student._id}`}
                        state={{ from: '/nutritionist' }}
                      >
                        <Eye className='size-4' />
                        Xem chi tiết
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
