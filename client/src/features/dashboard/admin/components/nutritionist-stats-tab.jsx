import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { ArrowUp, ArrowDown, User, Clock, AlertCircle } from 'lucide-react';
import { useNutritionistStats } from '~/features/dashboard/api/dashboard';
import { Skeleton } from '~/components/ui/skeleton';

const NutritionistStatsTab = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'clientCount', direction: 'descending' });
  const { data: nutritionists = [], isLoading, isError, error } = useNutritionistStats();

  const averageUsage = useMemo(() => {
    if (!nutritionists || nutritionists.length === 0) return 0;
    const total = nutritionists.reduce((acc, curr) => acc + (curr.usageTime || 0), 0);
    return Math.round((total / nutritionists.length) * 10) / 10;
  }, [nutritionists]);

  const sortedNutritionists = useMemo(() => {
    if (!nutritionists) return [];
    return [...nutritionists].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? 0;
      const bValue = b[sortConfig.key] ?? 0;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [nutritionists, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className='ml-2 h-4 w-4' />;
    }
    return <ArrowDown className='ml-2 h-4 w-4' />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số chuyên gia</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời gian sử dụng trung bình</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách chuyên gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            Không thể tải thống kê chuyên gia
          </CardTitle>
          <CardContent className='pt-4'>
            <p>{error?.response?.data?.message || 'Đã xảy ra lỗi khi lấy dữ liệu từ máy chủ.'}</p>
          </CardContent>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số chuyên gia</CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{nutritionists.length}</div>
            <p className='text-xs text-muted-foreground'>
              Tổng số chuyên gia trong hệ thống
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Thời gian sử dụng trung bình
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{averageUsage} phút</div>
            <p className='text-xs text-muted-foreground'>
              Thời gian sử dụng trung bình của tất cả chuyên gia
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chuyên gia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chuyên gia</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='text-right'>
                  <Button variant='ghost' onClick={() => requestSort('usageTime')}>
                    Thời gian sử dụng
                    {getSortIcon('usageTime')}
                  </Button>
                </TableHead>
                <TableHead className='text-right'>
                  <Button variant='ghost' onClick={() => requestSort('clientCount')}>
                    Số lượng học viên
                    {getSortIcon('clientCount')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedNutritionists.map((nutritionist) => (
                <TableRow key={nutritionist._id}>
                  <TableCell>{nutritionist.name}</TableCell>
                  <TableCell>{nutritionist.email}</TableCell>
                  <TableCell className='text-right'>{nutritionist.usageTime || 0} phút</TableCell>
                  <TableCell className='text-right'>{nutritionist.clientCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionistStatsTab;
