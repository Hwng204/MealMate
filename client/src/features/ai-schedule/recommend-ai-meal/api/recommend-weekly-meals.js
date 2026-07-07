import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const recommendWeeklyMeals = async ({ weekStartDate, userId }) => {
  const body = { weekStartDate };
  if (userId) {
    body.userId = userId;
  }
  const response = await apiClient.post('/api/ai/recommend-weekly-meals', body);

  return response.data;
};

export const useRecommendWeeklyMeals = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendWeeklyMeals,

    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      toast.success(res.message || 'Tạo thực đơn tuần bằng AI thành công');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err.response?.data?.message ||
          'Không thể tạo thực đơn tuần bằng AI'
      );
    }
  });
};
