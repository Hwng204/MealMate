import { z } from 'zod';

export const createClassRequestSchema = z.object({
  className: z
    .string('Tên lớp học không hợp lệ')
    .trim()
    .min(2, 'Tên lớp phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional()
});

export type CreateClassRequest = z.infer<typeof createClassRequestSchema>;

export const updateClassRequestSchema = z.object({
  className: z
    .string('Tên lớp học không hợp lệ')
    .trim()
    .min(2, 'Tên lớp phải có ít nhất 2 ký tự')
    .optional(),
  description: z.string().trim().optional()
});

export type UpdateClassRequest = z.infer<typeof updateClassRequestSchema>;

export const joinClassRequestSchema = z.object({
  classCode: z
    .string('Mã lớp học không hợp lệ')
    .trim()
    .min(1, 'Mã lớp là bắt buộc')
});

export type JoinClassRequest = z.infer<typeof joinClassRequestSchema>;

export const addClassMemberRequestSchema = z
  .object({
    userId: z.string().trim().optional(),
    email: z.string().trim().email('Email không hợp lệ').optional()
  });

export type AddClassMemberRequest = z.infer<
  typeof addClassMemberRequestSchema
>;

export const removeMemberRequestSchema = z.object({
  memberId: z.string('ID học viên không hợp lệ').trim().min(1, 'ID học viên là bắt buộc')
});

export type RemoveMemberRequest = z.infer<typeof removeMemberRequestSchema>;
