import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { NutritionistClientService } from './nutritionist-client-service';

export const NutritionistClientController = {
  inviteClient: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const data = req.body;

    const result = await NutritionistClientService.inviteClient(
      nutritionistId,
      data
    );

    res
      .status(201)
      .json(ApiResponse.success('Gửi lời mời học viên thành công', result));
  },

  requestNutritionist: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const data = req.body;

    const result = await NutritionistClientService.requestNutritionist(
      userId,
      data
    );

    res
      .status(201)
      .json(ApiResponse.success('Gửi yêu cầu đến chuyên gia thành công', result));
  },

  viewMyClients: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const parsed = parseQuery(req.query);

    const result = await NutritionistClientService.viewMyClients(
      nutritionistId,
      parsed
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách học viên thành công', result));
  },

  viewMyClientDetail: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;

    const result = await NutritionistClientService.viewMyClientDetail(
      nutritionistId,
      userId
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy chi tiết học viên thành công', result));
  },

  updateStatus: async (req: Request, res: Response) => {
    const relationId = req.params.id;
    const actorId = req.user?._id.toString();
    const actorRole = req.user?.role ?? '';
    const data = req.body;

    const result = await NutritionistClientService.updateStatus(
      relationId,
      actorId,
      actorRole,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật trạng thái quan hệ thành công', result));
  },

  deleteRelation: async (req: Request, res: Response) => {
    const relationId = req.params.id;
    const actorId = req.user?._id.toString();

    await NutritionistClientService.deleteRelation(relationId, actorId);

    res
      .status(200)
      .json(ApiResponse.success('Xóa lời mời hoặc yêu cầu thành công'));
  }
};
