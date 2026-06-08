import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { ClassService } from './class-service';

export const ClassController = {
  createClass: async (req: Request, res: Response) => {
    const data = req.body;
    const nutritionistId = req.user!._id.toString();

    const result = await ClassService.createClass(nutritionistId, data);

    res
      .status(201)
      .json(ApiResponse.success('Tạo lớp học thành công', result));
  },

  viewNutritionistClasses: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const parsed = parseQuery(req.query);

    const result = await ClassService.viewNutritionistClasses(
      nutritionistId,
      parsed
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách lớp học thành công', result)
      );
  },

  viewMyClasses: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const parsed = parseQuery(req.query);

    const result = await ClassService.viewMyClasses(userId, parsed);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách sinh viên thành công', result)
      );
  },

  viewClassDetail: async (req: Request, res: Response) => {
    const classId = req.params.id;

    const result = await ClassService.viewClassDetail(classId);

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy thông tin lớp học thành công', result)
      );
  },

  joinClass: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const data = req.body;

    const result = await ClassService.joinClass(userId, data);

    res
      .status(200)
      .json(ApiResponse.success('Tham gia lớp học thành công', result));
  },

  removeClassMember: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const memberId = req.params.memberId;

    const result = await ClassService.removeClassMember(
      nutritionistId,
      classId,
      memberId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Xóa học viên khỏi lớp học thành công', result)
      );
  },

  addClassMember: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const data = req.body;

    const result = await ClassService.addClassMember(
      nutritionistId,
      classId,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Thêm học viên vào lớp học thành công', result));
  },

  viewClassMembers: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const parsed = parseQuery(req.query);

    const result = await ClassService.viewClassMembers(
      classId,
      nutritionistId,
      parsed
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy danh sách học viên thành công', result)
      );
  },

  viewMemberProgress: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const memberId = req.params.memberId;

    const result = await ClassService.viewMemberProgress(
      classId,
      memberId,
      nutritionistId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy tiến độ học viên thành công', result)
      );
  },

  addMemberWeight: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const memberId = req.params.memberId;
    const { weight } = req.body;

    const result = await ClassService.addMemberWeight(
      classId,
      memberId,
      nutritionistId,
      weight
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Thêm cân nặng thành công', result)
      );
  },

  updateClass: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;
    const data = req.body;

    const result = await ClassService.updateClass(classId, nutritionistId, data);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật lớp học thành công', result));
  },

  deleteClass: async (req: Request, res: Response) => {
    const nutritionistId = req.user!._id.toString();
    const classId = req.params.id;

    await ClassService.deleteClass(classId, nutritionistId);

    res
      .status(200)
      .json(ApiResponse.success('Xóa lớp học thành công'));
  },

  viewMyClassProgress: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const classId = req.params.id;

    const result = await ClassService.viewMyClassProgress(classId, userId);

    res
      .status(200)
      .json(ApiResponse.success('Lấy tiến độ lớp học thành công', result));
  },

  getMemberProgressPhotos: async (req: Request, res: Response) => {
    const dateStr = req.query.date as string;
    const requesterId = req.user!._id.toString();
    const requesterRole = req.user!.role;
    const classId = req.params.id;
    const memberId = (req.params.memberId as string) || requesterId;

    const result = await ClassService.getMemberProgressPhotos(
      classId,
      memberId,
      requesterId,
      requesterRole,
      dateStr
    );

    res.status(200).json(ApiResponse.success('Lấy ảnh tiến độ thành công', result));
  },

  uploadMemberProgressPhotos: async (req: Request, res: Response) => {
    const dateStr = req.query.date as string;
    const userId = req.user!._id.toString();
    const classId = req.params.id;
    const files = (req.files as Express.Multer.File[]) || [];

    const result = await ClassService.uploadMemberProgressPhotos(
      classId,
      userId,
      files,
      dateStr
    );

    res.status(200).json(ApiResponse.success('Tải ảnh thành công', result));
  }
};
