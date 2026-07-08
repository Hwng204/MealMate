import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const duplicateDishSchedule = async ({ scheduleId, mealType, dishId }) => {
  const response = await apiClient.post(
    `/api/schedules/${scheduleId}/meals/${mealType}/dishes/${dishId}/duplicate`
  );
  return response.data;
};

export const useDuplicateDishSchedule = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateDishSchedule,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULE(variables.scheduleId)
      });

      toast.success(data?.message || 'Sao chép món ăn thành công');
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Sao chép món ăn thất bại');
    }
  });
};
