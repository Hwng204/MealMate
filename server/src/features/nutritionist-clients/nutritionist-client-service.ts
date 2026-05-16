import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument } from 'mongoose';

import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';
import {
  NutritionistClientModel,
  UserModel
} from '~/shared/database/models';
import type { NutritionistClient } from '~/shared/database/models/nutritionist-client-model';
import type { User } from '~/shared/database/models/user-model';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateNutritionistClientInvitationRequest,
  CreateNutritionistClientRequestRequest,
  UpdateNutritionistClientStatusRequest
} from './nutritionist-client-dto';

const ACTIVE_OR_PENDING_STATUSES = [
  NUTRITIONIST_CLIENT_STATUS.PENDING,
  NUTRITIONIST_CLIENT_STATUS.ACTIVE
] as const;

const BASIC_USER_PROFILE_SELECT = [
  'email',
  'name',
  'avatar',
  'role',
  'gender',
  'dob',
  'height',
  'bodyfat',
  'diet',
  'nutritionTarget',
  'weightRecord',
  'goal',
  'allergens',
  'activityLevel',
  'medicalHistory',
  'isActive'
].join(' ');

const assertValidObjectId = (id: string, message: string) => {
  if (!validateObjectId(id)) {
    throw createHttpError(400, message);
  }
};

const loadNutritionistOrThrow = async (id: string) => {
  const nutritionist = await UserModel.findById(id).select(
    'name avatar role isActive'
  );

  if (!nutritionist || !nutritionist.isActive) {
    throw createHttpError(
      404,
      'Không tìm thấy chuyên gia hoặc tài khoản đã bị vô hiệu hóa'
    );
  }

  if (nutritionist.role !== ROLE.NUTRITIONIST) {
    throw createHttpError(403, 'Người dùng này không phải chuyên gia');
  }

  return nutritionist;
};

const loadClientUserOrThrow = async (id: string) => {
  const user = await UserModel.findById(id).select('name avatar role isActive');

  if (!user || !user.isActive) {
    throw createHttpError(
      404,
      'Không tìm thấy học viên hoặc tài khoản đã bị vô hiệu hóa'
    );
  }

  if (user.role !== ROLE.USER) {
    throw createHttpError(403, 'Chỉ tài khoản người dùng mới có thể làm học viên');
  }

  return user;
};

const ensureUserHasNoOpenRelation = async (userId: string) => {
  const existingRelation = await NutritionistClientModel.findOne({
    'user._id': userId,
    status: {
      $in: ACTIVE_OR_PENDING_STATUSES
    }
  });

  if (existingRelation) {
    throw createHttpError(
      409,
      'Học viên này đã có lời mời hoặc đang thuộc một chuyên gia khác'
    );
  }
};

const isNutritionistParticipant = (
  relation: Pick<NutritionistClient, 'nutritionist'>,
  actorId: string
) => relation.nutritionist._id.toString() === actorId;

const isUserParticipant = (
  relation: Pick<NutritionistClient, 'user'>,
  actorId: string
) => relation.user._id.toString() === actorId;

const toParticipantSnapshot = (user: HydratedDocument<User>) => ({
  _id: user._id,
  name: user.name,
  avatar: user.avatar ?? ''
});

const computeCurrentWeight = (
  weightRecord?: Array<{ weight?: number | null; date?: Date | null }>
) => {
  if (!weightRecord?.length) return null;
  const latest = weightRecord[weightRecord.length - 1];
  return typeof latest.weight === 'number' ? latest.weight : null;
};

