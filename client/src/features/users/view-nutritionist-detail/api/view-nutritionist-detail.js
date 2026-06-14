import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const getErrorMessage = error =>
  error.response?.data?.message || 'Thao tác thất bại';

const fetchNutritionistDetail = async id => {
  const response = await apiClient.get(`/api/users/${id}/profile`);
  return response.data.data;
};

const fetchNutritionistReviews = async ({ id, params = {} }) => {
  const searchParams = buildQueryParams(params);
  const response = await apiClient.get(
    `/api/users/${id}/reviews?${searchParams.toString()}`
  );
  return response.data.data;
};

const fetchMyNutritionistReview = async (id) => {
  const response = await apiClient.get(`/api/users/${id}/reviews/me`);
  return response.data.data;
};

const submitNutritionistReview = async ({ id, data }) => {
  const response = await apiClient.post(`/api/users/${id}/reviews`, data);
  return response.data.data;
};

export const useNutritionistDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST(id),
    queryFn: () => fetchNutritionistDetail(id)
  });
};

export const useMyNutritionistReview = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONIST_REVIEWS(id), 'me'],
    queryFn: () => fetchMyNutritionistReview(id),
    staleTime: 0,
  });
};

export const useNutritionistReviews = (id, params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONIST_REVIEWS(id), params],
    queryFn: () => fetchNutritionistReviews({ id, params })
  });
};

export const useSubmitNutritionistReview = ({ id, onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => submitNutritionistReview({ id, data }),
    onSuccess: () => {
      toast.success('Đánh giá thành công');
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NUTRITIONIST_REVIEWS(id)
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: error => {
      toast.error(getErrorMessage(error));
    }
  });
};
