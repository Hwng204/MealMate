import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const recommendDailyMeals = async ({ date, userId }) => {
  const body = { date };
  if (userId) {
    body.userId = userId;
  }
  const response = await apiClient.post('/api/ai/recommend-daily-meals', body);

  return response.data;
};

export const useRecommendDailyMeals = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendDailyMeals,

    onSuccess: async (res, variables) => {
      const nextSchedule = res?.data;
      const scheduleId = variables?.scheduleId || nextSchedule?.scheduleId;

      if (nextSchedule?.scheduleId) {
        queryClient.setQueriesData({ queryKey: QUERY_KEYS.SCHEDULES }, old => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map(item =>
              item?._id === nextSchedule.scheduleId
                ? { ...item, ...nextSchedule, _id: nextSchedule.scheduleId }
                : item
            );
          }

          const oldDocs = Array.isArray(old?.docs) ? old.docs : [];

          return {
            ...old,
            docs: oldDocs.map(item =>
              item?._id === nextSchedule.scheduleId
                ? { ...item, ...nextSchedule, _id: nextSchedule.scheduleId }
                : item
            )
          };
        });
      }

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      if (scheduleId) {
        queryClient.setQueryData(QUERY_KEYS.SCHEDULE(scheduleId), old => {
          if (!old) {
            return { ...nextSchedule, _id: scheduleId };
          }
          return { ...old, ...nextSchedule, _id: scheduleId };
        });

        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SCHEDULE(scheduleId)
        });
      }

      toast.success(res.message || 'Tạo thực đơn hằng ngày bằng AI thành công');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err.response?.data?.message ||
          'Không thể tạo thực đơn hằng ngày bằng AI'
      );
    }
  });
};
