import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const recommendDailyWorkout = async ({ date, maxExercises, userId }) => {
  const body = { date };

  if (maxExercises) {
    body.maxExercises = Number(maxExercises);
  }

  if (userId) {
    body.userId = userId;
  }

  const response = await apiClient.post(
    '/api/ai/recommend-daily-workout',
    body,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return response.data;
};

export const useRecommendDailyWorkout = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendDailyWorkout,

    onSuccess: (res, variables) => {
      const nextSchedule = res?.data;
      const scheduleId = variables?.scheduleId || nextSchedule?.scheduleId;

      if (scheduleId) {
        queryClient.setQueriesData({ queryKey: QUERY_KEYS.SCHEDULES }, old => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map(item =>
              item?._id === scheduleId
                ? {
                    ...item,
                    ...nextSchedule,
                    _id: scheduleId
                  }
                : item
            );
          }

          const oldDocs = Array.isArray(old?.docs) ? old.docs : [];

          return {
            ...old,
            docs: oldDocs.map(item =>
              item?._id === scheduleId
                ? {
                    ...item,
                    ...nextSchedule,
                    _id: scheduleId
                  }
                : item
            )
          };
        });

        queryClient.setQueryData(QUERY_KEYS.SCHEDULE(scheduleId), old => {
          if (!old) {
            return {
              ...nextSchedule,
              _id: scheduleId
            };
          }

          return {
            ...old,
            ...nextSchedule,
            _id: scheduleId
          };
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SCHEDULES
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SCHEDULE(scheduleId)
        });
      }

      toast.success(res?.message || 'Tạo gợi ý bài tập thành công');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err?.response?.data?.message || 'Không thể tạo gợi ý bài tập'
      );
    }
  });
};
