import { AlertTriangle, Ban, Leaf } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

const EMPTY = 'Chưa cập nhật';

export default function StudentDietRestrictionsTable({ member }) {
  const diet = member?.diet || EMPTY;
  const allergens = Array.isArray(member?.allergens)
    ? member.allergens.filter(Boolean)
    : [];
  const blockedDishes = Array.isArray(member?.blockDishes)
    ? member.blockDishes.filter(Boolean)
    : [];

  const rows = [
    {
      icon: <Leaf className='h-4 w-4 text-primary' />,
      label: 'Chế độ ăn',
      content: (
        <Badge variant='secondary' className='font-normal'>
          {diet}
        </Badge>
      )
    },
    {
      icon: <AlertTriangle className='h-4 w-4 text-amber-600' />,
      label: 'Dị ứng nguyên liệu',
      content:
        allergens.length > 0 ? (
          <div className='flex flex-wrap gap-1.5'>
            {allergens.map(item => (
              <Badge
                key={item}
                variant='outline'
                className='border-amber-200 bg-amber-50 text-amber-800'
              >
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <span className='text-sm text-muted-foreground'>{EMPTY}</span>
        )
    },
    {
      icon: <Ban className='h-4 w-4 text-destructive' />,
      label: 'Món ăn bị chặn',
      content:
        blockedDishes.length > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {blockedDishes.map(dish => (
              <div
                key={dish._id}
                className='flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1'
              >
                <img
                  src={dish.image || '/logo2.png'}
                  alt={dish.name}
                  className='h-7 w-7 rounded-md object-cover'
                />
                <span className='text-sm font-medium'>{dish.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className='text-sm text-muted-foreground'>{EMPTY}</span>
        )
    }
  ];

  return (
    <div className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
      <div className='border-b px-5 py-4'>
        <h3 className='text-base font-bold'>Chế độ ăn & hạn chế</h3>
        <p className='text-xs text-muted-foreground'>
          Thông tin dinh dưỡng và dị ứng của học viên
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-44'>Hạng mục</TableHead>
            <TableHead>Nội dung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.label}>
              <TableCell className='align-top font-medium'>
                <div className='flex items-center gap-2'>
                  {row.icon}
                  {row.label}
                </div>
              </TableCell>
              <TableCell className='align-top'>{row.content}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
