import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const errorMessage = error =>
  error.response?.data?.message || 'Thao tác thất bại';

export const useCreateNutritionistInvitation = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => apiClient.post('/api/nutritionist-clients/invitations', data),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã gửi lời mời');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useCreateNutritionistRequest = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => apiClient.post('/api/nutritionist-clients/requests', data),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã gửi yêu cầu');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useNutritionistClientInbox = (params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONIST_CLIENTS, 'inbox', params],
    queryFn: async () => {
      const searchParams = buildQueryParams(params);
      const response = await apiClient.get(
        `/api/nutritionist-clients/inbox?${searchParams.toString()}`
      );
      return response.data.data;
    }
  });

export const useNutritionistClientOutbox = (params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONIST_CLIENTS, 'outbox', params],
    queryFn: async () => {
      const searchParams = buildQueryParams(params);
      const response = await apiClient.get(
        `/api/nutritionist-clients/outbox?${searchParams.toString()}`
      );
      return response.data.data;
    }
  });

export const useNutritionistClients = (params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONIST_CLIENTS, 'my-clients', params],
    queryFn: async () => {
      const searchParams = buildQueryParams(params, ['keyword']);
      const response = await apiClient.get(
        `/api/nutritionist-clients/my-clients?${searchParams.toString()}`
      );
      return response.data.data;
    }
  });

export const useNutritionistClientDetail = userId =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST_CLIENT(userId),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/nutritionist-clients/my-clients/${userId}`
      );
      return response.data.data;
    }
  });

export const useNutritionistClientDashboard = userId =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST_CLIENT_DASHBOARD(userId),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/nutritionist-clients/my-clients/${userId}/dashboard`
      );
      return response.data.data;
    }
  });

export const useNutritionistClientTracking = (userId, days = 7) =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST_CLIENT_TRACKING(userId, days),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/nutritionist-clients/my-clients/${userId}/tracking?days=${days}`
      );
      return response.data.data;
    }
  });

export const useUpdateNutritionistClientStatus = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      apiClient.patch(`/api/nutritionist-clients/${id}/status`, { status }),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã cập nhật trạng thái');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useDeleteNutritionistClientPending = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => apiClient.delete(`/api/nutritionist-clients/${id}`),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã xóa');
      onSuccess?.();
    },
    onError: error => toast.error(errorMessage(error))
  });
};

const makeClientUpdateMutation = endpointBuilder => ({ userId, data }) =>
  apiClient.put(endpointBuilder(userId), data);

export const useUpdateNutritionistClientPhysicalStats = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeClientUpdateMutation(
      userId => `/api/nutritionist-clients/my-clients/${userId}/physical-stats`
    ),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã cập nhật chỉ số');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useUpdateNutritionistClientNutritionTarget = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeClientUpdateMutation(
      userId => `/api/nutritionist-clients/my-clients/${userId}/nutrition-target`
    ),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã cập nhật mục tiêu');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useUpdateNutritionistClientRestrictions = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeClientUpdateMutation(
      userId => `/api/nutritionist-clients/my-clients/${userId}/restrictions`
    ),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã cập nhật chế độ ăn');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};

export const useUpdateNutritionistClientAllergens = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeClientUpdateMutation(
      userId => `/api/nutritionist-clients/my-clients/${userId}/allergens`
    ),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_CLIENTS
      });
      toast.success(response.data?.message || 'Đã cập nhật dị ứng');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(errorMessage(error))
  });
};
