import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { ClassModel, NutritionistClientModel, UserModel } from '~/shared/database/models';
import { ROLE } from '~/shared/constants/role';
import { ApiResponse } from '~/shared/utils';

import type {
  AskAgentRequest,
  RecommendDailyMealsRequest,
  RecommendDailyWorkoutRequest,
  RecommendWeeklyMealsRequest
} from './ai-dto';
import { AiService } from './ai-service';

const isNutritionistAssignedToClient = async (
  nutritionistId: string,
  clientId: string
) => {
  return Boolean(
    await UserModel.exists({
      _id: clientId,
      assignedNutritionist: nutritionistId
    })
  );
};

const isNutritionistClassMember = async (
  nutritionistId: string,
  clientId: string
) => {
  return Boolean(
    await ClassModel.exists({
      nutritionistId,
      members: clientId
    })
  );
};

const isActiveNutritionistClient = async (
  nutritionistId: string,
  clientId: string
) => {
  return Boolean(
    await NutritionistClientModel.exists({
      nutritionistId,
      clientId,
      status: 'active'
    })
  );
};

const resolveTargetUserId = async (
  req: Request,
  payload: { userId?: string }
): Promise<string> => {
  const currentUserId = req.user?._id?.toString();
  const role = req.user?.role;

  if (!currentUserId) {
    throw createHttpError(401, 'Unauthorized');
  }

  if (!payload.userId || payload.userId === currentUserId) {
    return currentUserId;
  }

  if (role !== ROLE.ADMIN && role !== ROLE.NUTRITIONIST) {
    throw createHttpError(403, 'Bạn không có quyền tạo lịch cho người dùng này');
  }

  if (role === ROLE.NUTRITIONIST) {
    const [isAssigned, isClassMember, isActiveClient] = await Promise.all([
      isNutritionistAssignedToClient(currentUserId, payload.userId),
      isNutritionistClassMember(currentUserId, payload.userId),
      isActiveNutritionistClient(currentUserId, payload.userId)
    ]);

    if (!isAssigned && !isClassMember && !isActiveClient) {
      throw createHttpError(403, 'Bạn không có quyền tạo lịch cho học viên này');
    }
  }

  return payload.userId;
};

export const AiController = {
  askAgent: async (req: Request, res: Response) => {
    const payload = req.body as AskAgentRequest;

    const result = await AiService.askAgent(payload);

    res.status(200).json(ApiResponse.success('Trả lời thành công', result));
  },

  recommendDailyMeals: async (req: Request, res: Response) => {
    const currentUserId = req.user?._id?.toString();
    if (!currentUserId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const payload = req.body as RecommendDailyMealsRequest;
    const targetUserId = await resolveTargetUserId(req, payload);

    const result = await AiService.recommendDailyMeals(
      targetUserId,
      currentUserId,
      payload
    );

    res
      .status(200)
      .json(ApiResponse.success('Tạo gợi ý bữa ăn thành công', result));
  },

  recommendDailyWorkout: async (req: Request, res: Response) => {
    const currentUserId = req.user?._id?.toString();
    if (!currentUserId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const payload = req.body as RecommendDailyWorkoutRequest;
    const targetUserId = await resolveTargetUserId(req, payload);

    const result = await AiService.recommendDailyWorkout(
      targetUserId,
      currentUserId,
      payload
    );

    res
      .status(200)
      .json(ApiResponse.success('Tạo gợi ý bài tập thành công', result));
  },

  recommendWeeklyMeals: async (req: Request, res: Response) => {
    const payload = req.body as RecommendWeeklyMealsRequest;
    const currentUserId = req.user?._id?.toString();
    const targetUserId = currentUserId ?? payload.userId;

    if (!targetUserId) {
      throw createHttpError(
        400,
        'Cần đăng nhập hoặc truyền userId trong body để gợi ý bữa ăn tuần'
      );
    }

    const result = await AiService.recommendWeeklyMeals(
      targetUserId,
      currentUserId ?? targetUserId,
      payload
    );

    res
      .status(200)
      .json(ApiResponse.success('Tạo gợi ý bữa ăn tuần thành công', result));
  }
};
