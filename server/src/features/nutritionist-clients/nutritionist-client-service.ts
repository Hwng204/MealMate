import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument } from 'mongoose';

import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';
import {
  NutritionistClientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { NutritionistClient } from '~/shared/database/models/nutritionist-client-model';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import type { User } from '~/shared/database/models/user-model';
import {
  buildVietnameseInsensitiveRegex,
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateNutritionistClientInvitationRequest,
  CreateNutritionistClientRequestRequest,
  UpdateNutritionistClientStatusRequest
} from './nutritionist-client-dto';
import { UserService } from '../users/user-service';
import type {
  UpdateAllergens,
  UpdateNutritionTarget,
  UpdatePhysicalStats,
  UpdateRestrictions
} from '../users/user-dto';

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

const normalizeWeightHistory = (
  weightRecord?: Array<{ weight?: number | null; date?: Date | string | null }>
) =>
  [...(weightRecord ?? [])]
    .filter(
      (
        item
      ): item is {
        weight: number;
        date: Date | string;
      } =>
        typeof item?.weight === 'number' &&
        Number.isFinite(item.weight) &&
        Boolean(item.date)
    )
    .map(item => ({
      weight: item.weight,
      date: new Date(item.date)
    }))
    .filter(item => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(item => ({
      weight: item.weight,
      date: item.date
    }));

const calculateCompletionRate = (completed: number, total: number) =>
  total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

const parseScheduleDate = (value: unknown) => {
  const date =
    value instanceof Date ? value : value ? new Date(value as string) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const extractCaloriesFromSchedule = (schedule: {
  meals?: Array<{
    dishes?: Array<{
      energy?: number | null;
    }>;
  }>;
}) =>
  (schedule.meals ?? []).reduce(
    (mealAcc, meal) =>
      mealAcc +
      (meal.dishes ?? []).reduce((dishAcc, dish) => {
        const energy =
          typeof dish.energy === 'number' && Number.isFinite(dish.energy)
            ? dish.energy
            : 0;
        return dishAcc + energy;
      }, 0),
    0
  );

const buildClientDashboard = (params: {
  user: Record<string, any>;
  relation: NutritionistClient;
  schedules: Array<Record<string, any>>;
}) => {
  const weightHistory = normalizeWeightHistory(params.user.weightRecord);
  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight
      : null;
  const bmi = computeBMI(params.user.height, currentWeight);
  const today = new Date();

  const overview = {
    totalSchedules: params.schedules.length,
    latestScheduleDate:
      params.schedules
        .map(schedule => parseScheduleDate(schedule.date))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
    currentWeight,
    bmi,
    targetCalories:
      typeof params.user.nutritionTarget?.caloriesTarget === 'number'
        ? params.user.nutritionTarget.caloriesTarget
        : null
  };

  const progress = params.schedules.reduce(
    (acc, schedule) => {
      const scheduleDate = parseScheduleDate(schedule.date);
      const isToday = scheduleDate ? isSameDay(scheduleDate, today) : false;
      const dishes = (schedule.meals ?? []).flatMap(
        (meal: { dishes?: Array<{ isEaten?: boolean }> }) => meal.dishes ?? []
      );
      const workoutItems = schedule.workout ?? [];

      const completedDishes = dishes.filter(
        (dish: { isEaten?: boolean }) => dish.isEaten
      ).length;
      const completedWorkouts = workoutItems.filter(
        (item: { isCompleted?: boolean }) => item.isCompleted
      ).length;

      acc.overall.totalDishes += dishes.length;
      acc.overall.completedDishes += completedDishes;
      acc.overall.totalWorkouts += workoutItems.length;
      acc.overall.completedWorkouts += completedWorkouts;
      acc.overall.totalCaloriesPlanned += extractCaloriesFromSchedule(schedule);

      if (isToday) {
        acc.today.totalDishes += dishes.length;
        acc.today.completedDishes += completedDishes;
        acc.today.totalWorkouts += workoutItems.length;
        acc.today.completedWorkouts += completedWorkouts;
        acc.today.totalCaloriesPlanned += extractCaloriesFromSchedule(schedule);
      }

      return acc;
    },
    {
      overall: {
        totalDishes: 0,
        completedDishes: 0,
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalCaloriesPlanned: 0
      },
      today: {
        totalDishes: 0,
        completedDishes: 0,
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalCaloriesPlanned: 0
      }
    }
  );

  return {
    relation: params.relation,
    profile: {
      _id: params.user._id,
      name: params.user.name,
      avatar: params.user.avatar,
      gender: params.user.gender,
      dob: params.user.dob,
      height: params.user.height,
      bodyfat: params.user.bodyfat,
      activityLevel: params.user.activityLevel,
      goal: params.user.goal,
      diet: params.user.diet,
      nutritionTarget: params.user.nutritionTarget,
      currentWeight,
      bmi
    },
    weightHistory,
    scheduleOverview: {
      ...overview,
      trackedNutrient: NUTRIENTS.NANG_LUONG
    },
    mealProgress: {
      overall: {
        totalDishes: progress.overall.totalDishes,
        completedDishes: progress.overall.completedDishes,
        completionRate: calculateCompletionRate(
          progress.overall.completedDishes,
          progress.overall.totalDishes
        ),
        totalCaloriesPlanned: progress.overall.totalCaloriesPlanned
      },
      today: {
        totalDishes: progress.today.totalDishes,
        completedDishes: progress.today.completedDishes,
        completionRate: calculateCompletionRate(
          progress.today.completedDishes,
          progress.today.totalDishes
        ),
        totalCaloriesPlanned: progress.today.totalCaloriesPlanned
      }
    },
    workoutProgress: {
      overall: {
        totalExercises: progress.overall.totalWorkouts,
        completedExercises: progress.overall.completedWorkouts,
        completionRate: calculateCompletionRate(
          progress.overall.completedWorkouts,
          progress.overall.totalWorkouts
        )
      },
      today: {
        totalExercises: progress.today.totalWorkouts,
        completedExercises: progress.today.completedWorkouts,
        completionRate: calculateCompletionRate(
          progress.today.completedWorkouts,
          progress.today.totalWorkouts
        )
      }
    }
  };
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);

const startOfWeek = (date: Date) => {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
};

const buildDateRange = (days: number) => {
  const today = new Date();
  const end = endOfDay(today);
  const start = startOfDay(new Date(today));
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
};

const buildDailyBuckets = (days: number) => {
  const { start } = buildDateRange(days);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: formatDayKey(date),
      mealsCompleted: 0,
      mealsTotal: 0,
      workoutsCompleted: 0,
      workoutsTotal: 0
    };
  });
};

