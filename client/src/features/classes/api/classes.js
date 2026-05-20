import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const getErrorMessage = error =>
  error.response?.data?.message || 'Thao tác thất bại';

const fetchClasses = async (params = {}) => {
  const searchParams = buildQueryParams(params, ['className']);
  const response = await apiClient.get(`/api/classes?${searchParams.toString()}`);
  return response.data.data;
};

const fetchMyClasses = async (params = {}) => {
  const searchParams = buildQueryParams(params, ['className']);
  const response = await apiClient.get(
    `/api/classes/my?${searchParams.toString()}`
  );
  return response.data.data;
};

const fetchClassDetail = async id => {
  const response = await apiClient.get(`/api/classes/${id}`);
  return response.data.data;
};

const fetchClassMembers = async (id, params = {}) => {
  const searchParams = buildQueryParams(params, ['name', 'email']);
  const response = await apiClient.get(
    `/api/classes/${id}/members?${searchParams.toString()}`
  );
  return response.data.data;
};

const fetchMemberProgress = async ({ classId, memberId }) => {
  const response = await apiClient.get(
    `/api/classes/${classId}/members/${memberId}/progress`
  );
  return response.data.data;
};

const fetchMyClassProgress = async classId => {
  const response = await apiClient.get(`/api/classes/${classId}/my-progress`);
  return response.data.data;
};

export const useClasses = (params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.CLASSES, params],
    queryFn: () => fetchClasses(params)
  });

export const useMyClasses = (params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.CLASSES, 'my', params],
    queryFn: () => fetchMyClasses(params)
  });

export const useClassDetail = id =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.CLASS(id),
    queryFn: () => fetchClassDetail(id)
  });

export const useClassMembers = (id, params = {}) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.CLASS_MEMBERS(id), params],
    queryFn: () => fetchClassMembers(id, params)
  });

export const useClassMemberProgress = (classId, memberId) =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.CLASS_MEMBER_PROGRESS(classId, memberId),
    queryFn: () => fetchMemberProgress({ classId, memberId })
  });

export const useMyClassProgress = classId =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.CLASS_MY_PROGRESS(classId),
    queryFn: () => fetchMyClassProgress(classId)
  });

export const useAddMemberWeight = ({ classId, memberId, onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data =>
      apiClient.post(`/api/classes/${classId}/members/${memberId}/weight`, data),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASS_MEMBER_PROGRESS(classId, memberId)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CLASS_MEMBERS(classId)
      });
      toast.success(response.data?.message || 'Cập nhật cân nặng thành công');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(getErrorMessage(error))
  });
};

export const useCreateClass = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => apiClient.post('/api/classes', data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success(response.data?.message || 'Tạo lớp học thành công');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(getErrorMessage(error))
  });
};

export const useJoinClass = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classCode => apiClient.post('/api/classes/join', { classCode }),
onSuccess: response => {
       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
       toast.success(response.data?.message || 'Tham gia lớp học thành công');
       onSuccess?.(response.data.data);
     },
    onError: error => toast.error(getErrorMessage(error))
  });
};

export const useAddClassMember = ({ classId, onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => apiClient.post(`/api/classes/${classId}/members`, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_MEMBERS(classId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS(classId) });
      toast.success(response.data?.message || 'Thêm học viên thành công');
      onSuccess?.(response.data.data);
    },
    onError: error => toast.error(getErrorMessage(error))
  });
};

export const useRemoveClassMember = ({ classId, onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberId =>
      apiClient.delete(`/api/classes/${classId}/members/${memberId}`),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_MEMBERS(classId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS(classId) });
      toast.success(response.data?.message || 'Xóa học viên thành công');
      onSuccess?.();
    },
    onError: error => toast.error(getErrorMessage(error))
  });
};

export const useDeleteClass = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classId => apiClient.delete(`/api/classes/${classId}`),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES });
      toast.success(response.data?.message || 'Xóa lớp học thành công');
      onSuccess?.();
    },
    onError: error => toast.error(getErrorMessage(error))
  });
};

