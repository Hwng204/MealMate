import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { UserModel } from '~/shared/database/models';
import {
  isExpertMembership,
  MEMBERSHIP_LEVEL
} from '~/shared/constants/membership-level';

export const requireNutritionistMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createHttpError(401, 'Chưa đăng nhập'));
  }

  const userId = req.user._id.toString();
  const user = await UserModel.findById(userId).select(
    'role membershipLevel membershipExpiresAt'
  );

  if (!user) {
    return next(createHttpError(404, 'Không tìm thấy người dùng'));
  }

  if (user.role !== 'Nutritionist') {
    return next(createHttpError(403, 'Chỉ chuyên gia mới có quyền truy cập'));
  }

  if (!isExpertMembership(user.membershipLevel)) {
    return next(
      createHttpError(403, 'Bạn cần mua gói chuyên gia để sử dụng chức năng này')
    );
  }

  if (user.membershipExpiresAt) {
    const expiresAt =
      user.membershipExpiresAt instanceof Date
        ? user.membershipExpiresAt
        : new Date(user.membershipExpiresAt);

    if (!Number.isNaN(expiresAt.getTime()) && new Date() >= expiresAt) {
      user.membershipLevel = MEMBERSHIP_LEVEL.NORMAL;
      user.membershipExpiresAt = undefined;
      await user.save();

      return next(
        createHttpError(
          403,
          'Gói chuyên gia đã hết hạn. Vui lòng mua lại gói để truy cập chức năng này'
        )
      );
    }
  }

  next();
};