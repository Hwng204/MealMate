import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate,
  validateQuery
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { NutritionistClientController } from './nutritionist-client-controller';
import {
  createNutritionistClientInvitationSchema,
  createNutritionistClientRequestSchema,
  nutritionistClientQuerySchema,
  updateNutritionistClientStatusSchema
} from './nutritionist-client-dto';

const router = Router();

router.post(
  '/invitations',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(createNutritionistClientInvitationSchema.shape),
  asyncHandler(NutritionistClientController.inviteClient)
);

router.post(
  '/requests',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(createNutritionistClientRequestSchema.shape),
  asyncHandler(NutritionistClientController.requestNutritionist)
);

router.get(
  '/my-clients',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validateQuery(nutritionistClientQuerySchema.shape),
  asyncHandler(NutritionistClientController.viewMyClients)
);

router.get(
  '/my-clients/:userId',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(NutritionistClientController.viewMyClientDetail)
);

router.patch(
  '/:id/status',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateNutritionistClientStatusSchema.shape),
  asyncHandler(NutritionistClientController.updateStatus)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(NutritionistClientController.deleteRelation)
);

export default router;
