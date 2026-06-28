import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';

import { DashboardService } from './dashboard-service';

export const DashboardController = {
  getNutritionistStats: async (_req: Request, res: Response) => {
    const result = await DashboardService.getNutritionistStats();

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy thống kê chuyên gia thành công', result)
      );
  },

  viewAdminDashboard: async (req: Request, res: Response) => {
    const result = await DashboardService.viewAdminDashboard(req.query);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy dữ liệu dashboard admin thành công', result)
      );
  },

  viewNutritionistDashboard: async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();

    const result = await DashboardService.viewNutritionistDashboard(
      userId,
      req.query
    );

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Lấy dữ liệu dashboard chuyên gia thành công',
          result
        )
      );
  }
};