const computeBMI = (height?: number | null, weight?: number | null) => {
  if (
    typeof height !== 'number' ||
    height <= 0 ||
    typeof weight !== 'number' ||
    weight <= 0
  ) {
    return null;
  }

  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

export const NutritionistClientService = {
  inviteClient: async (
    nutritionistId: string,
    data: CreateNutritionistClientInvitationRequest
  ) => {
    assertValidObjectId(
      nutritionistId,
      'Định dạng ID chuyên gia không hợp lệ'
    );
    assertValidObjectId(data.userId, 'Định dạng ID học viên không hợp lệ');

    if (nutritionistId === data.userId) {
      throw createHttpError(400, 'Chuyên gia không thể tự thêm chính mình');
    }

    const [nutritionist, user] = await Promise.all([
      loadNutritionistOrThrow(nutritionistId),
      loadClientUserOrThrow(data.userId)
    ]);

    await ensureUserHasNoOpenRelation(data.userId);

    return NutritionistClientModel.create({
      nutritionist: toParticipantSnapshot(nutritionist),
      user: toParticipantSnapshot(user),
      initiatedBy: ROLE.NUTRITIONIST,
      status: NUTRITIONIST_CLIENT_STATUS.PENDING,
      notes: data.notes ?? ''
    });
  },

  requestNutritionist: async (
    userId: string,
    data: CreateNutritionistClientRequestRequest
  ) => {
    assertValidObjectId(userId, 'Định dạng ID học viên không hợp lệ');
    assertValidObjectId(
      data.nutritionistId,
      'Định dạng ID chuyên gia không hợp lệ'
    );

    if (userId === data.nutritionistId) {
      throw createHttpError(400, 'Người dùng không thể gửi yêu cầu cho chính mình');
    }

    const [user, nutritionist] = await Promise.all([
      loadClientUserOrThrow(userId),
      loadNutritionistOrThrow(data.nutritionistId)
    ]);

    await ensureUserHasNoOpenRelation(userId);

    return NutritionistClientModel.create({
      nutritionist: toParticipantSnapshot(nutritionist),
      user: toParticipantSnapshot(user),
      initiatedBy: ROLE.USER,
      status: NUTRITIONIST_CLIENT_STATUS.PENDING,
      notes: data.notes ?? ''
    });
  },

  viewMyClients: async (
    nutritionistId: string,
    parsed: QueryOptions
  ): Promise<PaginateResponse<NutritionistClient>> => {
    assertValidObjectId(
      nutritionistId,
      'Định dạng ID chuyên gia không hợp lệ'
    );

    const options = buildPaginateOptions(parsed);

    const result = await NutritionistClientModel.paginate(
      {
        ...parsed.filter,
        'nutritionist._id': nutritionistId
      },
      {
        ...options,
        sort: options.sort ?? { createdAt: -1 }
      }
    );

    return result as unknown as PaginateResponse<NutritionistClient>;
  },

  viewMyClientDetail: async (nutritionistId: string, userId: string) => {
    assertValidObjectId(
      nutritionistId,
      'Định dạng ID chuyên gia không hợp lệ'
    );
    assertValidObjectId(userId, 'Định dạng ID học viên không hợp lệ');

    const relation = await NutritionistClientModel.findOne({
      'nutritionist._id': nutritionistId,
      'user._id': userId,
      status: NUTRITIONIST_CLIENT_STATUS.ACTIVE
    });

    if (!relation) {
      throw createHttpError(
        403,
        'Bạn không có quyền xem chi tiết học viên này'
      );
    }

    const user = await UserModel.findById(userId)
      .select(BASIC_USER_PROFILE_SELECT)
      .lean();

    if (!user || user.role !== ROLE.USER) {
      throw createHttpError(404, 'Không tìm thấy học viên');
    }

    const currentWeight = computeCurrentWeight(user.weightRecord);

    return {
      relation,
      profile: {
        ...user,
        currentWeight,
        bmi: computeBMI(user.height, currentWeight)
      }
    };
  },

  updateStatus: async (
    relationId: string,
    actorId: string,
    actorRole: string,
    data: UpdateNutritionistClientStatusRequest
  ) => {
    assertValidObjectId(relationId, 'Định dạng ID quan hệ không hợp lệ');
    assertValidObjectId(actorId, 'Định dạng ID người dùng không hợp lệ');

    const relation = await NutritionistClientModel.findById(relationId);

    if (!relation) {
      throw createHttpError(404, 'Không tìm thấy quan hệ chuyên gia và học viên');
    }

    const actorIsNutritionist = isNutritionistParticipant(relation, actorId);
    const actorIsUser = isUserParticipant(relation, actorId);

    if (!actorIsNutritionist && !actorIsUser) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật quan hệ này');
    }

    if (data.status === NUTRITIONIST_CLIENT_STATUS.ENDED) {
      if (relation.status !== NUTRITIONIST_CLIENT_STATUS.ACTIVE) {
        throw createHttpError(
          400,
          'Chỉ có thể kết thúc quan hệ đang hoạt động'
        );
      }

      relation.status = NUTRITIONIST_CLIENT_STATUS.ENDED;
      await relation.save();
      return relation;
    }

    if (relation.status !== NUTRITIONIST_CLIENT_STATUS.PENDING) {
      throw createHttpError(
        400,
        'Chỉ có thể duyệt lời mời hoặc yêu cầu đang chờ'
      );
    }

    const initiatedByNutritionist = relation.initiatedBy === ROLE.NUTRITIONIST;
    const initiatedByUser = relation.initiatedBy === ROLE.USER;

    const isCounterpartyApproving =
      (initiatedByNutritionist &&
        actorRole === ROLE.USER &&
        actorIsUser &&
        !actorIsNutritionist) ||
      (initiatedByUser &&
        actorRole === ROLE.NUTRITIONIST &&
        actorIsNutritionist &&
        !actorIsUser);

    if (!isCounterpartyApproving) {
      throw createHttpError(
        403,
        'Chỉ bên nhận lời mời hoặc yêu cầu mới có thể phản hồi'
      );
    }

    relation.status = data.status;
    await relation.save();

    return relation;
  },

  deleteRelation: async (relationId: string, actorId: string) => {
    assertValidObjectId(relationId, 'Định dạng ID quan hệ không hợp lệ');
    assertValidObjectId(actorId, 'Định dạng ID người dùng không hợp lệ');

    const relation = await NutritionistClientModel.findById(relationId);

    if (!relation) {
      throw createHttpError(404, 'Không tìm thấy quan hệ chuyên gia và học viên');
    }

    if (relation.status !== NUTRITIONIST_CLIENT_STATUS.PENDING) {
      throw createHttpError(
        400,
        'Chỉ có thể xóa lời mời hoặc yêu cầu đang chờ'
      );
    }

    const actorIsNutritionist = isNutritionistParticipant(relation, actorId);
    const actorIsUser = isUserParticipant(relation, actorId);

    const canDeleteInvite =
      relation.initiatedBy === ROLE.NUTRITIONIST && actorIsNutritionist;
    const canDeleteRequest = relation.initiatedBy === ROLE.USER && actorIsUser;

    if (!canDeleteInvite && !canDeleteRequest) {
      throw createHttpError(
        403,
        'Chỉ người đã tạo lời mời hoặc yêu cầu mới có thể xóa'
      );
    }

    await relation.deleteOne();
  }
};
