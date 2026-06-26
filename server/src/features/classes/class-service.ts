import { randomUUID } from 'crypto';
import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { PaginateResult } from 'mongoose';

import {
  ClassModel,
  UserModel,
  ScheduleModel,
  ClassMemberPhotoModel,
  MAX_CLASS_MEMBER_PHOTOS
} from '~/shared/database/models';
import { uploadImage } from '~/shared/utils/cloudinary';
import type { Class } from '~/shared/database/models/class-model';
import { isExpertMembership, NUTRITIONIST_CLIENT_LIMITS } from '~/shared/constants/membership-level';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';
import {
  buildPaginateOptions,
  validateObjectId
} from '~/shared/utils';

import type {
  AddClassMemberRequest,
  CreateClassRequest,
  UpdateClassRequest,
  JoinClassRequest
} from './class-dto';

type ScheduleLike = {
  meals?: Array<{ dishes?: Array<{ isEaten?: boolean }> }>;
  workout?: Array<{ isCompleted?: boolean }>;
};

const calculateCompletionPercent = (schedules: ScheduleLike[]) => {
  let total = 0;
  let done = 0;

  for (const schedule of schedules) {
    for (const meal of schedule.meals || []) {
      for (const dish of meal.dishes || []) {
        total += 1;
        if (dish.isEaten) done += 1;
      }
    }
    for (const exercise of schedule.workout || []) {
      total += 1;
      if (exercise.isCompleted) done += 1;
    }
  }

  return total ? Math.round((done / total) * 100) : 0;
};

const countMealSchedules = (schedules: ScheduleLike[]) =>
  schedules.filter(schedule =>
    schedule.meals?.some(meal => (meal.dishes?.length || 0) > 0)
  ).length;

const countWorkoutSchedules = (schedules: ScheduleLike[]) =>
  schedules.filter(schedule => (schedule.workout?.length || 0) > 0).length;

const buildMemberProgressPayload = async (memberId: string) => {
  const member = await UserModel.findById(memberId)
    .select(
      'name email avatar weightRecord goal height bodyfat gender dob diet allergens blockDishes aiTokens aiDailyTokenLimit nutritionTarget membershipLevel assignedNutritionist'
    )
    .populate('blockDishes', 'name image');

  if (!member) {
    throw createHttpError(404, 'Không tìm thấy học viên');
  }

  const memberSchedules = await ScheduleModel.find({
    'user._id': memberId
  }).select('meals workout createdAt');

  const mealScheduleCount = countMealSchedules(memberSchedules);
  const workoutScheduleCount = countWorkoutSchedules(memberSchedules);
  const completionPercent = calculateCompletionPercent(memberSchedules);

  const lastSchedule = [...memberSchedules].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  )[0];

  const sortedWeightRecord = [...(member.weightRecord || [])].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );

  return {
    member,
    scheduleCount: memberSchedules.length,
    mealScheduleCount,
    workoutScheduleCount,
    completionPercent,
    lastScheduleDate: lastSchedule?.createdAt || null,
    latestWeight: sortedWeightRecord[sortedWeightRecord.length - 1] || null,
    weightRecord: sortedWeightRecord,
    goal: member.goal
  };
};

const assertClassMember = async (classId: string, memberId: string) => {
  const classDoc = await ClassModel.findById(classId);
  if (!classDoc) {
    throw createHttpError(404, 'Không tìm thấy lớp học');
  }
  if (!classDoc.members.some(id => id.toString() === memberId)) {
    throw createHttpError(404, 'Học viên không thuộc lớp học này');
  }
  return classDoc;
};

// Generate a unique class code using UUID v4
function generateClassCode(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
}