const buildWeeklyBuckets = (start: Date, end: Date) => {
  const buckets: Array<{
    weekStart: Date;
    weekEnd: Date;
    mealsCompleted: number;
    mealsTotal: number;
    workoutsCompleted: number;
    workoutsTotal: number;
  }> = [];

  let cursor = startOfWeek(start);
  while (cursor <= end) {
    const weekStart = new Date(cursor);
    const weekEnd = endOfDay(new Date(cursor));
    weekEnd.setDate(weekEnd.getDate() + 6);
    buckets.push({
      weekStart,
      weekEnd: weekEnd > end ? end : weekEnd,
      mealsCompleted: 0,
      mealsTotal: 0,
      workoutsCompleted: 0,
      workoutsTotal: 0
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }

  return buckets;
};

const summarizeScheduleItems = (schedule: Record<string, any>) => {
  const meals = (schedule.meals ?? []) as Array<Record<string, any>>;
  const workout = (schedule.workout ?? []) as Array<Record<string, any>>;

  const dishes = meals.flatMap(meal => meal.dishes ?? []);
  const mealsCompleted = dishes.filter(dish => dish.isEaten).length;
  const mealsTotal = dishes.length;
  const workoutsCompleted = workout.filter(item => item.isCompleted).length;
  const workoutsTotal = workout.length;

  return {
    meals,
    workout,
    mealsCompleted,
    mealsTotal,
    workoutsCompleted,
    workoutsTotal
  };
};

const assertNutritionistCanManageClient = async (
  nutritionistId: string,
  userId: string
) => {
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
      'Bạn không có quyền quản lý học viên này'
    );
  }

  return relation;
};

const buildRelationKeywordFilter = (
  filter: Record<string, unknown>,
  field: 'user.name' | 'nutritionist.name'
) => {
  const nextFilter = { ...filter };
  const keyword =
    typeof nextFilter.keyword === 'string' ? nextFilter.keyword.trim() : '';

  delete nextFilter.keyword;

  if (keyword) {
    nextFilter[field] = buildVietnameseInsensitiveRegex(keyword, 'i');
  }

  return nextFilter;
};

