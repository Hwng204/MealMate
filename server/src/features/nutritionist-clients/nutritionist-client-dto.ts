import { z } from 'zod';

import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';

export const createNutritionistClientInvitationSchema = z.object({
  userId: z.string().min(1, 'ID học viên là bắt buộc'),
  notes: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional()
});

export type CreateNutritionistClientInvitationRequest = z.infer<
  typeof createNutritionistClientInvitationSchema
>;

export const createNutritionistClientRequestSchema = z.object({
  nutritionistId: z.string().min(1, 'ID chuyên gia là bắt buộc'),
  notes: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional()
});

export type CreateNutritionistClientRequestRequest = z.infer<
  typeof createNutritionistClientRequestSchema
>;

export const updateNutritionistClientStatusSchema = z.object({
  status: z.enum(
    [
      NUTRITIONIST_CLIENT_STATUS.ACTIVE,
      NUTRITIONIST_CLIENT_STATUS.REJECTED,
      NUTRITIONIST_CLIENT_STATUS.ENDED
    ],
    'Trạng thái quan hệ không hợp lệ'
  )
});

export type UpdateNutritionistClientStatusRequest = z.infer<
  typeof updateNutritionistClientStatusSchema
>;

export const nutritionistClientQuerySchema = z.object({
  status: z
    .enum(Object.values(NUTRITIONIST_CLIENT_STATUS), 'Trạng thái không hợp lệ')
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sort: z.string().optional()
});

export type NutritionistClientQuery = z.infer<
  typeof nutritionistClientQuerySchema
>;
