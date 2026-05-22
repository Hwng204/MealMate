import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineBeaker,
  HiOutlineChartPie,
  HiOutlineCube,
  HiOutlineHeart,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineTable,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import {
  IoHeartOutline,
  IoLeaf,
  IoNutritionOutline,
  IoRestaurantOutline,
  IoWaterOutline
} from 'react-icons/io5';
import { MdOutlineLocalDining, MdOutlineMonitorWeight } from 'react-icons/md';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '~/components/ui/dialog';
import { Spinner } from '~/components/ui/spinner';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';
import { findByLabel, formatValue } from '~/lib/utils';
import { useUserDetail } from '~/features/users/view-user-detail/api/view-user-detail';

const fetchScheduleDetail = async id => {
  const response = await apiClient.get(`/api/schedules/${id}`);
  return response.data.data;
};

export default function NutritionAnalysisDialog({
  scheduleId,
  open,
  onOpenChange
}) {
  const { data: schedule, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SCHEDULE(scheduleId),
    queryFn: () => fetchScheduleDetail(scheduleId),
    enabled: Boolean(scheduleId) && open
  });

  const { data: profile } = useUserDetail(schedule?.user?._id);

  if (!schedule || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <div className='flex h-40 items-center justify-center'>
            <Spinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const targetCalories = profile?.nutritionTarget?.caloriesTarget ?? 0;
  const targetProtein = profile?.nutritionTarget?.proteinTarget ?? 0;
  const targetFat = profile?.nutritionTarget?.fatTarget ?? 0;
  const targetCarbs = profile?.nutritionTarget?.carbsTarget ?? 0;

  const nutrition = schedule?.totalNutrition || {};
  const nutrients = nutrition?.nutrients || [];
  const minerals = nutrition?.minerals || [];
  const vitamins = nutrition?.vitamins || [];

  const energy = findByLabel(nutrients, 'Năng lượng')?.value ?? 0;
  const protein = findByLabel(nutrients, 'Protein')?.value ?? 0;
  const fat = findByLabel(nutrients, 'Chất béo')?.value ?? 0;
  const carbs = findByLabel(nutrients, 'Tinh bột')?.value ?? 0;
  const fiber = findByLabel(nutrients, 'Chất xơ')?.value ?? 0;
  const water = findByLabel(nutrients, 'Nước')?.value ?? 0;
  const sugar = findByLabel(nutrients, 'Đường')?.value ?? 0;
  const cholesterol = findByLabel(nutrients, 'Cholesterol')?.value ?? 0;

  const sodium = findByLabel(minerals, 'Natri')?.value ?? 0;
  const calcium = findByLabel(minerals, 'Calci')?.value ?? 0;
  const iron = findByLabel(minerals, 'Sắt')?.value ?? 0;
  const potassium = findByLabel(minerals, 'Kali')?.value ?? 0;

  const vitaminA = findByLabel(vitamins, 'Vitamin A')?.value ?? 0;
  const vitaminC = findByLabel(vitamins, 'Vitamin C')?.value ?? 0;
  const vitaminE = findByLabel(vitamins, 'Vitamin E')?.value ?? 0;
  const folat = findByLabel(vitamins, 'Folat')?.value ?? 0;

  const meals = schedule?.meals || [];
  const totalMeals = meals.length;
  const totalDishes = meals.reduce(
    (sum, meal) => sum + (meal?.dishes?.length || 0),
    0
  );

  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPercent = (proteinKcal / totalMacroKcal) * 100;
  const carbsPercent = (carbsKcal / totalMacroKcal) * 100;
  const fatPercent = (fatKcal / totalMacroKcal) * 100;

  const caloriesPercent = targetCalories ? (energy / targetCalories) * 100 : 0;

  const StatCard = ({ icon, label, value, unit, target, color }) => {
    const percent = target ? (value / target) * 100 : 0;
    return (
      <div className='rounded-lg border border-border bg-muted/30 p-3'>
        <div className='flex items-center gap-2 mb-1'>
          <span className={`${color}`}>{icon}</span>
          <p className='text-xs font-semibold text-muted-foreground'>{label}</p>
        </div>
        <p className='text-lg font-bold text-foreground'>
          {Math.round(value)}{' '}
          <span className='text-xs font-medium text-muted-foreground'>
            {unit}
          </span>
        </p>
        {target > 0 && (
          <p className='text-xs text-muted-foreground mt-1'>
            Mục tiêu: {Math.round(target)} {unit}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Phân tích dinh dưỡng
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
            <TabsTrigger value='macros'>Chất đạm</TabsTrigger>
            <TabsTrigger value='details'>Chi tiết</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4 mt-4'>
            <div className='grid grid-cols-2 gap-3'>
              <StatCard
                icon={<MdOutlineLocalDining size={16} />}
                label='Năng lượng'
                value={energy}
                unit='kcal'
                target={targetCalories}
                color='text-orange-600'
              />
              <StatCard
                icon={<IoNutritionOutline size={16} />}
                label='Protein'
                value={protein}
                unit='g'
                target={targetProtein}
                color='text-red-600'
              />
              <StatCard
                icon={<IoLeaf size={16} />}
                label='Chất béo'
                value={fat}
                unit='g'
                target={targetFat}
                color='text-yellow-600'
              />
              <StatCard
                icon={<IoWaterOutline size={16} />}
                label='Tinh bột'
                value={carbs}
                unit='g'
                target={targetCarbs}
                color='text-blue-600'
              />
            </div>

            <div className='mt-4 rounded-lg border border-border bg-muted/30 p-4 space-y-2'>
              <h4 className='font-semibold text-foreground'>Tỷ lệ Macro</h4>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Protein</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-32 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-red-500 transition-all'
                        style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                      />
                    </div>
                    <span className='font-semibold w-12 text-right'>
                      {Math.round(proteinPercent)}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Tinh bột</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-32 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-500 transition-all'
                        style={{ width: `${Math.min(carbsPercent, 100)}%` }}
                      />
                    </div>
                    <span className='font-semibold w-12 text-right'>
                      {Math.round(carbsPercent)}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Chất béo</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-32 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-yellow-500 transition-all'
                        style={{ width: `${Math.min(fatPercent, 100)}%` }}
                      />
                    </div>
                    <span className='font-semibold w-12 text-right'>
                      {Math.round(fatPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Macros Tab */}
          <TabsContent value='macros' className='space-y-4 mt-4'>
            <div className='grid grid-cols-2 gap-3'>
              <StatCard
                icon={<HiOutlineShieldCheck size={16} />}
                label='Protein'
                value={protein}
                unit='g'
                target={targetProtein}
                color='text-red-600'
              />
              <StatCard
                icon={<HiOutlineLightningBolt size={16} />}
                label='Chất béo'
                value={fat}
                unit='g'
                target={targetFat}
                color='text-yellow-600'
              />
              <StatCard
                icon={<HiOutlineCube size={16} />}
                label='Tinh bột'
                value={carbs}
                unit='g'
                target={targetCarbs}
                color='text-blue-600'
              />
              <StatCard
                icon={<HiOutlineBeaker size={16} />}
                label='Chất xơ'
                value={fiber}
                unit='g'
                color='text-green-600'
              />
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value='details' className='space-y-4 mt-4'>
            <div>
              <h4 className='font-semibold text-foreground mb-3'>
                Khoáng chất
              </h4>
              <div className='grid grid-cols-2 gap-3'>
                <StatCard
                  icon={<MdOutlineMonitorWeight size={16} />}
                  label='Natri'
                  value={sodium}
                  unit='mg'
                  color='text-purple-600'
                />
                <StatCard
                  icon={<IoHeartOutline size={16} />}
                  label='Calci'
                  value={calcium}
                  unit='mg'
                  color='text-pink-600'
                />
                <StatCard
                  icon={<HiOutlineTrendingUp size={16} />}
                  label='Sắt'
                  value={iron}
                  unit='mg'
                  color='text-rose-600'
                />
                <StatCard
                  icon={<HiOutlineTable size={16} />}
                  label='Kali'
                  value={potassium}
                  unit='mg'
                  color='text-indigo-600'
                />
              </div>
            </div>

            <div>
              <h4 className='font-semibold text-foreground mb-3'>Vitamin</h4>
              <div className='grid grid-cols-2 gap-3'>
                <StatCard
                  icon={<HiOutlineChartPie size={16} />}
                  label='Vitamin A'
                  value={vitaminA}
                  unit='μg'
                  color='text-orange-600'
                />
                <StatCard
                  icon={<HiOutlineChartPie size={16} />}
                  label='Vitamin C'
                  value={vitaminC}
                  unit='mg'
                  color='text-red-600'
                />
                <StatCard
                  icon={<HiOutlineChartPie size={16} />}
                  label='Vitamin E'
                  value={vitaminE}
                  unit='mg'
                  color='text-green-600'
                />
                <StatCard
                  icon={<HiOutlineChartPie size={16} />}
                  label='Folat'
                  value={folat}
                  unit='μg'
                  color='text-blue-600'
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
