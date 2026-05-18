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

  viewInbox: async (req: Request, res: Response) => {
    const actorId = req.user?._id.toString();
    const role = req.user?.role ?? '';
    const parsed = parseQuery(req.query);

    const result = await NutritionistClientService.viewInbox(
      actorId,
      role,
      parsed
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách quan hệ nhận được thành công', result));
  },

  viewOutbox: async (req: Request, res: Response) => {
    const actorId = req.user?._id.toString();
    const role = req.user?.role ?? '';
    const parsed = parseQuery(req.query);

    const result = await NutritionistClientService.viewOutbox(
      actorId,
      role,
      parsed
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách quan hệ đã gửi thành công', result));
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

  viewMyClientDashboard: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;

    const result = await NutritionistClientService.viewMyClientDashboard(
      nutritionistId,
      userId
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy dashboard học viên thành công', result));
  },

  viewMyClientTracking: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;
    const days =
      req.query.days === undefined ? undefined : Number(req.query.days);

    const result = await NutritionistClientService.viewMyClientTracking(
      nutritionistId,
      userId,
      days
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy tracking học viên thành công', result));
  },

  updateClientPhysicalStats: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;
    const data = req.body;

    const result = await NutritionistClientService.updateClientPhysicalStats(
      nutritionistId,
      userId,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật chỉ số học viên thành công', result));
  },

  updateClientNutritionTarget: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;
    const data = req.body;

    const result = await NutritionistClientService.updateClientNutritionTarget(
      nutritionistId,
      userId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Cập nhật mục tiêu dinh dưỡng thành công', result)
      );
  },

  updateClientRestrictions: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;
    const data = req.body;

    const result = await NutritionistClientService.updateClientRestrictions(
      nutritionistId,
      userId,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật chế độ ăn thành công', result));
  },

  updateClientAllergens: async (req: Request, res: Response) => {
    const nutritionistId = req.user?._id.toString();
    const userId = req.params.userId;
    const data = req.body;

    const result = await NutritionistClientService.updateClientAllergens(
      nutritionistId,
      userId,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật dị ứng thành công', result));
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