const paginateRelations = async (params: {
  parsed: QueryOptions;
  baseFilter: Record<string, unknown>;
  keywordField: 'user.name' | 'nutritionist.name';
}) => {
  const options = buildPaginateOptions(params.parsed);
  const filter = buildRelationKeywordFilter(
    params.parsed.filter as Record<string, unknown>,
    params.keywordField
  );

  const result = await NutritionistClientModel.paginate(
    {
      ...filter,
      ...params.baseFilter
    },
    {
      ...options,
      sort: options.sort ?? { createdAt: -1 }
    }
  );

  return result as unknown as PaginateResponse<NutritionistClient>;
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

    return paginateRelations({
      parsed,
      baseFilter: { 'nutritionist._id': nutritionistId },
      keywordField: 'user.name'
    });
  },

  viewInbox: async (
    actorId: string,
    role: string,
    parsed: QueryOptions
  ): Promise<PaginateResponse<NutritionistClient>> => {
    assertValidObjectId(actorId, 'Định dạng ID người dùng không hợp lệ');

    if (role === ROLE.NUTRITIONIST) {
      return paginateRelations({
        parsed,
        baseFilter: {
          'nutritionist._id': actorId,
          initiatedBy: ROLE.USER
        },
        keywordField: 'user.name'
      });
    }

    return paginateRelations({
      parsed,
      baseFilter: {
        'user._id': actorId,
        initiatedBy: ROLE.NUTRITIONIST
      },
      keywordField: 'nutritionist.name'
    });
  },

  viewOutbox: async (
    actorId: string,
    role: string,
    parsed: QueryOptions
  ): Promise<PaginateResponse<NutritionistClient>> => {
    assertValidObjectId(actorId, 'Định dạng ID người dùng không hợp lệ');

    if (role === ROLE.NUTRITIONIST) {
      return paginateRelations({
        parsed,
        baseFilter: {
          'nutritionist._id': actorId,
          initiatedBy: ROLE.NUTRITIONIST
        },
        keywordField: 'user.name'
      });
    }

    return paginateRelations({
      parsed,
      baseFilter: {
        'user._id': actorId,
        initiatedBy: ROLE.USER
      },
      keywordField: 'nutritionist.name'
    });
  },

  viewMyClientDetail: async (nutritionistId: string, userId: string) => {
    const relation = await assertNutritionistCanManageClient(
      nutritionistId,
      userId
    );

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

  viewMyClientDashboard: async (nutritionistId: string, userId: string) => {
    const relation = await assertNutritionistCanManageClient(
      nutritionistId,
      userId
    );

    const [user, schedules] = await Promise.all([
      UserModel.findById(userId).select(BASIC_USER_PROFILE_SELECT).lean(),
      ScheduleModel.find({ 'user._id': userId })
        .select('date meals workout')
        .lean()
    ]);

    if (!user || user.role !== ROLE.USER) {
      throw createHttpError(404, 'Không tìm thấy học viên');
    }

    return buildClientDashboard({
      user,
      relation,
      schedules: schedules as Array<Record<string, any>>
    });
  },

  viewMyClientTracking: async (
    nutritionistId: string,
    userId: string,
    days = 7
  ) => {
    await assertNutritionistCanManageClient(nutritionistId, userId);

    const [user, schedules] = await Promise.all([
      UserModel.findById(userId).select(BASIC_USER_PROFILE_SELECT).lean(),
      ScheduleModel.find({
        'user._id': userId,
        date: {
          $gte: buildDateRange(days).start,
          $lte: buildDateRange(days).end
        }
      })
        .select('date meals workout')
        .lean()
    ]);

    if (!user || user.role !== ROLE.USER) {
      throw createHttpError(404, 'Không tìm thấy học viên');
    }

    const { start, end } = buildDateRange(days);
    const dailyBuckets = buildDailyBuckets(days);
    const dailyMap = new Map(dailyBuckets.map(item => [item.key, item]));
    const weeklyBuckets = buildWeeklyBuckets(start, end);

    const mealBreakdownMap = new Map<
      string,
      { mealType: string; totalDishes: number; completedDishes: number }
    >();
    const workoutBreakdownMap = new Map<
      string,
      { exerciseName: string; totalExercises: number; completedExercises: number }
    >();

    for (const schedule of schedules as Array<Record<string, any>>) {
      const scheduleDate = parseScheduleDate(schedule.date);
      if (!scheduleDate) continue;

      const summary = summarizeScheduleItems(schedule);
      const dayKey = formatDayKey(scheduleDate);
      const dailyBucket = dailyMap.get(dayKey);
      if (dailyBucket) {
        dailyBucket.mealsCompleted += summary.mealsCompleted;
        dailyBucket.mealsTotal += summary.mealsTotal;
        dailyBucket.workoutsCompleted += summary.workoutsCompleted;
        dailyBucket.workoutsTotal += summary.workoutsTotal;
      }

      const weekBucket = weeklyBuckets.find(
        bucket => scheduleDate >= bucket.weekStart && scheduleDate <= bucket.weekEnd
      );
      if (weekBucket) {
        weekBucket.mealsCompleted += summary.mealsCompleted;
        weekBucket.mealsTotal += summary.mealsTotal;
        weekBucket.workoutsCompleted += summary.workoutsCompleted;
        weekBucket.workoutsTotal += summary.workoutsTotal;
      }

      for (const meal of summary.meals) {
        const mealType = meal.mealType ?? 'Unknown';
        const entry = mealBreakdownMap.get(mealType) ?? {
          mealType,
          totalDishes: 0,
          completedDishes: 0
        };
        const dishes = (meal.dishes ?? []) as Array<{ isEaten?: boolean }>;
        entry.totalDishes += dishes.length;
        entry.completedDishes += dishes.filter(dish => dish.isEaten).length;
        mealBreakdownMap.set(mealType, entry);
      }

      for (const workoutItem of summary.workout as Array<{
        exerciseName?: string;
        isCompleted?: boolean;
      }>) {
        const exerciseName = workoutItem.exerciseName ?? 'Unknown';
        const entry = workoutBreakdownMap.get(exerciseName) ?? {
          exerciseName,
          totalExercises: 0,
          completedExercises: 0
        };
        entry.totalExercises += 1;
        if (workoutItem.isCompleted) {
          entry.completedExercises += 1;
        }
        workoutBreakdownMap.set(exerciseName, entry);
      }
    }

    return {
      range: {
        days,
        startDate: start,
        endDate: end
      },
      profile: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        goal: user.goal,
        currentWeight: computeCurrentWeight(user.weightRecord),
        bmi: computeBMI(user.height, computeCurrentWeight(user.weightRecord))
      },
      weightProgress: normalizeWeightHistory(user.weightRecord).filter(item => {
        const date = new Date(item.date);
        return date >= start && date <= end;
      }),
      dailyAdherence: dailyBuckets.map(item => ({
        date: item.date,
        mealsCompleted: item.mealsCompleted,
        mealsTotal: item.mealsTotal,
        mealCompletionRate: calculateCompletionRate(
          item.mealsCompleted,
          item.mealsTotal
        ),
        workoutsCompleted: item.workoutsCompleted,
        workoutsTotal: item.workoutsTotal,
        workoutCompletionRate: calculateCompletionRate(
          item.workoutsCompleted,
          item.workoutsTotal
        )
      })),
      weeklyAdherence: weeklyBuckets.map(item => ({
        weekStart: item.weekStart,
        weekEnd: item.weekEnd,
        mealsCompleted: item.mealsCompleted,
        mealsTotal: item.mealsTotal,
        mealCompletionRate: calculateCompletionRate(
          item.mealsCompleted,
          item.mealsTotal
        ),
        workoutsCompleted: item.workoutsCompleted,
        workoutsTotal: item.workoutsTotal,
        workoutCompletionRate: calculateCompletionRate(
          item.workoutsCompleted,
          item.workoutsTotal
        )
      })),
      mealBreakdown: Array.from(mealBreakdownMap.values()).map(item => ({
        ...item,
        missedDishes: item.totalDishes - item.completedDishes,
        completionRate: calculateCompletionRate(
          item.completedDishes,
          item.totalDishes
        )
      })),
      workoutBreakdown: Array.from(workoutBreakdownMap.values()).map(item => ({
        ...item,
        missedExercises: item.totalExercises - item.completedExercises,
        completionRate: calculateCompletionRate(
          item.completedExercises,
          item.totalExercises
        )
      }))
    };
  },

  updateClientPhysicalStats: async (
    nutritionistId: string,
    userId: string,
    data: UpdatePhysicalStats
  ) => {
    await assertNutritionistCanManageClient(nutritionistId, userId);
    return UserService.updateProfile(userId, data);
  },

  updateClientNutritionTarget: async (
    nutritionistId: string,
    userId: string,
    data: UpdateNutritionTarget
  ) => {
    await assertNutritionistCanManageClient(nutritionistId, userId);
    return UserService.updateProfile(userId, data);
  },

  updateClientRestrictions: async (
    nutritionistId: string,
    userId: string,
    data: UpdateRestrictions
  ) => {
    await assertNutritionistCanManageClient(nutritionistId, userId);
    return UserService.updateProfile(userId, data);
  },

  updateClientAllergens: async (
    nutritionistId: string,
    userId: string,
    data: UpdateAllergens
  ) => {
    await assertNutritionistCanManageClient(nutritionistId, userId);
    return UserService.updateProfile(userId, data);
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
