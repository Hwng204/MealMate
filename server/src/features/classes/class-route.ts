import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  requireNutritionistMembership,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';
import { handleMultipleImagesUpload } from '~/shared/utils/multer';

import { ClassController } from './class-controller';
import {
  addClassMemberRequestSchema,
  createClassRequestSchema,
  updateClassRequestSchema,
  joinClassRequestSchema
} from './class-dto';

const router = Router();

// User endpoint to join class (must be before dynamic routes)
router.post(
  '/join',
  authenticate(),
  validate(joinClassRequestSchema.shape),
  asyncHandler(ClassController.joinClass)
);

// Nutritionist endpoints - require valid expert membership for class management
router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  validate(createClassRequestSchema.shape),
  asyncHandler(ClassController.createClass)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.viewNutritionistClasses)
);

router.get(
  '/my',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ClassController.viewMyClasses)
);

router.get(
  '/:id/my-progress',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ClassController.viewMyClassProgress)
);

router.get(
  '/:id/progress-photos',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ClassController.getMemberProgressPhotos)
);

router.post(
  '/:id/progress-photos',
  authenticate(),
  authorize([ROLE.USER]),
  handleMultipleImagesUpload('images', 10),
  asyncHandler(ClassController.uploadMemberProgressPhotos)
);

router.get(
  '/:id/members/:memberId/progress-photos',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.getMemberProgressPhotos)
);

router.get(
  '/:id',
  authenticate(),
  asyncHandler(ClassController.viewClassDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  validate(updateClassRequestSchema.shape),
  asyncHandler(ClassController.updateClass)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.deleteClass)
);

router.get(
  '/:id/members',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.viewClassMembers)
);

router.post(
  '/:id/members',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  validate(addClassMemberRequestSchema.shape),
  asyncHandler(ClassController.addClassMember)
);

router.delete(
  '/:id/members/:memberId',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.removeClassMember)
);

router.get(
  '/:id/members/:memberId/progress',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.viewMemberProgress)
);

router.post(
  '/:id/members/:memberId/weight',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  requireNutritionistMembership,
  asyncHandler(ClassController.addMemberWeight)
);

export default router;