export const ClassService = {
  createClass: async (
    nutritionistId: string,
    data: CreateClassRequest
  ): Promise<Class> => {
    if (!validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID chuyên gia không hợp lệ');
    }

    const nutritionist = await UserModel.findById(nutritionistId);
    if (!nutritionist) {
      throw createHttpError(404, 'Không tìm thấy chuyên gia');
    }

    if (nutritionist.role !== 'Nutritionist') {
      throw createHttpError(403, 'Chỉ chuyên gia mới có thể tạo lớp học');
    }

    if (!isExpertMembership(nutritionist.membershipLevel)) {
      throw createHttpError(403, 'Bạn cần mua gói chuyên gia để tạo lớp học');
    }

    const MAX_CODE_ATTEMPTS = 5;
    let attempts = 0;
    let newClass;

    while (attempts < MAX_CODE_ATTEMPTS) {
      const classCode = generateClassCode();

      try {
        newClass = await ClassModel.create({
          ...data,
          nutritionistId,
          classCode
        });
        break;
      } catch (error: any) {
        const isDuplicateKeyError =
          error?.code === 11000 &&
          /classCode/.test(error.message);

        if (isDuplicateKeyError) {
          attempts += 1;
          continue;
        }

        throw error;
      }
    }

    if (!newClass) {
      throw createHttpError(
        500,
        'Không thể tạo mã lớp học. Vui lòng thử lại.'
      );
    }

    eventBus.emit(EVENTS.CLASS_CREATED, {
      classId: newClass._id.toString(),
      nutritionistId
    });

    return newClass;
  },

  viewNutritionistClasses: async (
    nutritionistId: string,
    parsed: QueryOptions
  ): Promise<PaginateResult<Class>> => {
    if (!validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID chuyên gia không hợp lệ');
    }

    const { filter = {} } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await ClassModel.paginate(
      { ...filter, nutritionistId },
      { ...options, populate: [] }
    );

    return result;
  },

  viewMyClasses: async (
    userId: string,
    parsed: QueryOptions
  ): Promise<PaginateResult<Class>> => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const { filter = {} } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await ClassModel.paginate(
      { ...filter, members: userId },
      {
        ...options,
        populate: [{ path: 'nutritionistId', select: 'name email avatar' }]
      }
    );

    return result;
  },

  viewClassDetail: async (classId: string) => {
    if (!validateObjectId(classId)) {
      throw createHttpError(400, 'Định dạng ID lớp học không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId)
      .populate({
        path: 'members',
        select: 'name email avatar role'
      })
      .populate({
        path: 'nutritionistId',
        select: 'name email avatar'
      });

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    return classDoc;
  },

  joinClass: async (userId: string, data: JoinClassRequest) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const classDoc = await ClassModel.findOne({ classCode: data.classCode });

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học với mã này');
    }

    // Check if user is already in the class
    if (classDoc.members.includes(userId as any)) {
      throw createHttpError(409, 'Bạn đã tham gia lớp học này');
    }

    // Check membership limit for nutritionist
    const nutritionist = await UserModel.findById(classDoc.nutritionistId);
    if (nutritionist && isExpertMembership(nutritionist.membershipLevel)) {
      const maxClients = NUTRITIONIST_CLIENT_LIMITS[nutritionist.membershipLevel];

      // Count total members across all classes of this nutritionist
      const allClasses = await ClassModel.find({ nutritionistId: classDoc.nutritionistId });
      const totalMembers = allClasses.reduce((sum, cls) => sum + (cls.members?.length || 0), 0);

      if (totalMembers >= maxClients) {
        throw createHttpError(
          403,
          `Lớp học đã đạt giới hạn ${maxClients} học viên cho gói hiện tại`
        );
      }
    }

    // Add user to class members
    classDoc.members.push(userId as any);
    await classDoc.save();

    // Add class to user's enrolled classes
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledClasses: classDoc._id } },
      { new: true }
    );

    eventBus.emit(EVENTS.CLASS_MEMBER_ADDED, {
      classId: classDoc._id.toString(),
      userId
    });

    return classDoc.populate({
      path: 'members',
      select: 'name email avatar role'
    });
  },

  addClassMember: async (
    nutritionistId: string,
    classId: string,
    data: AddClassMemberRequest
  ) => {
    if (!validateObjectId(nutritionistId) || !validateObjectId(classId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền quản lý lớp học này');
    }

    const nutritionist = await UserModel.findById(nutritionistId);
    if (!nutritionist || !isExpertMembership(nutritionist.membershipLevel)) {
      throw createHttpError(403, 'Bạn cần mua gói chuyên gia để thêm học viên');
    }

    if (!data.userId && !data.email) {
      throw createHttpError(400, 'Vui lòng cung cấp userId hoặc email học viên');
    }

    if (data.userId && !validateObjectId(data.userId)) {
      throw createHttpError(400, 'Định dạng ID học viên không hợp lệ');
    }

    const member = data.userId
      ? await UserModel.findById(data.userId).select('_id role')
      : await UserModel.findOne({ email: data.email }).select('_id role');

    if (!member) {
      throw createHttpError(404, 'Không tìm thấy học viên');
    }

    if (member.role !== 'User') {
      throw createHttpError(400, 'Chỉ có thể thêm tài khoản người dùng vào lớp');
    }

    const memberId = member._id.toString();
    if (classDoc.members.some(item => item.toString() === memberId)) {
      throw createHttpError(409, 'Học viên đã thuộc lớp học này');
    }

    const maxClients = NUTRITIONIST_CLIENT_LIMITS[nutritionist.membershipLevel];

    // Count total members across all classes of this nutritionist
    const allClasses = await ClassModel.find({ nutritionistId });
    const totalMembers = allClasses.reduce((sum, cls) => sum + (cls.members?.length || 0), 0);

    // Check if adding this member would exceed the limit
    if (totalMembers >= maxClients) {
      throw createHttpError(
        403,
        `Bạn đã đạt giới hạn ${maxClients} học viên cho gói hiện tại`
      );
    }

    classDoc.members.push(member._id);
    await classDoc.save();

    await UserModel.findByIdAndUpdate(memberId, {
      $addToSet: { enrolledClasses: classDoc._id }
    });

    eventBus.emit(EVENTS.CLASS_MEMBER_ADDED, {
      classId: classDoc._id.toString(),
      userId: memberId
    });

    return classDoc.populate({
      path: 'members',
      select: 'name email avatar role'
    });
  },

  removeClassMember: async (
    nutritionistId: string,
    classId: string,
    memberId: string
  ) => {
    if (!validateObjectId(nutritionistId) || !validateObjectId(classId) || !validateObjectId(memberId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền quản lý lớp học này');
    }

    if (!classDoc.members.includes(memberId as any)) {
      throw createHttpError(404, 'Học viên không thuộc lớp học này');
    }

    classDoc.members = classDoc.members.filter(
      (m) => m.toString() !== memberId
    );
    await classDoc.save();

    await UserModel.findByIdAndUpdate(
      memberId,
      { $pull: { enrolledClasses: classDoc._id } },
      { new: true }
    );

    eventBus.emit(EVENTS.CLASS_MEMBER_REMOVED, {
      classId: classDoc._id.toString(),
      memberId
    });

    return classDoc.populate({
      path: 'members',
      select: 'name email avatar role'
    });
  },

  viewClassMembers: async (classId: string, nutritionistId: string, parsed: QueryOptions) => {
    if (!validateObjectId(classId) || !validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền xem thông tin lớp học này');
    }

    const options = buildPaginateOptions(parsed);

    const memberIds = classDoc.members.map(id => id.toString());

    const members = await UserModel.find({
      _id: { $in: classDoc.members }
    })
      .select('name email avatar role dob height')
      .limit(options.limit)
      .skip(options.skip || 0);

    const memberSchedules = await ScheduleModel.find({
      'user._id': { $in: memberIds }
    }).select('user._id meals workout');

    const progressByMember = memberIds.reduce<Record<string, number>>(
      (acc, memberId) => {
        const schedules = memberSchedules.filter(
          schedule => schedule.user?._id?.toString() === memberId
        );
        acc[memberId] = calculateCompletionPercent(schedules);
        return acc;
      },
      {}
    );

    const docsWithProgress = members.map(member => ({
      ...member.toObject(),
      completionPercent: progressByMember[member._id.toString()] ?? 0
    }));

    const total = classDoc.members.length;

    return {
      docs: docsWithProgress,
      totalDocs: total,
      totalPages: Math.ceil(total / (options.limit || 10)),
      page: (options.skip || 0) / (options.limit || 10) + 1,
      hasNextPage: ((options.skip || 0) + (options.limit || 10)) < total,
      hasPrevPage: (options.skip || 0) > 0
    };
  },

  viewMemberProgress: async (
    classId: string,
    memberId: string,
    nutritionistId: string
  ) => {
    if (!validateObjectId(classId) || !validateObjectId(memberId) || !validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền xem thông tin này');
    }

    if (!classDoc.members.includes(memberId as any)) {
      throw createHttpError(404, 'Học viên không thuộc lớp học này');
    }

    return buildMemberProgressPayload(memberId);
  },

  viewMyClassProgress: async (classId: string, userId: string) => {
    if (!validateObjectId(classId) || !validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    await assertClassMember(classId, userId);
    return buildMemberProgressPayload(userId);
  },

  addMemberWeight: async (
    classId: string,
    memberId: string,
    nutritionistId: string,
    weight: number
  ) => {
    if (!validateObjectId(classId) || !validateObjectId(memberId) || !validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    if (typeof weight !== 'number' || weight <= 0) {
      throw createHttpError(400, 'Cân nặng không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật thông tin này');
    }

    if (!classDoc.members.includes(memberId as any)) {
      throw createHttpError(404, 'Học viên không thuộc lớp học này');
    }

    const member = await UserModel.findById(memberId);

    if (!member) {
      throw createHttpError(404, 'Không tìm thấy học viên');
    }

    member.weightRecord.push({
      weight,
      date: new Date()
    });

    await member.save();

    return member.weightRecord;
  },

  updateClass: async (
    classId: string,
    nutritionistId: string,
    data: UpdateClassRequest
  ) => {
    if (!validateObjectId(classId) || !validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền chỉnh sửa lớp học này');
    }

    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      data,
      { new: true }
    );

    eventBus.emit(EVENTS.CLASS_UPDATED, {
      classId: updatedClass?._id.toString()
    });

    return updatedClass;
  },

  deleteClass: async (classId: string, nutritionistId: string) => {
    if (!validateObjectId(classId) || !validateObjectId(nutritionistId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await ClassModel.findById(classId);

    if (!classDoc) {
      throw createHttpError(404, 'Không tìm thấy lớp học');
    }

    if (classDoc.nutritionistId.toString() !== nutritionistId) {
      throw createHttpError(403, 'Bạn không có quyền xóa lớp học này');
    }

    classDoc.isActive = false;
    await classDoc.save();

    eventBus.emit(EVENTS.CLASS_DELETED, {
      classId: classDoc._id.toString(),
      nutritionistId
    });

    return classDoc;
  },

  getMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    requesterId: string,
    requesterRole: string,
    dateStr?: string
  ) => {
    if (
      !validateObjectId(classId) ||
      !validateObjectId(memberId) ||
      !validateObjectId(requesterId)
    ) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    const classDoc = await assertClassMember(classId, memberId);

    const isMember = memberId === requesterId;
    const isClassNutritionist =
      requesterRole === 'Nutritionist' &&
      classDoc.nutritionistId.toString() === requesterId;

    if (!isMember && !isClassNutritionist) {
      throw createHttpError(403, 'Bạn không có quyền xem ảnh này');
    }

    const targetDate = dateStr || new Date().toLocaleDateString('en-CA');
    const doc = await ClassMemberPhotoModel.findOne({ classId, memberId, date: targetDate });
    return {
      images: doc?.images || [],
      maxPhotos: MAX_CLASS_MEMBER_PHOTOS
    };
  },

  uploadMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    files: Express.Multer.File[],
    dateStr?: string
  ) => {
    if (!validateObjectId(classId) || !validateObjectId(memberId)) {
      throw createHttpError(400, 'Định dạng ID không hợp lệ');
    }

    await assertClassMember(classId, memberId);

    if (!files?.length) {
      throw createHttpError(400, 'Vui lòng chọn ít nhất một ảnh');
    }

    const targetDate = dateStr || new Date().toLocaleDateString('en-CA');
    let doc = await ClassMemberPhotoModel.findOne({ classId, memberId, date: targetDate });
    const currentCount = doc?.images?.length || 0;

    if (currentCount >= MAX_CLASS_MEMBER_PHOTOS) {
      throw createHttpError(
        400,
        `Bạn chỉ có thể gửi tối đa ${MAX_CLASS_MEMBER_PHOTOS} ảnh trong ngày này`
      );
    }

    const remaining = MAX_CLASS_MEMBER_PHOTOS - currentCount;
    const filesToUpload = files.slice(0, remaining);

    const newImages: { url: string; uploadedAt: Date }[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const uploadResult = await uploadImage(file.buffer, {
        folder: 'class-progress-photos',
        public_id: `${classId}-${memberId}-${targetDate}-${Date.now()}-${i}`
      });

      if (!uploadResult.success || !uploadResult.data) {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }

      newImages.push({
        url: uploadResult.data.secure_url,
        uploadedAt: new Date()
      });
    }

    if (!doc) {
      doc = await ClassMemberPhotoModel.create({
        classId,
        memberId,
        date: targetDate,
        images: newImages
      });
    } else {
      doc.images.push(...newImages);
      await doc.save();
    }

    return {
      images: doc.images,
      maxPhotos: MAX_CLASS_MEMBER_PHOTOS
    };
  }
};